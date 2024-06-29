import { Types } from 'mongoose';

export interface RequestTemplate {
  userAgent: string;
  browser: {
    name: string;
    version: string;
    mobile: boolean;
  };
  os: {
    name: string;
  };
  ipAddress: string;
  userName: string;
  userId: {
    type: Types.ObjectId;
    ref: 'users';
    autopopulate: {
      select: 'name';
    };
  };
  language: string;
  date: Date;
  isAdmin: boolean;
  isDeveloper: boolean;
}
