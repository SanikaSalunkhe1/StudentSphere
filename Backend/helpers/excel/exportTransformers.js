//helpers/excel/exportTransformers.js

const transformInternship = (i) => ({
    // Internship fields
    companyName:        i.companyName                     || '',
    role:               i.role                            || '',
    startDate:          i.startDate ? new Date(i.startDate).toLocaleDateString() : '',
    endDate:            i.endDate   ? new Date(i.endDate).toLocaleDateString()   : '',
    durationMonths:     i.durationMonths                  || '',
    isPaid:             i.stipendInfo?.isPaid ? 'Yes' : 'No',
    stipendAmount:      i.stipendInfo?.stipend              || '',
    description:        i.description                      || '',
    internshipReport:   i.internshipReport?.url               || '',
    photoProof:         i.photoProof?.url                      || '',

    // Student identity
    stuID:              i.stuID?.toString()               || '',
    studentID:          i.studentID                       || '',
    PRN:                i.PRN                             || '',

    // Student name
    firstName:          i.studentName?.firstName          || '',
    fathersName:        i.studentName?.middleName         || '',
    lastName:           i.studentName?.lastName           || '',
    mothersName:        i.studentName?.motherName         || '',

    // Student academic
    year:               i.studentYear                     || '',
    division:           i.studentDivision                 || '',
    branch:             i.studentBranch                   || '',

    // Student personal
    dob:                i.studentDob ? new Date(i.studentDob).toLocaleDateString() : '',
    bloodGroup:         i.studentBloodGroup               || '',
    category:           i.studentCategory                 || '',
    abcId:              i.studentAbcId                    || '',

    // Student contact
    mobileNo:           i.studentMobileNo                 || '',
    parentMobileNo:     i.studentParentMobileNo           || '',
    email:              i.studentEmail                    || '',
    parentEmail:        i.studentParentEmail              || '',

    // Student current address
    currentStreet:      i.studentCurrentAddress?.street   || '',
    currentCity:        i.studentCurrentAddress?.city     || '',
    currentPincode:     i.studentCurrentAddress?.pincode  || '',

    // Student native address
    nativeStreet:       i.studentNativeAddress?.street    || '',
    nativeCity:         i.studentNativeAddress?.city      || '',
    nativePincode:      i.studentNativeAddress?.nativePincode || '',

    
});

const internshipColumnMap = {
    companyName:        'Company',
    role:               'Role',
    startDate:          'Start Date',
    endDate:            'End Date',
    durationMonths:     'Duration (Months)',
    isPaid:             'Paid?',
    stipendAmount:      'Stipend Amount',
    description:        'Description',
    internshipReport:   'Internship Report',
    photoProof:         'Photo Proof',
    stuID:              'Student ID (DB)',
    studentID:          'Student ID',
    PRN:                'PRN',
    firstName:          'First Name',
    fathersName:        "Father's Name",
    lastName:           'Last Name',
    mothersName:        "Mother's Name",
    year:               'Year',
    division:           'Division',
    branch:             'Branch',
    dob:                'Date of Birth',
    bloodGroup:         'Blood Group',
    category:           'Category',
    abcId:              'ABC ID',
    mobileNo:           'Mobile No.',
    parentMobileNo:     'Parent Mobile No.',
    email:              'Email',
    parentEmail:        'Parent Email',
    currentStreet:      'Current Street',
    currentCity:        'Current City',
    currentPincode:     'Current Pincode',
    nativeStreet:       'Native Street',
    nativeCity:         'Native City',
    nativePincode:      'Native Pincode',
    
};


