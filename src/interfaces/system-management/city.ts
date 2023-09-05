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
  govId: Types.ObjectId;
  name: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestInfo;
  lastUpdateInfo: RequestInfo;
  deletedInfo: RequestInfo;
}

const CitySchema = new Schema(
  {
    govId: {
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
    addInfo: RequestInfo,
    lastUpdateInfo: RequestInfo,
    deleteInfo: RequestInfo,
  },
  {
    versionKey: false,
  },
);

CitySchema.plugin(paginate);
CitySchema.plugin(autopopulate);

export const City = mongoose.model<
  ICity,
  PaginateModel<ICity>,
  PaginateOptions
>('cities', CitySchema);
