import mongoose, {
  Schema,
  Document,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';
import { RequestInfo } from '..';
import { inputsLength } from '../../shared/inputs-length';

interface IGov extends Document {
  name: string;
  active: boolean;
  deleted: boolean;
  add_info: RequestInfo;
  last_update_info: RequestInfo;
  deleted_info: RequestInfo;
}

const GovSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Enter Gov Name'],
      minlength: inputsLength.govName,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      required: [true, 'Please Enter Gov State'],
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

GovSchema.plugin(paginate);
GovSchema.plugin(autopopulate);

export const Gov = mongoose.model<
  IGov,
  PaginateModel<IGov>,
  PaginateOptions
>('govs', GovSchema);
