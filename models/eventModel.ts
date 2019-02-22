import * as mongoose from 'mongoose';
import * as moment from 'moment';

// ANCHOR Main

let eventSchema = new mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  date: {
    type: String,
    validate: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/,
  },
  time: {
    type: String,
    validate: /^(?:(?:([01]?\d|2[0-3]):)([0-5]?\d):)([0-5]?\d)$/,
  },
  duration: {
    type: Number,
  },
  location: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
  },
  dateCreated: {
    type: String,
    validate: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/,
  },
  attendees: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }]
});

// ANCHOR Virtuals

eventSchema.virtual('timeUntil').get(function() {
  const d = moment.duration(moment(`${this.date} ${this.time}`).diff(moment()));
  return `${d.years}, ${d.months}, ${d.days}, ${d.hours}:${d.minutes}:${d.seconds}`;
});

eventSchema.virtual('timeUntilRaw').get(function() {
  return moment.duration(moment(`${this.date} ${this.time}`).diff(moment()))
});

const EHEvent = mongoose.model('Event', eventSchema);

export default EHEvent;