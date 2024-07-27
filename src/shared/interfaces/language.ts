import mongoose, { Schema } from 'mongoose'; // ,PaginateModel,PaginateOptions
// import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';
import { inputsLength } from '..';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
// import { Pagination } from 'mongoose-paginate-ts';
const ObjectId = mongoose.Schema.Types.ObjectId;
interface ILanguage {
  _id: typeof ObjectId;
  code?: string;
  name: string;
  active?: boolean;
  deleted?: boolean;
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
    // addInfo: {},
    // lastUpdateInfo: {},
    // deletedInfo: {},
  },
  {
    versionKey: false,
  },
);

// // LanguageSchema.plugin(paginate);
// // LanguageSchema.plugin(autopopulate);

// type LanguageModel = ILanguage;

// export const Language: LanguageModel = mongoose.model<ILanguage>(
//   // Pagination<ILanguage>
//   , PaginateOptions
//   'languages',
//   LanguageSchema,
// );
LanguageSchema.plugin(mongoosePagination);
LanguageSchema.plugin(autopopulate);

type LanguageModel = Pagination<ILanguage>;

export const Language: LanguageModel = mongoose.model<
  ILanguage,
  Pagination<ILanguage>
>('languages', LanguageSchema);
