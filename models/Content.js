const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['blog', 'social', 'email', 'seo'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  generatedContent: {
    type: String,
    required: true
  },
  keywords: [String],
  industry: String,
  targetAudience: String,
  tone: String,
  length: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Content', contentSchema);
