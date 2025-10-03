const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Referência ao produto
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  
  // Quantidade atual em estoque
  currentStock: {
    type: Number,
    default: 0,
    required: true,
  },
  
  // Quantidade mínima em estoque (para alertas)
  minimumStock: {
    type: Number,
    default: 0,
  },
  
  // Quantidade máxima em estoque
  maximumStock: {
    type: Number,
    default: 0,
  },
  
  // Localização no estoque
  location: {
    warehouse: {
      type: String,
      default: 'Principal',
    },
    section: {
      type: String,
    },
    shelf: {
      type: String,
    },
    position: {
      type: String,
    }
  },
  
  // Valor total do estoque (quantidade * custo unitário)
  totalValue: {
    type: Number,
    default: 0,
  },
  
  // Data da última movimentação
  lastMovementDate: {
    type: Date,
  },
  
  // Tipo da última movimentação
  lastMovementType: {
    type: String,
    enum: ['purchase', 'production', 'sale', 'adjustment', 'transfer', 'return', 'waste'],
  },
  
  // Status do item no inventário
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
  },
  
  // Alertas
  alerts: {
    lowStock: {
      type: Boolean,
      default: false,
    },
    outOfStock: {
      type: Boolean,
      default: false,
    },
    overStock: {
      type: Boolean,
      default: false,
    }
  },
  
  // Metadados
  enabled: {
    type: Boolean,
    default: true,
  },
  removed: {
    type: Boolean,
    default: false,
  },
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

// Índices para melhor performance
schema.index({ product: 1 });
schema.index({ currentStock: 1 });
schema.index({ 'alerts.lowStock': 1 });
schema.index({ 'alerts.outOfStock': 1 });
schema.index({ status: 1 });
schema.index({ removed: 1 });

// Middleware para calcular alertas antes de salvar
schema.pre('save', function(next) {
  // Calcular alertas baseados no estoque atual
  this.alerts.outOfStock = this.currentStock <= 0;
  this.alerts.lowStock = this.currentStock > 0 && this.currentStock <= this.minimumStock;
  this.alerts.overStock = this.maximumStock > 0 && this.currentStock > this.maximumStock;
  
  // Calcular valor total do estoque
  if (this.product && this.product.costPrice) {
    this.totalValue = this.currentStock * this.product.costPrice;
  }
  
  next();
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Inventory', schema);