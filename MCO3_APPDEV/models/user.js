const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
 userID: {
    type: String,
    required: true
 },
 name: {
    type: String, 
    required: true,
    index: 'text'
 },
 email: {
    type: String,
    required: true,
    index: 'text'
 },
 password: {
    type: String,
    required: true
 },
 remember: Boolean,
 role: String,
 jpgFilename: {
    type: String,
    default: "" 
 },
 txtFilename: {
    type: String,
    default: "" 
 }
});

module.exports = mongoose.model('User', userSchema);