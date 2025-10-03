const mongoose = require('mongoose');

const ProductionOrder = mongoose.model('ProductionOrder');
const BillOfMaterial = mongoose.model('BillOfMaterial');

const completeProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      laborCost = 0, 
      overheadCost = 0, 
      additionalCosts = 0,
      notes 
    } = req.body;

    // Buscar a ordem de produção
    const order = await ProductionOrder.findOne({ 
      _id: id, 
      removed: false 
    }).populate('materialConsumption.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ordem de produção não encontrada',
      });
    }

    // Verificar se a ordem está em andamento
    if (order.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Ordem de produção não está em andamento',
      });
    }

    // Verificar se houve produção
    if (order.producedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Não há produção registrada para esta ordem',
      });
    }

    // Calcular o custo dos materiais
    let materialCost = 0;
    
    for (const material of order.materialConsumption) {
      const product = material.product;
      materialCost += product.costPrice * material.consumedQuantity;
    }

    // Calcular o custo total
    const totalCost = materialCost + laborCost + overheadCost + additionalCosts;
    
    // Calcular o custo unitário
    const unitCost = order.producedQuantity > 0 ? totalCost / order.producedQuantity : 0;

    // Atualizar a ordem de produção
    const actualEndDate = new Date();
    
    const updatedOrder = await ProductionOrder.findOneAndUpdate(
      { _id: id },
      { 
        status: 'completed',
        actualEndDate,
        costs: {
          materialCost,
          laborCost,
          overheadCost,
          additionalCosts,
          totalCost,
          unitCost
        },
        notes: notes ? (order.notes ? `${order.notes}\n\n${notes}` : notes) : order.notes,
        updated: Date.now()
      },
      { new: true }
    );

    // Buscar a ficha técnica para comparar custos planejados vs. reais
    const bom = await BillOfMaterial.findOne({ _id: order.billOfMaterial });
    
    // Calcular a diferença de custo
    const plannedUnitCost = bom ? bom.totalCost / bom.outputQuantity : 0;
    const costDifference = unitCost - plannedUnitCost;
    const costDifferencePercentage = plannedUnitCost > 0 ? (costDifference / plannedUnitCost) * 100 : 0;

    return res.status(200).json({
      success: true,
      result: {
        productionOrder: updatedOrder,
        costAnalysis: {
          plannedUnitCost,
          actualUnitCost: unitCost,
          costDifference,
          costDifferencePercentage: parseFloat(costDifferencePercentage.toFixed(2))
        }
      },
      message: 'Produção concluída com sucesso',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

module.exports = completeProduction;