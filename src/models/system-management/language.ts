import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate-v2';
import { inputsLength } from '../../shared/inputs-length';

const LanguageSchema = new Schema(
  {
    code: {
      type: Number,
      required: [true, 'Please Enter Language Code'],
    },
    name: {
      type: String,
      required: [true, 'Please Enter Language Name'],
      minlength: inputsLength.language,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      required: [true, 'Please Enter Language State'],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    add_info: {},
    last_update_info: {},
    deleted_info: {},
  },
  {
    versionKey: false,
  }
);
LanguageSchema.plugin(mongoosePaginate);

export const Language = mongoose.model('languages', LanguageSchema);