const transformStudent = (s) => ({
    // Identity
    studentID:          s.studentID                        || '',
    email:              s.email                            || '',
    PRN:                s.PRN                              || '',
    studentPhoto:       s.studentPhoto?.url                || '',
    academicYear:       s.academicYear                || '',

    // Name
    firstName:          s.name?.firstName                  || '',
    fathersName:        s.name?.middleName                 || '',
    lastName:           s.name?.lastName                   || '',
    mothersName:        s.name?.motherName                 || '',

    // Academic
    year:               s.year                             || '',
    division:           s.division                         || '',
    branch:             s.branch                           || '',

    // Personal
    dob:                s.dob ? new Date(s.dob).toLocaleDateString() : '',
    bloodGroup:         s.bloodGroup                       || '',
    category:           s.category                         || '',
    abcId:              s.abcId                            || '',

    // Contact
    mobileNo:           s.mobileNo                         || '',
    parentMobileNo:     s.parentMobileNo                   || '',
    parentEmail:        s.parentEmail                      || '',

    // Current address
    currentStreet:      s.currentAddress?.street           || '',
    currentCity:        s.currentAddress?.city             || '',
    currentPincode:     s.currentAddress?.pincode          || '',

    // Native address
    nativeStreet:       s.nativeAddress?.street            || '',
    nativeCity:         s.nativeAddress?.city              || '',
    nativePincode:      s.nativeAddress?.nativePincode           || '',
});

const studentColumnMap = {
    studentID:          'Student ID',
    PRN:                'PRN',
    email:              'Email',
    firstName:          'First Name',
    fathersName:        "Father's Name",
    lastName:           'Last Name',
    mothersName:        "Mother's Name",
    year:               'Year',
    division:           'Division',
    branch:             'Branch',
    studentPhoto:       'Student Photo',
    academicYear:       'Academic Year',
    dob:                'Date of Birth',
    bloodGroup:         'Blood Group',
    category:           'Category',
    abcId:              'ABC ID',
    mobileNo:           'Mobile No.',
    parentMobileNo:     'Parent Mobile No.',
    parentEmail:        'Parent Email',
    currentStreet:      'Current Street',
    currentCity:        'Current City',
    currentPincode:     'Current Pincode',
    nativeStreet:       'Native Street',
    nativeCity:         'Native City',
    nativePincode:      'Native Pincode',
};

const transformPlacement = (p) => ({
    // Placement fields
    companyName:        p.companyName                     || '',
    role:               p.role                            || '',
    placementType:      p.placementType                   || '',
    package:            p.package                         || '',
    placementYear:      p.placementYear                   || '',
    passoutYear:        p.passoutYear                     || '',
    joiningYear:        p.joiningYear                     || '',
    placementProof:     p.placementProof                  || '',

    // Student identity
    stuID:              p.stuID?.toString()               || '',
    studentID:          p.studentID                       || '',
	  email:              p.studentEmail                    || '',
    PRN:                p.PRN                             || '',

    // Student name
    firstName:          p.studentName?.firstName          || '',
    fathersName:        p.studentName?.middleName         || '',
    lastName:           p.studentName?.lastName           || '',
    mothersName:        p.studentName?.motherName         || '',

    // Student academic
    year:               p.studentYear                     || '',
    division:           p.studentDivision                 || '',
    branch:             p.studentBranch                   || '',

    // Student personal
    dob:                p.studentDob ? new Date(p.studentDob).toLocaleDateString() : '',
    bloodGroup:         p.studentBloodGroup               || '',
    category:           p.studentCategory                 || '',
    abcId:              p.studentAbcId                    || '',

    // Student contact
    mobileNo:           p.studentMobileNo                 || '',
    parentMobileNo:     p.studentParentMobileNo           || '',
    parentEmail:        p.studentParentEmail              || '',

    // Student current address
    currentStreet:      p.studentCurrentAddress?.street   || '',
    currentCity:        p.studentCurrentAddress?.city     || '',
    currentPincode:     p.studentCurrentAddress?.pincode  || '',

    // Student native address
    nativeStreet:       p.studentNativeAddress?.street    || '',
    nativeCity:         p.studentNativeAddress?.city      || '',
    nativePincode:      p.studentNativeAddress?.nativePincode || '',
});

const placementColumnMap = {
    companyName:        'Company',
    role:               'Role',
    placementType:      'Placement Type',
    package:            'Package (LPA)',
    placementYear:      'Placement Year',
    passoutYear:        'Passout Year',
    joiningYear:        'Joining Year',
    placementProof:     'Placement Proof',
    stuID:              'Student ID (DB)',
    studentID:          'Student ID',
	  email:              'Email',
    PRN:                'PRN',
    firstName:          'First Name',
    fathersName:        "Father's Name",
    lastName:           'Last Name',
    mothersName:        "Mother's Name",
    year:               'Year',
    division:           'Division',
    branch:             'Branch',
    dob:                'Date of Birth',
    bloodGroup:         'Blood Group',
    category:           'Category',
    abcId:              'ABC ID',
    mobileNo:           'Mobile No.',
    parentMobileNo:     'Parent Mobile No.',
    parentEmail:        'Parent Email',
    currentStreet:      'Current Street',
    currentCity:        'Current City',
    currentPincode:     'Current Pincode',
    nativeStreet:       'Native Street',
    nativeCity:         'Native City',
    nativePincode:      'Native Pincode',
};


