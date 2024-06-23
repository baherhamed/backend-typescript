import mongoose, { Schema, PaginateOptions } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
import { RequestTemplate, inputsLength } from '../../shared';
const ObjectId = mongoose.Schema.Types.ObjectId;
interface IGov {
  _id: typeof ObjectId;
  name: string;
  code: string;
  active: boolean;
  deleted: boolean;
  addInfo?: RequestTemplate;
  lastUpdateInfo?: RequestTemplate;
  deletedInfo?: RequestTemplate;
}

const GovSchema = new Schema<IGov>(
  {
    name: {
      type: String,
      required: [true, 'Please Enter Gov Name'],
      minlength: inputsLength.govName,
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: [true, 'Please Enter Gov Code'],
      minlength: inputsLength.govCode,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
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

GovSchema.plugin(mongoosePagination);
GovSchema.plugin(autopopulate);

type GovModel = Pagination<IGov>;

export const Gov: GovModel = mongoose.model<
  IGov,
  Pagination<IGov>,
  PaginateOptions
>('govs', GovSchema);
