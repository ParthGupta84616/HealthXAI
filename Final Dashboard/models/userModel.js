import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : [true, 'Please provide a username'],
        unique : [true, 'Username already exists']
    },
    email: {
        type : String,
        required : [true, 'Please provide a email'],
        unique : [true, 'email already exists']
    },
    password: {
        type : String,
        required : [true, 'Please provide a password']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    verificationToken: String,
    verificationTokenExpire: Date
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;