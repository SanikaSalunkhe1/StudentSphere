const Student = require("../models/Student");
const Activity = require("../models/Activity");
const Achievement = require("../models/Achievement");
const Internship = require("../models/Internship");
const DivisionIncharge = require("../models/DivisionIncharge");
const { Groq } = require("groq-sdk");
const sendEmailBrevo = require("../services/sendEmailBrevo");

exports.getHeatmapData = async (req, res) => {
  try {
    let year = req.query.year;
    let division = req.query.division;

    // Determine context based on user role
    if (req.user.role === "divisionIncharge" || req.user.role === "division") {
      const incharge = await DivisionIncharge.findById(req.user.id);
      if (!incharge) return res.status(404).json({ message: "Incharge not found" });
      year = incharge.year;
      division = incharge.division;
    }

    let query = {};
    if (year && year !== "All") query.year = year;
    if (division && division !== "All") query.division = division;

    // Fetch students using lean() for performance
    const students = await Student.find(query)
      .select("name studentID PRN email isAtRisk studentPhoto.url mobileNo dob bloodGroup currentAddress nativeAddress")
      .lean();

    if (students.length === 0) {
      return res.json({ students: [], metrics: { total: 0, withInternships: 0, zeroEntries: 0, incompleteProfiles: 0 } });
    }

    const studentIds = students.map((s) => s._id);

    // Run parallel counts for each relevant model grouped by student
    const [activities, achievements, internships] = await Promise.all([
      Activity.aggregate([{ $match: { stuID: { $in: studentIds } } }, { $group: { _id: "$stuID", count: { $sum: 1 } } }]),
      Achievement.aggregate([{ $match: { stuID: { $in: studentIds } } }, { $group: { _id: "$stuID", count: { $sum: 1 } } }]),
      Internship.aggregate([{ $match: { stuID: { $in: studentIds } } }, { $group: { _id: "$stuID", count: { $sum: 1 } } }]),
    ]);

    // Fast lookup maps
    const actMap = new Map(activities.map((a) => [a._id.toString(), a.count]));
    const achMap = new Map(achievements.map((a) => [a._id.toString(), a.count]));
    const intMap = new Map(internships.map((a) => [a._id.toString(), a.count]));

    let withInternships = 0;
    let zeroEntries = 0;
    let incompleteProfilesCount = 0;

    const enrichedStudents = students.map((stu) => {
      const idStr = stu._id.toString();
      const acts = actMap.get(idStr) || 0;
      const achs = achMap.get(idStr) || 0;
      const ints = intMap.get(idStr) || 0;

      const totalEntries = acts + achs + ints;
      let status = "red"; // defaults to red
      if (totalEntries >= 2) status = "green";
      else if (totalEntries === 1) status = "yellow";

      if (ints > 0) withInternships++;
      if (totalEntries === 0) zeroEntries++;

      // Check if profile is incomplete safely
      const mobile = String(stu.mobileNo || "");
      const bg = String(stu.bloodGroup || "");
      const prn = String(stu.PRN || "");
      const sid = String(stu.studentID || "");
      
      const isComplete = Boolean(
        mobile.trim() && 
        stu.dob && 
        bg.trim() && 
        prn.trim() &&
        sid.trim()
      );
      const isProfileIncomplete = !isComplete;
      
      console.log(`Student ${stu.name?.firstName}: complete=${isComplete} (mobile=${stu.mobileNo}, dob=${stu.dob}) -> Incomplete: ${isProfileIncomplete}`);
      
      if (isProfileIncomplete) incompleteProfilesCount++;

      return {
        ...stu,
        counts: { activities: acts, achievements: achs, internships: ints, total: totalEntries },
        status,
        isProfileIncomplete
      };
    });

    res.json({
      students: enrichedStudents,
      metrics: {
        total: students.length,
        withInternships,
        zeroEntries,
        incompleteProfilesCount,
        year,
        division
      }
    });

  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getHeatmapInsight = async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.error("GROQ_API_KEY is missing from environment variables.");
      return res.json({ insight: "AI Insights currently unavailable (No API Key configured)." });
    }

    const groq = new Groq({ apiKey: groqKey });

    const { total, withInternships, zeroEntries, year, division } = req.body;
    
    if (!total && total !== 0) {
      return res.status(400).json({ message: "Metrics missing" });
    }

    const percentageInt = total > 0 ? ((withInternships / total) * 100).toFixed(0) : 0;

    const prompt = `You are an AI assistant for a college administration dashboard. Write a single, punchy, professional sentence summarizing this division's student profile completeness data.
Data:
Year/Div: ${year} ${division}
Total Students: ${total}
Students with Internships: ${withInternships} (${percentageInt}%)
Students with ZERO entries (At-Risk): ${zeroEntries}

The format should be similar to: "This division has 48 students, 25% with internships — 7 students have zero entries."
Do not include any extra pleasantries or markdown. Just the single sentence summary.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 100,
    });

    const insight = chatCompletion.choices[0]?.message?.content?.trim() || "No insight generated.";
    
    res.json({ insight });
  } catch (error) {
    console.error("Groq API error details:", error);
    res.status(500).json({ message: "Failed to generate AI insight" });
  }
};

exports.toggleRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isAtRisk = !student.isAtRisk;
    await student.save();

    res.json({ message: "Risk status updated", isAtRisk: student.isAtRisk });
  } catch (error) {
    console.error("Toggle risk error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendNudgeEmail = async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, counts, isProfileIncomplete } = req.body;

    if (!studentEmail) {
      return res.status(400).json({ message: "Student email is required for nudging." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ message: "Groq API key not configured." });
    }

    const groq = new Groq({ apiKey: groqKey });

    const role = req.user.role;
    const roleLabel = (role === "admin") ? "Admin" : "Division Incharge";

    const prompt = `You are a helpful college ${roleLabel}. Write a short, encouraging, and professional email to a student named ${studentName}. 
The student has an incomplete profile on the StudentSphere platform.
Current Logs:
- Internships: ${counts.internships}
- Activities: ${counts.activities}
- Achievements: ${counts.achievements}

${incompleteText}

Encourage them to update their platform data so they are documented correctly for NAAC/NBA accreditation. 
Keep it under 100 words. Use a friendly tone. 
Include a subject line at the top starting with "Subject: ".
Sign the email as "${roleLabel}". Do not use placeholders like "[Your Name]".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 200,
    });


    const aiResponse = chatCompletion.choices[0]?.message?.content?.trim() || "";
    
    // Split subject and body
    let subject = "Action Required: Update your StudentSphere Profile";
    let body = aiResponse;

    if (aiResponse.includes("Subject:")) {
      const lines = aiResponse.split("\n");
      const subLine = lines.find(l => l.startsWith("Subject:"));
      if (subLine) {
        subject = subLine.replace("Subject:", "").trim();
        body = lines.filter(l => !l.startsWith("Subject:")).join("\n").trim();
      }
    }

    // Convert newlines to HTML for Brevo
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">StudentSphere Notification</h2>
        <div style="white-space: pre-line;">
          ${body}
        </div>
        <br>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">Best Regards,<br><strong>${roleLabel} - StudentSphere Team</strong></p>
      </div>
    `;

    await sendEmailBrevo({
      toEmail: studentEmail,
      subject: subject,
      htmlContent: htmlContent
    });

    res.json({ message: "Nudge email sent successfully!" });
  } catch (error) {
    console.error("Nudge error:", error);
    res.status(500).json({ message: "Failed to send nudge email." });
  }
};
