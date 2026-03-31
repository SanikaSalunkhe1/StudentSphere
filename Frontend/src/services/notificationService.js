import API from "../api/axios";

export const notificationService = {
  sendBulkNotification: async ({ subject, message, recipients }) => {
    const response = await API.post("/emails/send-email", {
      subject,
      message,
      recipients,
    });
    return response.data;
  },
};
