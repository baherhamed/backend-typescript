import { Schema, Types } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
export const RequestTemplate = new Schema({
  userAgent: String,
  browser: {
    name: String,
    version: String,
    mobile: Boolean,
  },
  os: {
    name: String,
  },
  ipAddress: String,
  userName: String,
  userId: {
    type: Types.ObjectId,
    ref: 'users',
    autopopulate: {
      select: 'name',
    },
  },
  language: String,
  date: Date,
  isAdmin: Boolean,
  isDeveloper: Boolean,
});

RequestTemplate.plugin(autopopulate);
