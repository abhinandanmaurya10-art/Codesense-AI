const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    githubId: { type: String, index: true, unique: true, sparse: true },
    googleId: { type: String, index: true, unique: true, sparse: true },
    username: { type: String, trim: true },
    displayName: { type: String, trim: true },
    avatar: { type: String, trim: true },
    provider: { type: String, trim: true, default: 'local' },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name || this.displayName || this.username,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    provider: this.provider,
    role: this.role,
    createdAt: this.createdAt,
  };
};

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);

module.exports = mongoose.model('User', userSchema);
