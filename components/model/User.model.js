import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  role: { type: String, require: true },
  roomId: { type: String, require: true },
}, { collection: 'Users', versionKey: false });

export default mongoose.model('User', UserSchema);