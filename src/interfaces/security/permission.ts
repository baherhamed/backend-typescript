import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
import { RequestTemplate, inputsLength } from '../../shared';

const ObjectId = mongoose.Schema.Types.ObjectId;
interface IPermission {
  _id: typeof ObjectId;
  routeId: typeof ObjectId;
  name: string;
  ar: string;
  en: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestTemplate;
  lastUpdateInfo: RequestTemplate;
  deletedInfo: RequestTemplate;
}

const PermissionSchema = new Schema<IPermission>(
  {
    routeId: {
      type: ObjectId,
      ref: 'routes',
      autopopulate: {
        select: 'name ar en active deleted',
      },
    },
    name: {
      type: String,
      required: [true, 'Please Enter Permission Name'],
      minlength: inputsLength.permissionName,
      trim: true,
    },
    ar: {
      type: String,
      required: [true, 'Please Enter Permission Arabic Name'],
      minlength: inputsLength.permissionName,
      trim: true,
    },
    en: {
      type: String,
      required: [true, 'Please Enter Permission English Name'],
      minlength: inputsLength.permissionName,
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
PermissionSchema.plugin(mongoosePagination);
PermissionSchema.plugin(autopopulate);

type PermissionModel = Pagination<IPermission>;

export const Permission: PermissionModel = mongoose.model<
  IPermission,
  Pagination<IPermission>
>('permissions', PermissionSchema);