const transformHigherStudy = (h) => ({
    // Higher study fields
    examName:           h.examName                        || '',
    score:              h.score                           || '',
    marksheet:          h.marksheet?.url                       || '',
    idCardPhoto:        h.idCardPhoto?.url                     || '',

    // Student identity
    stuID:              h.stuID?.toString()               || '',
    studentID:          h.studentID                       || '',
	  email:              h.studentEmail                    || '',
    PRN:                h.PRN                             || '',

    // Student name
    firstName:          h.studentName?.firstName          || '',
    fathersName:        h.studentName?.middleName         || '',
    lastName:           h.studentName?.lastName           || '',
    mothersName:        h.studentName?.motherName         || '',

    // Student academic
    year:               h.studentYear                     || '',
    division:           h.studentDivision                 || '',
    branch:             h.studentBranch                   || '',

    // Student personal
    dob:                h.studentDob ? new Date(h.studentDob).toLocaleDateString() : '',
    bloodGroup:         h.studentBloodGroup               || '',
    category:           h.studentCategory                 || '',
    abcId:              h.studentAbcId                    || '',

    // Student contact
    mobileNo:           h.studentMobileNo                 || '',
    parentMobileNo:     h.studentParentMobileNo           || '',
    parentEmail:        h.studentParentEmail              || '',

    // Student current address
    currentStreet:      h.studentCurrentAddress?.street   || '',
    currentCity:        h.studentCurrentAddress?.city     || '',
    currentPincode:     h.studentCurrentAddress?.pincode  || '',

    // Student native address
    nativeStreet:       h.studentNativeAddress?.street    || '',
    nativeCity:         h.studentNativeAddress?.city      || '',
    nativePincode:      h.studentNativeAddress?.nativePincode || '',
});

const higherStudyColumnMap = {
    examName:           'Exam Name',
    score:              'Score',
    marksheet:          'Marksheet',
    idCardPhoto:        'ID Card Photo',
    stuID:              'Student ID (DB)',
    studentID:          'Student ID',
	  email:              'Email',
    PRN:                'PRN',
    firstName:          'First Name',
    fathersName:        "Father's Name",
    lastName:           'Last Name',
    mothersName:        "Mother's Name",
    year:               'Year',
    division:           'Division',
    branch:             'Branch',
    dob:                'Date of Birth',
    bloodGroup:         'Blood Group',
    category:           'Category',
    abcId:              'ABC ID',
    mobileNo:           'Mobile No.',
    parentMobileNo:     'Parent Mobile No.',
    parentEmail:        'Parent Email',
    currentStreet:      'Current Street',
    currentCity:        'Current City',
    currentPincode:     'Current Pincode',
    nativeStreet:       'Native Street',
    nativeCity:         'Native City',
    nativePincode:      'Native Pincode',
};


//transform achievement 
const transformAchievement = (a) => ({
    /* Achievement Info */
  category: a.category || "",
  title: a.title || "",
  description: a.description || "",
  issuedBy: a.issuedBy || "",
  achievementType: a.achievementType || "",

  dateFrom: a.date?.from
    ? new Date(a.date.from).toLocaleDateString()
    : "",
  dateTo: a.date?.to
    ? new Date(a.date.to).toLocaleDateString()
    : "",

  teamMembers: a.teamMembers?.join(", ") || "",

  certificationCourse: a.certification_course || "",

  eventPhoto: a.photographs?.eventPhoto?.url || "",
  certificate: a.photographs?.certificate?.url || "",
  courseCertificate: a.course_certificate?.url || "",

  /* Student Info */
  stuID: a.stuID?.toString() || "",
  studentID: a.studentID || "",
  PRN: a.PRN || "",

  firstName: a.studentName?.firstName || "",
  fathersName: a.studentName?.middleName || "",
  lastName: a.studentName?.lastName || "",

  year: a.studentYear || "",
  division: a.studentDivision || "",
  branch: a.studentBranch || "",

  email: a.studentEmail || "",
  mobileNo: a.studentMobileNo || "",
});


