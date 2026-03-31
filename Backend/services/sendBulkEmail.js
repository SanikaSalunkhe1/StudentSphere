const axios = require("axios");

const sendBulkEmail = async ({ emails, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.BREVO_SENDER_EMAIL },

        to: emails.map(email => ({ email })),

        subject: subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Email Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendBulkEmail;