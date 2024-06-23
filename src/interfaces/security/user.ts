import mongoose, { Schema, PaginateOptions } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
const ObjectId = mongoose.Schema.Types.ObjectId;
import { RequestTemplate, inputsLength } from '../../shared';

interface IUser {
  _id: typeof ObjectId;
  name: string;
  mobile: string;
  email: string;
  password: string;
  languageId: typeof ObjectId;
  routesList: [string];
  permissionsList: [string];
  active: boolean;
  deleted: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  addInfo: RequestTemplate;
  lastUpdateInfo: RequestTemplate;
  deletedInfo: RequestTemplate;
}

const UsersSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please Enter Name'],
      minlength: inputsLength.name,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, 'Please Enter Mobile'],
      minlength: inputsLength.mobile,
    },
    email: {
      type: String,
      required: [true, 'Please Enter Email'],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please Enter Password'],
      trim: true,
    },
    languageId: {
      type: ObjectId,
      ref: 'languages',
      autopopulate: {
        select: ' code name active deleted',
      },
    },
    routesList: {
      type: [String],
      required: [true, 'Please Enter Route'],
      minLength: 1,
    },
    permissionsList: {
      type: [String],
      required: [true, 'Please Enter Permission'],
      minLength: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDeveloper: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    addInfo: {},
    lastUpdateInfo: {},
    deletedInfo: {},
  },
  {
    versionKey: false,
  },
);

UsersSchema.plugin(mongoosePagination);
UsersSchema.plugin(autopopulate);

type UserModel = Pagination<IUser>;

export const User: UserModel = mongoose.model<
  IUser,
  Pagination<IUser>,
  PaginateOptions
>('users', UsersSchema);
