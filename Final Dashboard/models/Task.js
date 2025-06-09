import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  hour: String,
  purpose: String,
  done: { type: Boolean, default: false },
}, { timestamps: true });

// Check if the model already exists before compiling
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
