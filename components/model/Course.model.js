import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, require: true },
  courseName: { type: String, require: true },
  courseSummary: { type: String, require: true },
  courseNum: { type: Number, require: true },
  courseThumbnail: { type: String, require: true },
  courseName: { type: String, require: true },
  dateUpload: { type: String, require: true },
  dateUpdate: { type: String, require: true },
  courseDescription: { type: String },
  coursePart: { type: String },
  courseType: { type: String, require: true },
  courseStudent: { type: Number },
}, { collection: 'Courses', versionKey: false });

export default mongoose.model('Course', CourseSchema);