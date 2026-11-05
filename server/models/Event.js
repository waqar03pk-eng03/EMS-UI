const mongoose = require('mongoose');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Booking fee state. "amount" is the fee due (or paid); the server sets it, never the client.
const paymentSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    method: { type: String, enum: ['paypal', 'card'] },
    amount: { type: Number, min: 0, default: 0 },
    currency: { type: String },
    reference: { type: String },
    paidAt: { type: Date },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Enter a name for the event.'], trim: true, maxlength: 120 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Choose a category.'] },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    date: {
      type: String,
      required: [true, 'Choose the event date.'],
      match: [DATE_RE, 'Date must look like 2026-11-14.'],
      validate: {
        validator(v) {
          // Only block past dates when the event is first created.
          return !this.isNew || v >= todayISO();
        },
        message: 'The date can’t be in the past.',
      },
    },
    startTime: { type: String, required: [true, 'Choose a start time.'], match: [TIME_RE, 'Time must look like 09:30.'] },
    endTime: {
      type: String,
      required: [true, 'Choose an end time.'],
      match: [TIME_RE, 'Time must look like 17:00.'],
      validate: {
        validator(v) {
          return !this.startTime || v > this.startTime;
        },
        message: 'End time must be after the start time.',
      },
    },
    venue: { type: String, required: [true, 'Enter the venue.'], trim: true, maxlength: 200 },
    capacity: { type: Number, required: [true, 'Enter how many people can attend.'], min: [1, 'Capacity must be at least 1.'] },
    ticketPrice: { type: Number, default: 0, min: [0, 'Price can’t be negative.'] },
    organizerEmail: {
      type: String,
      required: [true, 'Enter a valid email address.'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address.'],
    },
    payment: { type: paymentSchema, default: () => ({ status: 'unpaid' }) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // A populated category arrives as { id, name }; an unpopulated one stays an id string.
        if (ret.category && typeof ret.category === 'object' && ret.category._id) {
          ret.category = { id: ret.category._id.toString(), name: ret.category.name };
        }
        return ret;
      },
    },
  }
);

eventSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model('Event', eventSchema);
