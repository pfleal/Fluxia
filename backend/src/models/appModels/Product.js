const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  // Informações básicas do produto
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['finished', 'raw', 'supply'],
    default: 'finished',
    required: true,
  },
  
  // Informações de estoque
  stockQuantity: {
    type: Number,
    default: 0,
  },
  minStockQuantity: {
    type: Number,
    default: 0,
  },
  maxStockQuantity: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
  },
  
  // Informações de custo e preço
  costPrice: {
    type: Number,
    default: 0,
  },
  sellingPrice: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'BRL',
    uppercase: true,
  },
  
  // Informações de rastreabilidade
  trackLot: {
    type: Boolean,
    default: false,
  },
  trackExpiry: {
    type: Boolean,
    default: false,
  },
  
  // Informações de dimensões e peso
  unit: {
    type: String,
    default: 'un',
  },
  weight: {
    type: Number,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  
  // Informações fiscais
  taxInfo: {
    taxable: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: mongoose.Schema.ObjectId,
      ref: 'Taxes',
      autopopulate: true,
    },
  },
  
  // Metadados
  createdBy: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Admin' 
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

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Product', schema);