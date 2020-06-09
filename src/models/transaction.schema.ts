import * as mongoose from 'mongoose';
import * as paginate from 'mongoose-paginate';
import { v4 as uuid } from 'uuid';
import { MetaSchema, IMeta } from './meta.schema';

paginate.paginate.options = {
  limit: 1000,
};

export interface ITransaction extends mongoose.Document {
  uuid: string;
  name: string;
  price: number;
  owner: string;
  meta: IMeta;
};

export const TransactionSchema = new mongoose.Schema({
  uuid: { type: String },
  name: { type: String, required: true },
  price: { type: Number, default: 0.0 },
  owner: { type: String, required: true },
  meta: MetaSchema,
});

TransactionSchema.plugin(paginate);

TransactionSchema.pre('save', async function() {
  await addMeta(this);
  await addUUID(this);
});

const addMeta = async(ctx) => ctx['meta'] = MetaSchema;
const addUUID = async(ctx) => ctx['uuid'] = uuid();