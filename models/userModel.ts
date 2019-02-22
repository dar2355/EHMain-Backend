import * as mongoose from 'mongoose';
import { IMemberSchema } from './memberModel';

// ANCHOR TSDefinition

export interface IUserSchema {
  _id: string,
  username: string,
  password: string,
  email: {
    address: string,
    validated: boolean
  },
  member?: IMemberSchema | string
}

// ANCHOR Main

let userSchema = new mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  superuser: Boolean,
  email: {
    address: {
      type: String,
      required: true,
      validate: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    },
    validated: Boolean
  },
  member: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Member'
  },
});

// ANCHOR Virtuals

const User = mongoose.model('User', userSchema);

export default User;