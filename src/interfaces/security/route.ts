import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
const ObjectId = mongoose.Schema.Types.ObjectId;
import { RequestTemplate, inputsLength } from '../../shared';
export interface IRoute {
  _id: typeof ObjectId;
  name: string;
  ar: string;
  en: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestTemplate;
  lastUpdateInfo: RequestTemplate;
  deletedInfo: RequestTemplate;
}

const RoutesSchema = new Schema<IRoute>(
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

RoutesSchema.plugin(mongoosePagination);
RoutesSchema.plugin(autopopulate);

type RouteModel = Pagination<IRoute>;

export const Route: RouteModel = mongoose.model<IRoute, Pagination<IRoute>>(
  'routes',
  RoutesSchema,
);
