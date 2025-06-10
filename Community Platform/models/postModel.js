import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    count: {
      type: Number,
      default: 0
    },
    upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
