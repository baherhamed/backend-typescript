import mongoose, { Schema } from 'mongoose';

import autopopulate from 'mongoose-autopopulate';
import { RequestTemplate, inputsLength } from '../../shared';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
const ObjectId = mongoose.Schema.Types.ObjectId;

interface ICity {
  _id: typeof ObjectId;
  govId: typeof ObjectId;
  name: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestTemplate;
  lastUpdateInfo: RequestTemplate;
  deletedInfo: RequestTemplate;
}

const CitySchema = new Schema<ICity>(
  {
    govId: {
      type: ObjectId,
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

CitySchema.plugin(mongoosePagination);
CitySchema.plugin(autopopulate);

type CityModel = Pagination<ICity>;

export const City: CityModel = mongoose.model<ICity, Pagination<ICity>>(
  'cities',
  CitySchema,
);
