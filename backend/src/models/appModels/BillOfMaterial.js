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

  // Informações básicas da ficha técnica
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  version: {
    type: String,
    default: '1.0',
  },
  isDefault: {
    type: Boolean,
    default: true,
  },
  
  // Produto final que será produzido
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  
  // Quantidade produzida com esta ficha técnica
  outputQuantity: {
    type: Number,
    required: true,
    default: 1,
  },
  
  // Componentes (matérias-primas e insumos)
  components: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
        autopopulate: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
      },
      wastagePercentage: {
        type: Number,
        default: 0,
      },
      isOptional: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: String,
      }
    }
  ],
  
  // Instruções de produção
  instructions: [
    {
      stepNumber: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      estimatedTime: {
        type: Number, // em minutos
      }
    }
  ],
  
  // Custos adicionais
  additionalCosts: [
    {
      name: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed',
      }
    }
  ],
  
  // Custo total calculado
  totalCost: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model('BillOfMaterial', schema);