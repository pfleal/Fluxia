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

  // Informações básicas da ordem de produção
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
  
  // Status da ordem de produção
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'planned',
  },
  
  // Datas de planejamento e execução
  plannedStartDate: {
    type: Date,
    required: true,
  },
  plannedEndDate: {
    type: Date,
    required: true,
  },
  actualStartDate: {
    type: Date,
  },
  actualEndDate: {
    type: Date,
  },
  
  // Produto e ficha técnica
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  billOfMaterial: {
    type: mongoose.Schema.ObjectId,
    ref: 'BillOfMaterial',
    required: true,
    autopopulate: true,
  },
  
  // Quantidades planejadas e produzidas
  plannedQuantity: {
    type: Number,
    required: true,
  },
  producedQuantity: {
    type: Number,
    default: 0,
  },
  rejectedQuantity: {
    type: Number,
    default: 0,
  },
  
  // Apontamentos de produção
  productionEntries: [
    {
      date: {
        type: Date,
        default: Date.now,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      rejectedQuantity: {
        type: Number,
        default: 0,
      },
      notes: {
        type: String,
      },
      recordedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
      }
    }
  ],
  
  // Consumo de materiais
  materialConsumption: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
        autopopulate: true,
      },
      plannedQuantity: {
        type: Number,
        required: true,
      },
      consumedQuantity: {
        type: Number,
        default: 0,
      },
      wastedQuantity: {
        type: Number,
        default: 0,
      }
    }
  ],
  
  // Custos de produção
  costs: {
    materialCost: {
      type: Number,
      default: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
    },
    overheadCost: {
      type: Number,
      default: 0,
    },
    additionalCosts: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    unitCost: {
      type: Number,
      default: 0,
    }
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

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('ProductionOrder', schema);