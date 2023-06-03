const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  fullname: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    unique: true,
    required: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  interactions: {
    type: Number,
    default: 0
  },
isLoggedIn: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
