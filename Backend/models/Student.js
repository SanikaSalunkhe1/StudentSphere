const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({

    name: {
        firstName : { type : String , } ,
        middleName : { type : String , } ,
        lastName : { type : String , } ,
        motherName : { type : String , } ,
    },

    PRN: { type: String, unique : true, sparse : true },
    studentID: { type: String, unique: true},

    email: { type: String, unique: true, sparse : true },
    password: { type: String },
    
    // Flag for admin/division incharge heatmap feature
    isAtRisk: { type: Boolean, default: false },


    // new fields for email verification
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpire: {
        type: Date
    },
    
    //new authentication fields for password reset
    resetPasswordToken: {
        type: String,
    },
    
    resetPasswordExpire: {
        type: Date,
    },

    branch: {
        type: String,
        enum : ["Computer", "IT", "AIDS", "Civil", "Chemical", "Mechanical"],
    },

    year : {
        type: String,
        enum : [ "SE", "TE", "BE"],
    },

    division: {
        type: String,
        enum: ["A", "B", "C"]
    },



    // Store both Cloudinary URL and publicId for deletion
    studentPhoto: {
        url: { type: String },       // Cloudinary secure URL
        publicId: { type: String },  // Cloudinary public_id
    },

    dob: Date,

    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],

    },

    currentAddress: {
        street : String , 
        city : { type : String, } , 
        pincode : String 
    },

    nativeAddress: {
        street : String , 
        city : { type : String, } , 
        nativePincode : String 
    },

    //add more categories later on after asking sir
    category: {
        type: String,
        enum : ["Open", "EWS", "EBC", "OBC", "SC", "ST", "Other"],
    },
    

    mobileNo : { type: String, } , 
    parentMobileNo : { type: String, } ,

    abcId : {type: String},
    parentEmail: {type: String},

    academicYear : {type:String},



}, 
{ timestamps: true });

studentSchema.index({ year: 1, division: 1 });              // MOST used filter
studentSchema.index({ branch: 1 });                         // admin filter
studentSchema.index({ academicYear: 1 }); 

studentSchema.index({ bloodGroup: 1 });
studentSchema.index({ category: 1 });

studentSchema.index({ "currentAddress.city": 1 });

// Name searches → text index (best for regex searches)
studentSchema.index({
  "name.firstName": "text",
  "name.middleName": "text",
  "name.lastName": "text",
  "name.motherName": "text"
});

studentSchema.index({ createdAt: -1 });                     // sort performance



module.exports = mongoose.model('Student', studentSchema);
