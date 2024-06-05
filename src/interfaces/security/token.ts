import mongoose, { Schema, PaginateOptions } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
const ObjectId = mongoose.Schema.Types.ObjectId;
import { RequestTemplate } from '../../shared';

interface IToken {
  _id: typeof ObjectId;
  userId: typeof ObjectId;
  token: string;
  createdOn: Date;
  expiredOn: Date;
  signature: string;
  isPc: boolean;
  isMobile: boolean;
  active: boolean;
  deleted: boolean;
  addInfo: RequestTemplate;
  deactivateInfo: RequestTemplate;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: ObjectId,
      ref: 'users',
      autopopulate: {
        select: 'name active deleted',
      },
    },
    token: {
      type: String,
      required: [true, 'Please Enter Token'],
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
      default: true,
    },
    signature: {
      type: String,
      required: [true, 'Please Enter Token Signature'],
    },

    addInfo: {},
    deactivateInfo: {},
  },
  {
    versionKey: false,
  },
);
TokenSchema.plugin(mongoosePagination);
TokenSchema.plugin(autopopulate);

type TokenModel = Pagination<IToken>;

export const Token: TokenModel = mongoose.model<
  IToken,
  Pagination<IToken>,
  PaginateOptions
>('tokens', TokenSchema);