//column mapping for achievements export

const achievementColumnMap = {
  category: "Category",
  title: "Title",
  description: "Description",
  issuedBy: "Issued By",
  achievementType: "Achievement Type",

  dateFrom: "Date From",
  dateTo: "Date To",

  teamMembers: "Team Members",
  certificationCourse: "Certification Course",

  eventPhoto: "Event Photo URL",
  certificate: "Certificate URL",
  courseCertificate: "Course Certificate URL",

  stuID: "Student DB ID",
  studentID: "Student ID",
  PRN: "PRN",

  firstName: "First Name",
  fathersName: "Father's Name",
  lastName: "Last Name",

  year: "Year",
  division: "Division",
  branch: "Branch",

  email: "Email",
  mobileNo: "Mobile No",
};

//transform activities
const transformActivity = (a) => ({
  /* Activity Info */
  type: a.type || "",
  title: a.title || "",
  description: a.description || "",

  dateFrom: a.date?.from
    ? new Date(a.date.from).toLocaleDateString()
    : "",
  dateTo: a.date?.to
    ? new Date(a.date.to).toLocaleDateString()
    : "",

  certificateURL: a.certificateURL?.url || "",

  /* Student Info */
  stuID: a.stuID?.toString() || "",
  studentID: a.studentID || "",
  PRN: a.PRN || "",

  firstName: a.studentName?.firstName || "",
  fathersName: a.studentName?.middleName || "",
  lastName: a.studentName?.lastName || "",

  year: a.studentYear || "",
  division: a.studentDivision || "",
  branch: a.studentBranch || "",

  email: a.studentEmail || "",
  mobileNo: a.studentMobileNo || "",
});


//column mapping for activities export
const activityColumnMap = {
  type: "Activity Type",
  title: "Title",
  description: "Description",

  dateFrom: "Date From",
  dateTo: "Date To",

  certificateURL: "Certificate URL",

  stuID: "Student DB ID",
  studentID: "Student ID",
  PRN: "PRN",

  firstName: "First Name",
  fathersName: "Father's Name",
  lastName: "Last Name",

  year: "Year",
  division: "Division",
  branch: "Branch",

  email: "Email",
  mobileNo: "Mobile No",
};


//transform admission
const transformAdmission = (a) => ({
  /* Admission Info */
  rollno: a.rollno || "",
  course: a.course || "",
  academicYear: a.academicYear || "",
  admissionDate: a.admissionDate
    ? new Date(a.admissionDate).toLocaleDateString()
    : "",

  status: a.status || "",
  fees: a.fees || 0,
  isFeesPaid: a.isFeesPaid ? "Yes" : "No",

  isScholarshipApplied: a.isScholarshipApplied ? "Yes" : "No",
  scholarshipNotAppliedReason: a.scholarshipNotAppliedReason || "",

  isMahadbtFormSubmitted: a.isMahadbtFormSubmitted ? "Yes" : "No",
  mahadbtFilledDate: a.mahadbtFilledDate
    ? new Date(a.mahadbtFilledDate).toLocaleDateString()
    : "",
  mahadbtNotFilledReason: a.mahadbtNotFilledReason || "",

  hasMigrationCertificate: a.hasMigrationCertificate ? "Yes" : "No",
  migrationExpectedDate: a.migrationExpectedDate
    ? new Date(a.migrationExpectedDate).toLocaleDateString()
    : "",
  migrationNotAvailableReason: a.migrationNotAvailableReason || "",

  /* Student Info */
  stuID: a.stuID?._id?.toString() || "",
  studentID: a.stuID?.studentID || "",
  firstName: a.stuID?.name?.firstName || "",
  fathersName: a.stuID?.name?.middleName || "",
  lastName: a.stuID?.name?.lastName || "",
  branch: a.stuID?.branch || "",
  year: a.year || "",
  division: a.div || "",
});


