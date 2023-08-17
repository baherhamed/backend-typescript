import mongoose, {
  Schema,
  Document,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';

import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';

import { RequestInfo } from '../shared';
import { inputsLength } from '../../shared';

interface IRoute extends Document {
  name: string;
  ar: string;
  en: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestInfo;
  lastUpdateInfo: RequestInfo;
  deletedInfo: RequestInfo;
}

const RoutesSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Enter Route Name'],
      minlength: inputsLength.routeName,
      trim: true,
    },
    ar: {
      type: String,
      required: [true, 'Please Enter Route Arabic Name'],
      minlength: inputsLength.routeName,
      trim: true,
    },
    en: {
      type: String,
      required: [true, 'Please Enter Route English Name'],
      minlength: inputsLength.routeName,
      trim: true,
    },
    active: {
      type: Boolean,
      required: [true, 'Please Enter Route Status'],
      // default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    addInfo: RequestInfo,
    lastUpdateInfo: RequestInfo,
    deleteInfo: RequestInfo,
  },
  {
    versionKey: false,
  }
);

RoutesSchema.plugin(paginate);
RoutesSchema.plugin(autopopulate);

export const Route = mongoose.model<
  IRoute,
  PaginateModel<IRoute>,
  PaginateOptions
>('routes', RoutesSchema);