import * as mongoose from 'mongoose';

export interface IMeta extends mongoose.Document {
  active: boolean;
  updated: string;
  created: string;
};

export const MetaSchema = new mongoose.Schema({
  active: { type: Boolean, required: true, default: false },
  updated: { type: Date, required: true, default: new Date().toISOString() },
  created: { type: Date, required: true, default: new Date().toISOString() },
}, { _id: false });