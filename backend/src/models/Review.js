const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    severity: { type: String, enum: ['critical', 'warning', 'info'], required: true },
    line: { type: Number, default: null },
    message: { type: String, required: true },
    suggestion: { type: String, default: '' },
  },
  { _id: false },
);

const improvementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    codeSnippet: { type: String, default: '' },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: 'Untitled review' },
    language: { type: String, required: true, index: true },
    code: { type: String, required: true },
    context: { type: String, default: '' },
    source: { type: String, enum: ['textarea', 'uploaded', 'marked'], default: 'textarea', index: true },
    fileName: { type: String, default: '' },
    isMarked: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
    result: {
      overallScore: { type: Number, default: null },
      summary: { type: String, default: '' },
      issues: { type: [issueSchema], default: [] },
      improvements: { type: [improvementSchema], default: [] },
      strengths: { type: [String], default: [] },
    },
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, createdAt: -1 });

reviewSchema.methods.toSummary = function toSummary() {
  return {
    id: this._id.toString(),
    title: this.title,
    language: this.language,
    source: this.source,
    fileName: this.fileName,
    isMarked: this.isMarked,
    status: this.status,
    overallScore: this.result?.overallScore ?? null,
    issueCount: this.result?.issues?.length ?? 0,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Review', reviewSchema);
