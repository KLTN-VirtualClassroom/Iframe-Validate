import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  topicId: { type: String, require: true },
  courseId: { type: String, require: true },
  fileName: { type: String, require: true },
  fileNumber: { type: Number, require: true },
  dateUpload: { type: String, require: true },
  lastAccess: { type: String, require: true },
  linkID: { type: String, require: true },
  fileId: { type: String, require: true },
}, { collection: 'Topics', versionKey: false });

export default mongoose.model('Topic', TopicSchema);