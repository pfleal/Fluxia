const mongoose = require('mongoose');
const Model = mongoose.model('ProductionOrder');
const Product = mongoose.model('Product');
const BillOfMaterial = mongoose.model('BillOfMaterial');
const StockMovement = mongoose.model('StockMovement');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('ProductionOrder');

const summary = require('./summary');
const startProduction = require('./startProduction');
const recordProduction = require('./recordProduction');
const completeProduction = require('./completeProduction');

// Sobrescrever o método create padrão
methods.create = async (req, res) => {
  try {
    console.log('🚀 ~ Production Order Create Request Body:', req.body);
    
    const { billOfMaterial, product } = req.body;
    
    console.log('🚀 ~ BOM ID from request:', billOfMaterial);
    console.log('🚀 ~ Product ID from request:', product);

    // Validate required fields
    if (!billOfMaterial || !product) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Bill of Material and Product are required',
      });
    }

    // Find the Product to validate
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Product not found',
      });
    }

    // Find the BillOfMaterial to validate (using raw query to avoid autopopulate)
    const bom = await BillOfMaterial.collection.findOne({ _id: new mongoose.Types.ObjectId(billOfMaterial), removed: false });
    
    if (!bom) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Bill of Material not found',
      });
    }

    // Validate that the BOM product matches the selected product
    // bom.product is now guaranteed to be just the ObjectId
    if (bom.product.toString() !== productDoc._id.toString()) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'A ficha técnica não corresponde ao produto selecionado',
      });
    }

    // Set default values for required fields if not provided
    if (!req.body.plannedStartDate) {
      req.body.plannedStartDate = new Date();
    }
    if (!req.body.plannedEndDate) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Default to 7 days from now
      req.body.plannedEndDate = endDate;
    }
    
    // Set year and number if not provided
    if (!req.body.year) {
      req.body.year = new Date().getFullYear();
    }
    if (!req.body.number) {
      // Generate a simple sequential number (in production, this should be more sophisticated)
      req.body.number = Math.floor(Math.random() * 10000) + 1;
    }
    
    // Change status from 'draft' to 'planned' to match enum values
    if (req.body.status === 'draft') {
      req.body.status = 'planned';
    }

    // Set default values for required fields
    const productionOrderData = {
      ...req.body,
      status: req.body.status || 'planned', // Use valid enum value instead of 'draft'
      createdBy: req.admin._id,
    };

    // Create the production order
    const result = await new Model(productionOrderData).save();

    return res.status(200).json({
      success: true,
      result,
      message: 'Production Order created successfully',
    });
  } catch (error) {
    console.error('Error creating production order:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

// Sobrescrever o método update padrão
methods.update = async (req, res) => {
  try {
    // Buscar a ordem de produção atual
    const currentOrder = await Model.findOne({ _id: req.params.id, removed: false });
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ordem de produção não encontrada',
      });
    }

    // Verificar se a ordem já foi iniciada
    if (currentOrder.status !== 'planned' && currentOrder.status !== 'on_hold') {
      // Se a ordem já foi iniciada, limitar os campos que podem ser atualizados
      const allowedUpdates = ['description', 'notes', 'plannedEndDate'];
      const requestedUpdates = Object.keys(req.body);
      
      const invalidUpdates = requestedUpdates.filter(update => !allowedUpdates.includes(update));
      
      if (invalidUpdates.length > 0) {
        return res.status(400).json({
          success: false,
          result: null,
          message: `Não é possível atualizar os campos ${invalidUpdates.join(', ')} após o início da produção`,
        });
      }
    }

    // Se estiver alterando o produto ou a ficha técnica, verificar a compatibilidade
    if (req.body.product || req.body.billOfMaterial) {
      const productId = req.body.product || currentOrder.product;
      const bomId = req.body.billOfMaterial || currentOrder.billOfMaterial;
      
      // Verificar se o produto existe
      const product = await Product.findOne({ _id: productId, removed: false });
      if (!product) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Produto não encontrado',
        });
      }

      // Verificar se a ficha técnica existe
      const bom = await BillOfMaterial.findOne({ _id: bomId, removed: false });
      if (!bom) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Ficha técnica não encontrada',
        });
      }

      // Verificar se a ficha técnica corresponde ao produto
      if (bom.product.toString() !== product._id.toString()) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'A ficha técnica não corresponde ao produto selecionado',
        });
      }

      // Se estiver alterando a ficha técnica ou a quantidade planejada, recalcular os materiais
      if (req.body.billOfMaterial || req.body.plannedQuantity) {
        // Apenas recalcular se a produção ainda não foi iniciada
        if (currentOrder.status === 'planned' || currentOrder.status === 'on_hold') {
          const plannedQuantity = req.body.plannedQuantity || currentOrder.plannedQuantity;
          
          // Preparar os materiais necessários com base na ficha técnica
          const materialConsumption = [];
          
          if (bom.components && bom.components.length > 0) {
            for (const component of bom.components) {
              const componentQuantity = component.quantity * plannedQuantity / bom.outputQuantity;
              
              materialConsumption.push({
                product: component.product,
                plannedQuantity: parseFloat(componentQuantity.toFixed(4)),
                consumedQuantity: 0,
                wastedQuantity: 0
              });
            }
          }
          
          // Adicionar ao corpo da requisição
          req.body.materialConsumption = materialConsumption;
        }
      }
    }

    // Atualizar a ordem de produção
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { ...req.body, updated: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      result,
      message: 'Ordem de produção atualizada com sucesso',
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

// Adicionar métodos personalizados
methods.summary = summary;
methods.startProduction = startProduction;
methods.recordProduction = recordProduction;
methods.completeProduction = completeProduction;

module.exports = methods;