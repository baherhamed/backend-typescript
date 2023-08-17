import { ObjectId } from 'mongodb';

export const RequestInfo = {
  userId: ObjectId,
  browser: {
    name: '',
    version: '',
    mobile: '',
  },
  os: {
    name: '',
  },
  ip_address: '',
  language: '',
  date: Date,
};
