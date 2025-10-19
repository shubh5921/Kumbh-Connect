const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  guardian: {
    name:{
        type: String,
        trim: true,
    },
    phoneNumber:{
        type:String,
        trim:true,
    },
    relation:{
        type:String,
        trim:true,
    },
    address: {
        street: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        state: {
          type: String,
          trim: true,
        },
        postalCode: {
          type: String,
          trim: true,
        },
      },
  },
  centre:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Store",
    required:false,
  },
  images: [{
    url:{
        type: String,
        trim: true,
    }
  }],
  status: {
    type: String,
    enum: ['lost', 'found', 'returned'],
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  dateReported: {
    type: Date,
    default: Date.now,
  },
  returnedToGuardian: {
    type: Boolean,
    default: false,
  },
  returnedOn: {
    type: Date,
  }
});

module.exports = mongoose.model('Person', personSchema);
