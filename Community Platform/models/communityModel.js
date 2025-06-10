import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a community name'],
    unique: [true, 'Community name already exists'],
    match: [/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"]
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [300, 'Description must be less than 300 characters']
  },
  rules: {
    type: String,
    maxlength: [1000, 'Rules must be less than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;
