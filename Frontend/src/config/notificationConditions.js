export const NOTIFICATION_CONDITIONS = {
  admission: [
    {
      key: "mahadbtPending",
      label: "MahaDBT Not Filled",
      templateSubject: "MahaDBT Form Pending",
      templateMessage: "Please complete your Mahadbt form.",
      predicate: (record) => !record?.isMahadbtFormSubmitted,
    },
    {
      key: "documentsPending",
      label: "Documents Pending",
      templateSubject: "Admission Documents Pending",
      templateMessage:
        "Your admission documents are pending. Please complete your document submission process.",
      predicate: (record) => record?.status === "pending",
    },
    {
      key: "scholarshipNotApplied",
      label: "Scholarship Not Applied",
      templateSubject: "Scholarship Application Reminder",
      templateMessage:
        "You have not applied for scholarship yet. Please complete your scholarship application at the earliest.",
      predicate: (record) => !record?.isScholarshipApplied,
    },
    {
      key: "scholarshipApplied",
      label: "Scholarship Applied",
      templateSubject: "Scholarship Application Update",
      templateMessage:
        "Your scholarship application is marked as applied. Keep your documents ready for further verification.",
      predicate: (record) => !!record?.isScholarshipApplied,
    },
    {
      key: "migrationPending",
      label: "Migration Certificate Pending",
      templateSubject: "Migration Certificate Pending",
      templateMessage:
        "Your migration certificate is still pending. Please submit or update migration details as soon as possible.",
      predicate: (record) => !record?.hasMigrationCertificate,
    },
    {
      key: "migrationAvailable",
      label: "Migration Certificate Available",
      templateSubject: "Migration Certificate Status Update",
      templateMessage:
        "Your migration certificate status is marked as available. Please ensure all related admission documents are complete.",
      predicate: (record) => !!record?.hasMigrationCertificate,
    },
    {
      key: "mahadbtSubmitted",
      label: "MahaDBT Filled",
      templateSubject: "MahaDBT Submission Update",
      templateMessage:
        "Your MahaDBT form is marked as submitted. Keep checking your status updates regularly.",
      predicate: (record) => !!record?.isMahadbtFormSubmitted,
    },
  ],
};

export const getConditionsByModule = (moduleKey) => {
  return NOTIFICATION_CONDITIONS[moduleKey] || [];
};