//column mapping for admission export
const admissionColumnMap = {
  rollno: "Roll No",
  course: "Course",
  academicYear: "Academic Year",
  admissionDate: "Admission Date",

  status: "Status",
  fees: "Fees",
  isFeesPaid: "Fees Paid",

  isScholarshipApplied: "Scholarship Applied",
  scholarshipNotAppliedReason: "Scholarship Not Applied Reason",

  isMahadbtFormSubmitted: "Mahadbt Submitted",
  mahadbtFilledDate: "Mahadbt Filled Date",
  mahadbtNotFilledReason: "Mahadbt Not Filled Reason",

  hasMigrationCertificate: "Migration Certificate Available",
  migrationExpectedDate: "Migration Expected Date",
  migrationNotAvailableReason: "Migration Not Available Reason",

  stuID: "Student DB ID",
  studentID: "Student ID",
  firstName: "First Name",
  fathersName: "Father's Name",
  lastName: "Last Name",
  branch: "Branch",
  year: "Year",
  division: "Division",
};


// transform semester info
const transformSemesterInfo = (s) => ({
  /* Semester Info */
  semester: s.semester || "",
  attendance: s.attendance ?? "",
  kts: s.kts?.join(", ") || "",

  isDefaulter: s.isDefaulter ? "Yes" : "No",

  /* Marks (flattened) */
  marks: s.marks?.map(m =>
    `${m.subject} (${m.score}/${m.outOf})`
  ).join(" | ") || "",

  journalTaken : s.journalTaken,
  examFormFilled : s.examFormFilled,

  /* Student identity */
  stuID: s.stuID?.toString() || "",
  studentID: s.studentID || "",
  PRN: s.PRN || "",

  /* Student name */
  firstName: s.studentName?.firstName || "",
  fathersName: s.studentName?.middleName || "",
  lastName: s.studentName?.lastName || "",

  /* Academic */
  year: s.studentYear || "",
  division: s.studentDivision || "",
  branch: s.studentBranch || "",

  /* Personal */
  dob: s.studentDob
    ? new Date(s.studentDob).toLocaleDateString()
    : "",
  bloodGroup: s.studentBloodGroup || "",
  category: s.studentCategory || "",
  abcId: s.studentAbcId || "",

  /* Contact */
  mobileNo: s.studentMobileNo || "",
  parentMobileNo: s.studentParentMobileNo || "",
  email: s.studentEmail || "",
  parentEmail: s.studentParentEmail || "",

  /* Current address */
  currentStreet: s.studentCurrentAddress?.street || "",
  currentCity: s.studentCurrentAddress?.city || "",
  currentPincode: s.studentCurrentAddress?.pincode || "",

  /* Native address */
  nativeStreet: s.studentNativeAddress?.street || "",
  nativeCity: s.studentNativeAddress?.city || "",
  nativePincode: s.studentNativeAddress?.nativePincode || ""
});

//column mapping for semester info export
const semesterInfoColumnMap = {
  semester: "Semester",
  attendance: "Attendance (%)",
  kts: "KTs",
  isDefaulter: "Defaulter",
  marks: "Marks",
  journalTaken : "Journal Taken",
  examFormFilled : "Exam Form Filled",

  stuID: "Student DB ID",
  studentID: "Student ID",
  firstName: "First Name",
  fathersName: "Father's Name",
  lastName: "Last Name",
  year: "Year",
  division: "Division",

  PRN: "PRN",
  branch: "Branch",
  dob: "Date of Birth",
  bloodGroup: "Blood Group",
  category: "Category",
  abcId: "ABC ID",
  mobileNo: "Mobile No",
  parentMobileNo: "Parent Mobile No",
  email: "Email",
  parentEmail: "Parent Email",
  currentStreet: "Current Street",
  currentCity: "Current City",
  currentPincode: "Current Pincode",
  nativeStreet: "Native Street",
  nativeCity: "Native City",
  nativePincode: "Native Pincode"
};

module.exports = {
	transformStudent, studentColumnMap, 
    transformInternship, internshipColumnMap,
	transformPlacement, placementColumnMap, 
    transformHigherStudy, higherStudyColumnMap,
    transformAchievement , achievementColumnMap , 
    transformActivity , activityColumnMap , 
	transformAdmission , admissionColumnMap ,
    transformSemesterInfo, semesterInfoColumnMap
};