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

  activity: [
    {
      key: "activityGeneral",
      label: "General Activity Notice",
      templateSubject: "Extracurricular Activity Update",
      templateMessage: "Please check your recent activity submission or upload missing details.",
      predicate: () => true,
    },
  ],
  achievement: [
    {
      key: "achievementGeneral",
      label: "General Achievement Notice",
      templateSubject: "Achievement Record Update",
      templateMessage: "Please review your achievement records. Make sure proofs are uploaded correctly.",
      predicate: () => true,
    },
  ],
  seminfo: [
    {
      key: "attendanceDefaulter",
      label: "Attendance Defaulter",
      templateSubject: "Low Attendance Warning",
      templateMessage: "Your attendance is dangerously low. Please report to your class coordinator immediately.",
      predicate: (record) => record?.attendance < 75 || record?.isDefaulter,
    },
    {
      key: "journalPending",
      label: "Journal Pending",
      templateSubject: "Journal Submission Pending",
      templateMessage: "Your journal verification is still pending. Please submit it to your respective subject teachers.",
      predicate: (record) => !record?.journalTaken,
    },
    {
      key: "examFormPending",
      label: "Exam Form Pending",
      templateSubject: "Exam Form Not Filled",
      templateMessage: "Your exam form is marked as not filled. Please fill it immediately to avoid penalties.",
      predicate: (record) => !record?.examFormFilled,
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

placement: [
  {
    key: "campusPlacement",
    label: "On-Campus Placement",
    templateSubject: "Campus Placement Recorded",
    templateMessage: "Your campus placement has been successfully recorded.",
    predicate: (record) =>
      String(record?.placementType || "").trim().toLowerCase() === "campus",
  },
  {
    key: "offCampusPlacement",
    label: "Off-Campus Placement",
    templateSubject: "Off-Campus Placement Recorded",
    templateMessage: "Your off-campus placement has been successfully recorded.",
    predicate: (record) =>
      String(record?.placementType || "").trim().toLowerCase() === "off-campus" ||
      String(record?.placementType || "").trim().toLowerCase() === "off campus",
  },
  {
    key: "proofMissing",
    label: "Placement Proof Missing",
    templateSubject: "Placement Proof Pending",
    templateMessage:
      "Your placement proof (offer letter/joining letter) is missing. Please upload it.",
    predicate: (record) =>
      !record?.placementProof?.url && !record?.placementProof,
  },
],
  higherStudies: [
    {
      key: "higherStudiesSubmitted",
      label: "Higher Studies Submitted",
      templateSubject: "Higher Studies Record Submitted",
      templateMessage: "Your higher studies details have been successfully submitted.",
      predicate: (record) => !!record?.examName,
    },

    {
      key: "marksheetMissing",
      label: "Marksheet Missing",
      templateSubject: "Marksheet Pending",
      templateMessage: "Your marksheet is missing. Please upload your marksheet.",
      predicate: (record) => !record?.marksheet?.url,
    },

    {
      key: "idCardMissing",
      label: "ID Card Missing",
      templateSubject: "ID Card Pending",
      templateMessage: "Your ID card photo is missing. Please upload it.",
      predicate: (record) => !record?.idCardPhoto?.url,
    },

    {
      key: "gateAppeared",
      label: "GATE Attempt",
      templateSubject: "GATE Exam Record",
      templateMessage: "Your GATE exam record has been captured.",
      predicate: (record) => record?.examName === "GATE",
    },

    {
      key: "catAppeared",
      label: "CAT Attempt",
      templateSubject: "CAT Exam Record",
      templateMessage: "Your CAT exam record has been captured.",
      predicate: (record) => record?.examName === "CAT",
    },

    {
      key: "greAppeared",
      label: "GRE Attempt",
      templateSubject: "GRE Exam Record",
      templateMessage: "Your GRE exam record has been captured.",
      predicate: (record) => record?.examName === "GRE",
    },

    {
      key: "highScoreEntered",
      label: "Score Submitted",
      templateSubject: "Score Submitted",
      templateMessage: "Your exam score has been recorded successfully.",
      predicate: (record) => !!record?.score,
    }
  ],
  students: [
    {
      key: "profileIncomplete",
      label: "Profile Incomplete",
      templateSubject: "Complete Your Profile",
      templateMessage: "Your student profile is incomplete. Please fill all required details.",
      predicate: (record) => !record?.PRN,
    },

    {
      key: "profileCompleted",
      label: "Profile Completed",
      templateSubject: "Profile Completed",
      templateMessage: "Your profile has been successfully completed.",
      predicate: (record) => !!record?.PRN,
    },

    {
      key: "emailNotVerified",
      label: "Email Not Verified",
      templateSubject: "Verify Your Email",
      templateMessage: "Your email is not verified. Please verify it to continue.",
      predicate: (record) => record?.isVerified === false,
    },

    {
      key: "emailVerified",
      label: "Email Verified",
      templateSubject: "Email Verified",
      templateMessage: "Your email has been successfully verified.",
      predicate: (record) => record?.isVerified === true,
    },

    {
      key: "photoMissing",
      label: "Photo Missing",
      templateSubject: "Upload Profile Photo",
      templateMessage: "Your profile photo is missing. Please upload it.",
      predicate: (record) => !record?.studentPhoto?.url,
    },

    {
      key: "mobileMissing",
      label: "Mobile Number Missing",
      templateSubject: "Mobile Number Required",
      templateMessage: "Your mobile number is missing. Please update it.",
      predicate: (record) => !record?.mobileNo,
    },

    {
      key: "addressMissing",
      label: "Address Missing",
      templateSubject: "Address Required",
      templateMessage: "Your address details are incomplete. Please update them.",
      predicate: (record) =>
        !record?.currentAddress?.city || !record?.currentAddress?.pincode,
    },

    {
      key: "abcIdMissing",
      label: "ABC ID Missing",
      templateSubject: "ABC ID Required",
      templateMessage: "Your ABC ID is missing. Please update it.",
      predicate: (record) => !record?.abcId,
    },

    {
      key: "parentDetailsMissing",
      label: "Parent Details Missing",
      templateSubject: "Parent Details Required",
      templateMessage: "Parent contact details are missing. Please update them.",
      predicate: (record) =>
        !record?.parentMobileNo || !record?.parentEmail,
    }
  ],
};

export const getConditionsByModule = (moduleKey) => {
  return NOTIFICATION_CONDITIONS[moduleKey] || [];
};
