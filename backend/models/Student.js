var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs')
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    _id: String,
    loginId: String,
    firstName: String,
    lastName: String,
    middleName: String,
    isActive: Boolean,
    token: String,
    networkId: String,
    bypassedSso: Boolean,
    grade: String,
    menuAccess: Object,
    studentPortalSidebarOn: Boolean,
    password: String,
    hiddenNotifications: Object,
    edmentumEnabled: Boolean,
    gmailAccount: String,
    school: Object,
    isOnline: Boolean,
    lastLoginDate: Date,
    numberOfLogins: {
        type: Number,
        default: 0,
    },
    lastEdmentumLoginDate: Date,
    numberOfEdmentumLogins: {
        type: Number,
        default: 0,
    },
    email: String,
    studentImagePath: String,
    doGpi: {
        type: Boolean,
        default: false
    },
    doExitSurvey: {
        type: Boolean,
        default: false
    },
    districtId: {
        type: String,
        default: null,
    },
    isPL: {
        type: Boolean,
        default: false
    },
}, { collection: 'students' }
);

studentSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.middleName + ' ' + this.lastName;
});

studentSchema.methods.authenticate = function (loginId, callback) {
    if (loginId == this.loginId) {
        callback(true);
    }
    else {
        callback(false);
    }
};

studentSchema.methods.auth = function (password, callback) {
    /*if (password == this.password) {
        callback(true);
    }
    else {
        callback(false);
    }*/
    bcrypt.compare(password, this.password, function (err, res) {
        if (err != null) {
            callback(false);
        }
        else {
            callback(res);
        }
    });
};

studentSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

module.exports = mongoose.model('Student', studentSchema);