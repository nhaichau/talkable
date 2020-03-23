const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    roles: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date
});

module.exports = User = mongoose.model('users', UserSchema);