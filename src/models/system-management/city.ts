import mongoose, {
  Schema,
  Document,
  PaginateModel,
  PaginateOptions,
  Types,
} from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';
import { RequestInfo } from '..';
import { inputsLength } from '../../shared/inputs-length';

interface ICity extends Document {
  gov_id: Types.ObjectId;
  name: string;
  active: boolean;
  deleted: boolean;
  add_info: RequestInfo;
  last_update_info: RequestInfo;
  deleted_info: RequestInfo;
}

const CitySchema = new Schema(
  {
    gov_id: {
      type: Types.ObjectId,
      ref: 'govs',
      autopopulate: {
        select: '  name active deleted',
      },
      required: [true, 'Please Select Gov'],
    },
    name: {
      type: String,
      required: [true, 'Please Enter City Name'],
      minlength: inputsLength.cityName,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      required: [true, 'Please Enter City State'],
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

CitySchema.plugin(paginate);
CitySchema.plugin(autopopulate);

export const City = mongoose.model<
  ICity,
  PaginateModel<ICity>,
  PaginateOptions
>('cities', CitySchema);
