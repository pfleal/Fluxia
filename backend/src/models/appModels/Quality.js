const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  
  // Quality metrics
  qualityRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  defectRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  reworkRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  customerComplaints: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Quality trends data
  qualityTrends: [{
    period: {
      type: String,
      required: true,
    },
    qualityRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    defectRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    unitsProduced: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
  },
  
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  
  created: {
    type: Date,
    default: Date.now,
  },
  
  updated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quality', qualitySchema);