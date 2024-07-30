import * as mongoose from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    // type: String,
    required: true,
    enum: Object.values(UserRole),
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});
