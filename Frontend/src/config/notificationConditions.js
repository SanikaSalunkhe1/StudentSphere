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
  
  internship: [
    {
      key: "internshipSubmitted",
      label: "Internship Submitted",
      templateSubject: "Internship Record Submitted",
      templateMessage:
        "Your internship details have been successfully submitted.",
      predicate: (record) => !!record?.companyName,
    },

    {
      key: "internshipOngoing",
      label: "Internship Ongoing",
      templateSubject: "Internship In Progress",
      templateMessage:
        "Your internship is currently ongoing. Make sure to maintain proper records.",
      predicate: (record) =>
        new Date(record?.startDate) <= new Date() &&
        new Date(record?.endDate) >= new Date(),
    },

    {
      key: "internshipCompleted",
      label: "Internship Completed",
      templateSubject: "Internship Completed",
      templateMessage:
        "Your internship duration is completed. Please ensure all required documents are uploaded.",
      predicate: (record) =>
        new Date(record?.endDate) < new Date(),
    },

    {
      key: "reportMissing",
      label: "Internship Report Missing",
      templateSubject: "Internship Report Pending",
      templateMessage:
        "Your internship report is missing. Please upload your report as soon as possible.",
      predicate: (record) => !record?.internshipReport?.url,
    },

    {
      key: "photoProofMissing",
      label: "Photo Proof Missing",
      templateSubject: "Internship Photo Proof Pending",
      templateMessage:
        "Your internship photo proof is missing. Please upload valid proof.",
      predicate: (record) => !record?.photoProof?.url,
    },

    {
      key: "paidInternship",
      label: "Paid Internship",
      templateSubject: "Paid Internship Recorded",
      templateMessage:
        "Your internship is marked as paid. Ensure stipend details are correct.",
      predicate: (record) => record?.stipendInfo?.isPaid === true,
    },

    {
      key: "unpaidInternship",
      label: "Unpaid Internship",
      templateSubject: "Unpaid Internship Recorded",
      templateMessage:
        "Your internship is marked as unpaid.",
      predicate: (record) => record?.stipendInfo?.isPaid === false,
    },

    {
      key: "longDurationInternship",
      label: "Long Duration Internship",
      templateSubject: "Long Duration Internship Alert",
      templateMessage:
        "Your internship duration is long. Ensure all academic requirements are balanced.",
      predicate: (record) => record?.durationMonths >= 4,
    }
  ],
};

export const getConditionsByModule = (moduleKey) => {
  return NOTIFICATION_CONDITIONS[moduleKey] || [];
};
