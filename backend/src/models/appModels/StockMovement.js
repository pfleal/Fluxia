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

  // Informações básicas do movimento de estoque
  number: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
  },
  description: {
    type: String,
  },
  
  // Tipo de movimento
  type: {
    type: String,
    enum: ['purchase', 'production', 'sale', 'adjustment', 'transfer', 'return', 'waste'],
    required: true,
  },
  
  // Data do movimento
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  
  // Produto movimentado
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  
  // Quantidade e direção do movimento
  quantity: {
    type: Number,
    required: true,
  },
  isIncrease: {
    type: Boolean,
    required: true,
  },
  
  // Localização de origem e destino (para transferências)
  sourceLocation: {
    type: String,
  },
  destinationLocation: {
    type: String,
  },
  
  // Informações de rastreabilidade
  lotNumber: {
    type: String,
  },
  expiryDate: {
    type: Date,
  },
  
  // Informações de custo
  unitCost: {
    type: Number,
  },
  totalCost: {
    type: Number,
  },
  currency: {
    type: String,
    default: 'BRL',
    uppercase: true,
  },
  
  // Documentos relacionados
  relatedDocuments: {
    // Relacionamento com outros documentos do sistema
    invoice: {
      type: mongoose.Schema.ObjectId,
      ref: 'Invoice',
    },
    quote: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quote',
    },
    productionOrder: {
      type: mongoose.Schema.ObjectId,
      ref: 'ProductionOrder',
    },
    // Outros documentos externos
    purchaseOrder: {
      number: String,
      date: Date,
      supplier: String,
    },
    deliveryNote: {
      number: String,
      date: Date,
    }
  },
  
  // Saldos antes e depois do movimento
  stockBefore: {
    type: Number,
  },
  stockAfter: {
    type: Number,
  },
  
  // Notas e observações
  notes: {
    type: String,
  },
  
  // Metadados
  createdBy: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Admin',
    required: true,
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

// Virtual field to calculate direction from isIncrease
schema.virtual('direction').get(function() {
  return this.isIncrease ? 'in' : 'out';
});

// Ensure virtual fields are serialized
schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('StockMovement', schema);