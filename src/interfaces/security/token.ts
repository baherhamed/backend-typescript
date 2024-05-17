import mongoose, {
  Types,
  Document,
  PaginateModel,
  PaginateOptions,
  Schema,
} from 'mongoose';

import paginate from 'mongoose-paginate-v2';
import autopopulate from 'mongoose-autopopulate';
import { RequestTemplate } from '../shared';

interface IToken extends Document {
  userId: Types.ObjectId;
  token: string;
  createdOn: Date;
  expiredOn: Date;
  signature: string;
  isPc: boolean;
  isMobile: boolean;
  active: boolean;
  deleted: boolean;
  addInfo: typeof RequestTemplate;
  deactivateInfo: typeof RequestTemplate;
}

const TokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'users',
      autopopulate: {
        select: 'name active deleted',
      },
    },
    token: {
      type: String,
      required: [true, 'Please Enter Token'],
      // trim: true,
    },
    createdOn: {
      type: Date,
      required: [true, 'Please Enter Token Creation Date'],
    },
    expiredOn: {
      type: Date,
      required: [true, 'Please Enter Token Expiration Date'],
    },
    isPc: {
      type: Boolean,
      default: false,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      required: [true, 'Please Enter Token Status'],
      default: true,
    },
    signature: {
      type: String,
      required: [true, 'Please Enter Token Signature'],
    },

    addInfo: RequestTemplate,
    deactivateInfo: RequestTemplate,
   },
  {
    versionKey: false,
  },
);
TokenSchema.plugin(paginate);
TokenSchema.plugin(autopopulate);

export const Token = mongoose.model<
  IToken,
  PaginateModel<IToken>,
  PaginateOptions
>('tokens', TokenSchema);
