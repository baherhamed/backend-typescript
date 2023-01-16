import { ObjectId } from 'mongodb';

export const RequestInfo = {
  user_id: ObjectId,
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
