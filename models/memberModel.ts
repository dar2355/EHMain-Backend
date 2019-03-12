import * as mongoose from 'mongoose';
import * as moment from 'moment';


// ANCHOR TSDefinition

export type role =
  'computer chairman'|
  'president'|
  'vice president'|
  'secretary'|
  'treasurer'|
  'public relations chairman'|
  'recruitment chairman'|
  'social chairman'|
  'house improvements chairman'|
  'project chairman'|
  'constitution chairman & historian'|
  'freshman representative';

export interface IMemberSchema {
  _id: string,
  firstName: string,
  lastName: string,
  onFloor?: boolean,
  titles?: role[],
  birthDate?: number,
  joinDate?: number,
  major?: string[],
  minor?: string[],
  mentor?: string,
  mentee?: string,
  contactInfo?: {
    email?: string,
    phone?: string
  }
}

// ANCHOR Main

let memberSchema = new mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  firstName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  onFloor: Boolean,
  titles: [{
    type: String,
    enum: [
      'computer chairman',
      'president',
      'vice president',
      'secretary',
      'treasurer',
      'public relations chairman',
      'recruitment chairman',
      'social chairman',
      'house improvements chairman',
      'project chairman',
      'constitution chairman & historian',
      'freshman representative'
    ],
  }],
  birthDate: {
    type: Number,
  },
  joinDate: {
    type: Number,
  },
  major: [String],
  minor: [String],
  mentor: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Member'
  }],
  mentee: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Member'
  }],
  contactInfo : {
    email: [{
      type: String,
      validate: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
    }],
    phone: [{
      type: String,
      validate: /^([0-9]( |-)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-)?([0-9]{3}( |-)?[0-9]{4}|[a-zA-Z0-9]{7})$/,
    }]
  }
});

// ANCHOR Virtuals

memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

memberSchema.virtual('age').get(function() {
  return moment().diff(moment(this.birthDate), 'year');
});

memberSchema.virtual('yearsAsMember').get(function() {
  return moment().diff(moment(this.joinDate), 'year');
});

const Member = mongoose.model('Member', memberSchema);

export { Member };

// ANCHOR Suggested Order

const order = [
  {name: '_id', isDisabled: true, isActive: false},
  'firstName',
  'lastName',
  'onFloor',
  'titles',
  {name: 'birthDate', type: 'Date', kind: 'date'},
  {name: 'joinDate', type: 'Date', kind: 'year'},
  'major',
  'minor',
  {name: 'mentor', references: 'members/simple'},
  {name: 'mentee', references: 'members/simple'},
  {name: 'contactInfo', subsections: [
    'email',
    'phone'
  ]},
];

export { order };
