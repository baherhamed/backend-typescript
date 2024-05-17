import mongoose, {
  Schema,
  Document,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';

import { inputsLength } from '../../shared/inputs-length';
import { RequestTemplate } from '../shared';
interface ILanguage extends Document {
  name: string;
  active: boolean;
  deleted: boolean;
  addInfo: typeof RequestTemplate;
  lastUpdateInfo: typeof RequestTemplate;
  deletedInfo: typeof RequestTemplate;
}

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
    addInfo: RequestTemplate,
    lastUpdateInfo: RequestTemplate,
    deleteInfo: RequestTemplate,
  },
  {
    versionKey: false,
  },
);

LanguageSchema.plugin(paginate);
LanguageSchema.plugin(autopopulate);

export const Language = mongoose.model<
  ILanguage,
  PaginateModel<ILanguage>,
  PaginateOptions
>('languages', LanguageSchema);
