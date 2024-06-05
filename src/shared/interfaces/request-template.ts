import {  Types } from 'mongoose';

export interface RequestTemplate {
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
}
