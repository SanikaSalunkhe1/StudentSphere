import React, { useState } from "react";
import { reportService } from "../services/reportService";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function AccreditationReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAccreditationReport({ year, branch });
      setData(res.data);
      toast.success("Report data loaded successfully!");
    } catch (error) {
      toast.error("Failed to load report data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!data) return toast.error("No data to export!");
    try {
      setExporting(true);
      toast.info("Generating PDF, please wait...");
      const input = document.getElementById("report-content");
      
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Accreditation_Report_${branch || "All"}_${year || "All"}.pdf`);
      toast.success("PDF Generated Successfully!");
    } catch (error) {
      console.error("PDF Gen Error:", error);
      toast.error(`Failed to generate PDF: ${error?.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-serif">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-sans">NAAC/NBA Accreditation Reports</h1>
        <button 
          onClick={generatePDF} 
          disabled={exporting || !data}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow disabled:opacity-50 hover:bg-blue-700 transition font-sans"
        >
          {exporting ? "Generating..." : "Download as PDF"}
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-4 items-end mb-6 font-sans">
        <div>
          <label className="block text-sm font-bold text-slate-700">Academic Year</label>
          <input 
            type="text" 
            placeholder="e.g. 2024-2025" 
            className="border p-2 rounded w-full"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-bold text-slate-700">Branch</label>
          <select 
            className="border p-2 rounded w-full"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="Computer">Computer</option>
          </select>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition disabled:opacity-50 font-semibold"
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {data && (
        <div id="report-content" className="bg-white text-black p-10 max-w-4xl mx-auto shadow-lg" style={{ minHeight: '1122px', fontSize: '12pt', lineHeight: '1.5' }}>
          
          {/* TITLE PAGE */}
          <div className="text-center mb-16 border-b-4 border-black pb-8">
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wide">Nagar Yuwak Shikshan Santha, Airoli’s</h4>
            <h1 className="text-3xl font-extrabold text-red-900 mb-2 uppercase tracking-wider font-sans">Datta Meghe College of Engineering</h1>
            <p className="text-sm font-semibold mb-2">(Recognized by AICTE, DTE, Govt of Maharashtra & Affiliated To University of Mumbai)</p>
            <p className="text-sm font-bold mb-6 text-blue-900">NAAC (Cycle 2) ‘A’ Grade Accredited, NBA accredited (Chemical Engg. & Civil Engg.)</p>
            
            <div className="my-10">
              <h2 className="text-2xl font-bold uppercase underline decoration-2 underline-offset-4">Institutional Accreditation Report</h2>
              <h3 className="text-xl font-bold mt-4 tracking-wide text-gray-800">CSI CATT {year || "2025-26"}</h3>
            </div>
            
            <div className="mt-8 text-lg font-semibold text-gray-700">
              <p>Prepared for: NAAC / NBA Evaluators</p>
              <p className="mt-2">Department: {branch ? branch + " Engineering" : "All Departments"}</p>
              <p className="mt-2">Date of Report: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* INTRODUCTION */}
          <div className="mb-10 text-justify">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">1. Introduction</h3>
            <p>
              This report provides a comprehensive summary of student performance, career growth, and academic achievements for the specified academic period. Designed to meet the stringent guidelines of NAAC and NBA accreditation processes, the document highlights criterion-wise statistical data pertaining to student demographics, placement successes, internship participations, and overarching achievements. The data presented herein forms a crucial component of the institution's continuous quality improvement and evaluation cycle.
            </p>
          </div>

          {/* CRITERION 1: DEMOGRAPHICS */}
          <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">2. Criterion 1: Student Demographics</h3>
            <p className="mb-4">
              The following table summarizes the enrollment and diversity of students within the department. This demographic analysis plays a pivotal role in understanding the reach and inclusive educational environment provided.
            </p>
            <table className="w-full border-collapse border border-black text-center text-sm mb-4 page-break-inside-avoid">
                <thead>
                    <tr className="bg-gray-200 uppercase text-xs font-bold font-sans">
                        <th className="border border-black p-2">Category</th>
                        <th className="border border-black p-2">Total Students Count</th>
                    </tr>
                </thead>
                <tbody>
                    {data.demographics.categories.map((c, idx) => (
                    <tr key={idx}>
                        <td className="border border-black p-2 font-semibold font-sans">{c._id || "Unspecified"}</td>
                        <td className="border border-black p-2">{c.count}</td>
                    </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                        <td className="border border-black p-2 uppercase text-right pr-4 font-sans">Overall Strength</td>
                        <td className="border border-black p-2 text-lg">{data.demographics.total}</td>
                    </tr>
                </tbody>
            </table>
            <p className="text-sm italic text-gray-600 mt-2">Observation: The demographic distribution illustrates the overall admitted capacity of the evaluated batches.</p>
          </div>

          {/* CRITERION 2: PLACEMENTS */}
          <div className="mb-10">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">3. Criterion 2: Placements & Career Growth</h3>
            <p className="mb-4">
              A key indicator of academic excellence and industry readiness is the placement record. This section outlines the employment statistics and salary structures achieved by the graduating cohorts.
            </p>
            <div className="flex gap-4 justify-between mb-6 page-break-inside-avoid">
               <div className="border border-black p-4 w-1/3 bg-gray-50 text-center">
                  <div className="text-xs font-bold uppercase mb-1">Total Placed</div>
                  <div className="text-2xl font-bold text-blue-900">{data.placements.stats.totalPlaced}</div>
               </div>
               <div className="border border-black p-4 w-1/3 bg-gray-50 text-center">
                  <div className="text-xs font-bold uppercase mb-1">Highest Package</div>
                  <div className="text-2xl font-bold text-green-700">{data.placements.stats.maxPackage || 0} LPA</div>
               </div>
               <div className="border border-black p-4 w-1/3 bg-gray-50 text-center">
                  <div className="text-xs font-bold uppercase mb-1">Average Package</div>
                  <div className="text-2xl font-bold text-purple-700">{data.placements.stats.avgPackage ? data.placements.stats.avgPackage.toFixed(2) : 0} LPA</div>
               </div>
            </div>

            <div className="my-6 text-center page-break-inside-avoid flex flex-col items-center">
              <h4 className="font-bold underline mb-4">Figure 3.1: Top Recruiting Companies</h4>
              {data.placements.topCompanies.length > 0 ? (
                  <BarChart width={500} height={300} data={data.placements.topCompanies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#000'}} stroke="#000" />
                  <YAxis tick={{fill: '#000'}} stroke="#000" />
                  <Tooltip wrapperClassName="font-sans text-sm" />
                  <Bar dataKey="count" fill="#3b82f6" name="Students Placed" radius={[2, 2, 0, 0]} />
                  </BarChart>
              ) : (
                  <div className="h-[300px] flex items-center justify-center border border-gray-300 w-full text-gray-500 font-sans">No Placement Data Available</div>
              )}
            </div>
            
            <p className="text-justify text-sm">
               <strong>Analysis:</strong> The placement trends indicate strong industry confidence in the institution's curriculum and the technical proficiency of its graduates. The diversity of recruiting companies underscores the broad applicability of the skills acquired by students.
            </p>
          </div>

          {/* CRITERION 3: INTERNSHIPS */}
          <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">4. Criterion 3: Internships and Practical Exposure</h3>
            <p className="mb-4 text-justify">
              Internships bridge the gap between theoretical knowledge and practical application. The table below represents student engagement in industry internships, differentiating between remunerated and non-remunerated opportunities.
            </p>
            <table className="w-full border-collapse border border-black text-center text-sm mb-4">
                <thead>
                    <tr className="bg-gray-200 uppercase text-xs font-bold font-sans">
                        <th className="border border-black p-2">Internship Type</th>
                        <th className="border border-black p-2">Total Undertaken</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 font-semibold font-sans">Paid Internships</td>
                        <td className="border border-black p-2">{data.internships.paidCount}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-semibold font-sans">Unpaid Internships</td>
                        <td className="border border-black p-2">{data.internships.unpaidCount}</td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                        <td className="border border-black p-2 text-right pr-4 uppercase font-sans">Total Internships</td>
                        <td className="border border-black p-2 text-lg">{data.internships.totalInternships}</td>
                    </tr>
                </tbody>
            </table>
          </div>

          {/* CRITERION 4: ACHIEVEMENTS */}
          <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">5. Criterion 4: Student Achievements & Co-Curriculars</h3>
            <p className="mb-4 text-justify">
              In addition to academic prowess, students exhibited commendable participation and success in various co-curricular and extracurricular domains, contributing effectively to their holistic development.
            </p>
            
            <div className="flex justify-center my-6 flex-col items-center">
               <h4 className="font-bold underline mb-4">Figure 5.1: Achievement Categorization</h4>
              {data.achievements.byCategory.length > 0 ? (
                <PieChart width={500} height={300}>
                  <Pie
                    data={data.achievements.byCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {data.achievements.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperClassName="font-sans text-sm"/>
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontFamily: 'sans-serif', fontSize: '12px'}}/>
                </PieChart>
              ) : (
                <div className="h-[300px] flex items-center justify-center border border-gray-300 w-full text-gray-500 font-sans">No Achievement Data Available</div>
              )}
            </div>
          </div>

          {/* CONCLUSION */}
          <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">6. Conclusions & Observations</h3>
            <p className="text-justify mb-4">
              Upon thorough review of the data spanning criterion areas (Demographics, Placements, Internships, and Achievements), the overall continuous improvement trajectory is clearly evident. The robust placement metrics reflect excellent teaching-learning methodologies and active industry partnerships. A high rate of internship participation highlights a curriculum responsive to practical and modern engineering challenges.
            </p>
            <p className="text-justify">
              <strong>Future Action Items:</strong> Focus on increasing the ratio of paid to unpaid internships, widening the placement net to include a broader diversity of core sector jobs, and further encouraging student participation in national and international technical symposiums.
            </p>
          </div>

          {/* SIGNATURES */}
          <div className="mt-20 flex justify-between px-10 pt-10 border-t border-gray-400 font-bold page-break-inside-avoid">
              <div className="text-center">
                  <div className="mb-10">___________________________</div>
                  <div>Head of Department</div>
              </div>
              <div className="text-center">
                  <div className="mb-10">___________________________</div>
                  <div>Principal</div>
              </div>
          </div>

        </div>
      )}
    </div>
  );
}