const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Token Schema
const TokenSchema = new Schema({
    _userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, exprires: 600 }
});

module.exports = Token = mongoose.model('tokens', TokenSchema);