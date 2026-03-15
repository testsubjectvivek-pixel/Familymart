const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'manager'], default: 'user' },
  refreshToken: { type: String },
  refreshTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.setRefreshToken = async function (token, expiry) {
  const salt = await bcrypt.genSalt(10);
  this.refreshToken = await bcrypt.hash(token, salt);
  this.refreshTokenExpires = expiry;
};

UserSchema.methods.verifyRefreshToken = async function (token) {
  if (!this.refreshToken || !this.refreshTokenExpires) return false;
  if (this.refreshTokenExpires < new Date()) return false;
  return bcrypt.compare(token, this.refreshToken);
};

module.exports = mongoose.model('User', UserSchema);
