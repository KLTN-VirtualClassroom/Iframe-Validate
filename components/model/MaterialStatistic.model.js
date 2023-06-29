import mongoose from 'mongoose';

const MaterialStatistic = new mongoose.Schema({
  dateAccess: { type: String, require: true },
  fileId: { type: String, require: true },
}, { collection: 'MaterialStatistic', versionKey: false });

export default mongoose.model('MaterialStatistic', MaterialStatistic);