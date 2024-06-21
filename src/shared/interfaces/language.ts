import mongoose, {
  Schema,
  Document,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';
import { RequestTemplate, inputsLength } from '..';

interface ILanguage {
  code?: string;
  name: string;
  active: boolean;
  deleted: boolean;
  addInfo: RequestTemplate;
  lastUpdateInfo: RequestTemplate;
  deletedInfo: RequestTemplate;
}

const LanguageSchema = new Schema<ILanguage>(
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
    addInfo: {},
    lastUpdateInfo: {},
    deletedInfo: {},
  },
  {
    versionKey: false,
  },
);

LanguageSchema.plugin(paginate);
LanguageSchema.plugin(autopopulate);

type LanguageModel = PaginateModel<ILanguage>;

export const Language: LanguageModel = mongoose.model<
  ILanguage,
  PaginateModel<ILanguage>,
  PaginateOptions
>('languages', LanguageSchema);
