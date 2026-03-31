const sendBulkEmail = require("../services/sendBulkEmail")

const sendBulkEmailController = async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ msg: "No recipients provided" });
    }

    const html = `
      <h2>📢 Important Notice</h2>
      <p>${message}</p>
    `;

    await sendBulkEmail({
      emails: recipients,
      subject,
      html
    });

    res.status(200).json({ msg: "Emails sent successfully ✅" });

  } catch (err) {
    res.status(500).json({ msg: "Failed to send emails ❌" });
  }
};

module.exports = {sendBulkEmailController}