import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  fileId: { type: String, require: true },
  fileName: { type: String, require: true },
  teacherID: { type: String, require: true },
  topic: { type: String, require: true },
}, { collection: 'Materials', versionKey: false });

export default mongoose.model('Material', MaterialSchema);