import * as mongoose from 'mongoose';

export interface ITransaction extends mongoose.Document {
  number: number;
  street: string;
  city: string;
  zip: string;
  state: string;
  country: string;
};

export const TransactionSchema = new mongoose.Schema({
  number: { type: Number },
  street: { type: String },
  city: { type: String },
  zip: { type: String },
  state: { type: String },
  country: { type: String },
});