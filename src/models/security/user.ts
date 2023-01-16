import mongoose, {
  Schema,
  Types,
  Document,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';

import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';

import { RequestInfo } from '../shared';
import { inputsLength } from '../../shared';

interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  password: string;
  language_id: Types.ObjectId;
  routesList: [string];
  permissionsList: [string];
  active: boolean;
  deleted: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  add_info: RequestInfo;
  last_update_info: RequestInfo;
  deleted_info: RequestInfo;
}

const UsersSchema = new Schema(
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
    language_id: {
      type: Types.ObjectId,
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
      required: [true, 'Please Enter State'],
    },
    isAdmin: {
      type: Boolean,
      required: [true, 'Please Enter Is Admin State'],
      default: false,
    },
    isDeveloper: {
      type: Boolean,
      required: [true, 'Please Enter Is Develper State'],
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    add_info: RequestInfo,
    last_update_info: RequestInfo,
    delete_info: RequestInfo,
  },

  {
    versionKey: false,
  }
);

UsersSchema.plugin(paginate);
UsersSchema.plugin(autopopulate);

export const User = mongoose.model<
  IUser,
  PaginateModel<IUser>,
  PaginateOptions
>('users', UsersSchema);
