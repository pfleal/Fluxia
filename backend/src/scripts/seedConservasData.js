const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importar modelos
const Product = require('../models/appModels/Product');
const BillOfMaterial = require('../models/appModels/BillOfMaterial');
const Admin = require('../models/coreModels/Admin');

async function seedConservasData() {
  try {
    console.log('Iniciando cadastro de produtos e processos de conservas...');

    // Buscar um admin para associar aos registros
    const admin = await Admin.findOne({ enabled: true });
    if (!admin) {
      console.error('Nenhum admin encontrado. Execute primeiro o seed de admin.');
      return;
    }

    // 1. MATÉRIAS-PRIMAS E INSUMOS
    const materiasPrimas = [
      {
        name: 'Pepino Fresco',
        sku: 'MP-PEP-001',
        description: 'Pepino fresco para conserva, tamanho médio',
        type: 'raw',
        unit: 'kg',
        costPrice: 3.50,
        sellingPrice: 0,
        trackExpiry: true,
        minStockQuantity: 50,
        maxStockQuantity: 500,
        createdBy: admin._id
      },
      {
        name: 'Palmito Fresco',
        sku: 'MP-PAL-001',
        description: 'Palmito fresco para conserva',
        type: 'raw',
        unit: 'kg',
        costPrice: 12.00,
        sellingPrice: 0,
        trackExpiry: true,
        minStockQuantity: 20,
        maxStockQuantity: 200,
        createdBy: admin._id
      },
      {
        name: 'Sal Refinado',
        sku: 'MP-SAL-001',
        description: 'Sal refinado para salmoura',
        type: 'raw',
        unit: 'kg',
        costPrice: 2.00,
        sellingPrice: 0,
        minStockQuantity: 100,
        maxStockQuantity: 1000,
        createdBy: admin._id
      },
      {
        name: 'Vinagre Branco',
        sku: 'MP-VIN-001',
        description: 'Vinagre branco para conserva',
        type: 'raw',
        unit: 'l',
        costPrice: 4.50,
        sellingPrice: 0,
        minStockQuantity: 50,
        maxStockQuantity: 500,
        createdBy: admin._id
      },
      {
        name: 'Açúcar Cristal',
        sku: 'MP-ACU-001',
        description: 'Açúcar cristal para salmoura',
        type: 'raw',
        unit: 'kg',
        costPrice: 3.20,
        sellingPrice: 0,
        minStockQuantity: 50,
        maxStockQuantity: 500,
        createdBy: admin._id
      },
      {
        name: 'Ácido Cítrico',
        sku: 'MP-ACI-001',
        description: 'Ácido cítrico para conservação',
        type: 'raw',
        unit: 'kg',
        costPrice: 15.00,
        sellingPrice: 0,
        minStockQuantity: 5,
        maxStockQuantity: 50,
        createdBy: admin._id
      },
      {
        name: 'Vidro 300ml',
        sku: 'EM-VID-300',
        description: 'Vidro para conserva 300ml com tampa',
        type: 'supply',
        unit: 'un',
        costPrice: 1.20,
        sellingPrice: 0,
        minStockQuantity: 500,
        maxStockQuantity: 5000,
        createdBy: admin._id
      },
      {
        name: 'Rótulo Conserva Pepino',
        sku: 'EM-ROT-PEP',
        description: 'Rótulo para conserva de pepino',
        type: 'supply',
        unit: 'un',
        costPrice: 0.15,
        sellingPrice: 0,
        minStockQuantity: 1000,
        maxStockQuantity: 10000,
        createdBy: admin._id
      },
      {
        name: 'Rótulo Conserva Palmito',
        sku: 'EM-ROT-PAL',
        description: 'Rótulo para conserva de palmito',
        type: 'supply',
        unit: 'un',
        costPrice: 0.15,
        sellingPrice: 0,
        minStockQuantity: 1000,
        maxStockQuantity: 10000,
        createdBy: admin._id
      }
    ];

    // 2. PRODUTOS FINAIS
    const produtosFinais = [
      {
        name: 'Conserva de Pepino 300ml',
        sku: 'PF-CON-PEP-300',
        description: 'Conserva de pepino em vidro de 300ml',
        type: 'finished',
        unit: 'un',
        costPrice: 0, // Será calculado pela ficha técnica
        sellingPrice: 8.50,
        trackLot: true,
        trackExpiry: true,
        minStockQuantity: 50,
        maxStockQuantity: 1000,
        weight: 0.5,
        dimensions: {
          length: 6,
          width: 6,
          height: 12
        },
        createdBy: admin._id
      },
      {
        name: 'Conserva de Palmito 300ml',
        sku: 'PF-CON-PAL-300',
        description: 'Conserva de palmito em vidro de 300ml',
        type: 'finished',
        unit: 'un',
        costPrice: 0, // Será calculado pela ficha técnica
        sellingPrice: 15.90,
        trackLot: true,
        trackExpiry: true,
        minStockQuantity: 30,
        maxStockQuantity: 500,
        weight: 0.5,
        dimensions: {
          length: 6,
          width: 6,
          height: 12
        },
        createdBy: admin._id
      }
    ];

    // Inserir matérias-primas
    console.log('Inserindo matérias-primas...');
    const materiasInseridas = await Product.insertMany(materiasPrimas);
    console.log(`${materiasInseridas.length} matérias-primas inseridas.`);

    // Inserir produtos finais
    console.log('Inserindo produtos finais...');
    const produtosInseridos = await Product.insertMany(produtosFinais);
    console.log(`${produtosInseridos.length} produtos finais inseridos.`);

    // Mapear produtos por SKU para facilitar referências
    const produtosPorSku = {};
    [...materiasInseridas, ...produtosInseridos].forEach(produto => {
      produtosPorSku[produto.sku] = produto._id;
    });

    // 3. FICHAS TÉCNICAS (BILL OF MATERIALS)
    
    // Ficha técnica para Conserva de Pepino
    const bomPepino = {
      name: 'Ficha Técnica - Conserva de Pepino 300ml',
      code: 'BOM-CON-PEP-300',
      description: 'Processo de fabricação de conserva de pepino em vidro de 300ml',
      version: '1.0',
      isDefault: true,
      product: produtosPorSku['PF-CON-PEP-300'],
      outputQuantity: 10, // 10 unidades por lote
      components: [
        {
          product: produtosPorSku['MP-PEP-001'],
          quantity: 3,
          unit: 'kg',
          wastagePercentage: 15,
          notes: 'Pepinos frescos, tamanho médio uniforme'
        },
        {
          product: produtosPorSku['MP-SAL-001'],
          quantity: 0.3,
          unit: 'kg',
          wastagePercentage: 0,
          notes: 'Para salmoura'
        },
        {
          product: produtosPorSku['MP-VIN-001'],
          quantity: 1.5,
          unit: 'l',
          wastagePercentage: 5,
          notes: 'Vinagre branco para acidificação'
        },
        {
          product: produtosPorSku['MP-ACU-001'],
          quantity: 0.2,
          unit: 'kg',
          wastagePercentage: 0,
          notes: 'Para balanceamento do sabor'
        },
        {
          product: produtosPorSku['MP-ACI-001'],
          quantity: 0.01,
          unit: 'kg',
          wastagePercentage: 0,
          notes: 'Conservante natural'
        },
        {
          product: produtosPorSku['EM-VID-300'],
          quantity: 10,
          unit: 'un',
          wastagePercentage: 2,
          notes: 'Vidros esterilizados'
        },
        {
          product: produtosPorSku['EM-ROT-PEP'],
          quantity: 10,
          unit: 'un',
          wastagePercentage: 1,
          notes: 'Rótulos aplicados após resfriamento'
        }
      ],
      instructions: [
        {
          stepNumber: 1,
          description: 'Seleção e lavagem dos pepinos: Escolher pepinos frescos, firmes e de tamanho uniforme. Lavar em água corrente e remover imperfeições.',
          estimatedTime: 30
        },
        {
          stepNumber: 2,
          description: 'Corte e preparação: Cortar os pepinos em fatias ou bastões conforme especificação. Remover sementes se necessário.',
          estimatedTime: 45
        },
        {
          stepNumber: 3,
          description: 'Pré-tratamento salino: Colocar os pepinos cortados em salmoura leve (2% sal) por 2 horas para remoção do excesso de água.',
          estimatedTime: 120
        },
        {
          stepNumber: 4,
          description: 'Preparação da salmoura: Misturar água, vinagre, sal, açúcar e ácido cítrico. Aquecer até dissolução completa dos sólidos.',
          estimatedTime: 20
        },
        {
          stepNumber: 5,
          description: 'Envase: Encher os vidros esterilizados com pepinos, deixando 2cm de espaço livre. Completar com salmoura quente.',
          estimatedTime: 60
        },
        {
          stepNumber: 6,
          description: 'Fechamento: Fechar hermeticamente os vidros com tampas esterilizadas.',
          estimatedTime: 15
        },
        {
          stepNumber: 7,
          description: 'Esterilização: Processar em banho-maria a 85°C por 20 minutos para garantir a segurança microbiológica.',
          estimatedTime: 30
        },
        {
          stepNumber: 8,
          description: 'Resfriamento: Resfriar gradualmente até temperatura ambiente. Verificar vedação das tampas.',
          estimatedTime: 60
        },
        {
          stepNumber: 9,
          description: 'Rotulagem e armazenamento: Aplicar rótulos e armazenar em local seco e arejado.',
          estimatedTime: 20
        }
      ],
      additionalCosts: [
        {
          name: 'Energia (gás/eletricidade)',
          value: 5.00,
          type: 'fixed'
        },
        {
          name: 'Mão de obra',
          value: 15.00,
          type: 'fixed'
        }
      ],
      createdBy: admin._id
    };

    // Ficha técnica para Conserva de Palmito
    const bomPalmito = {
      name: 'Ficha Técnica - Conserva de Palmito 300ml',
      code: 'BOM-CON-PAL-300',
      description: 'Processo de fabricação de conserva de palmito em vidro de 300ml',
      version: '1.0',
      isDefault: true,
      product: produtosPorSku['PF-CON-PAL-300'],
      outputQuantity: 8, // 8 unidades por lote
      components: [
        {
          product: produtosPorSku['MP-PAL-001'],
          quantity: 2.5,
          unit: 'kg',
          wastagePercentage: 20,
          notes: 'Palmito fresco, cortes uniformes'
        },
        {
          product: produtosPorSku['MP-SAL-001'],
          quantity: 0.25,
          unit: 'kg',
          wastagePercentage: 0,
          notes: 'Para salmoura'
        },
        {
          product: produtosPorSku['MP-VIN-001'],
          quantity: 0.5,
          unit: 'l',
          wastagePercentage: 5,
          notes: 'Vinagre branco para acidificação'
        },
        {
          product: produtosPorSku['MP-ACI-001'],
          quantity: 0.008,
          unit: 'kg',
          wastagePercentage: 0,
          notes: 'Conservante natural'
        },
        {
          product: produtosPorSku['EM-VID-300'],
          quantity: 8,
          unit: 'un',
          wastagePercentage: 2,
          notes: 'Vidros esterilizados'
        },
        {
          product: produtosPorSku['EM-ROT-PAL'],
          quantity: 8,
          unit: 'un',
          wastagePercentage: 1,
          notes: 'Rótulos aplicados após resfriamento'
        }
      ],
      instructions: [
        {
          stepNumber: 1,
          description: 'Recepção e seleção: Receber palmitos frescos e selecionar apenas os de melhor qualidade, firmes e sem defeitos.',
          estimatedTime: 20
        },
        {
          stepNumber: 2,
          description: 'Limpeza inicial: Remover folhas externas e partes fibrosas. Lavar em água corrente.',
          estimatedTime: 40
        },
        {
          stepNumber: 3,
          description: 'Corte e padronização: Cortar em bastões de tamanho uniforme (8-10cm). Remover partes duras.',
          estimatedTime: 60
        },
        {
          stepNumber: 4,
          description: 'Branqueamento: Mergulhar em água fervente por 3-5 minutos para inativar enzimas e manter cor.',
          estimatedTime: 15
        },
        {
          stepNumber: 5,
          description: 'Resfriamento rápido: Resfriar imediatamente em água gelada para interromper o cozimento.',
          estimatedTime: 10
        },
        {
          stepNumber: 6,
          description: 'Preparação da salmoura: Misturar água, sal, vinagre e ácido cítrico. Aquecer até dissolução.',
          estimatedTime: 15
        },
        {
          stepNumber: 7,
          description: 'Envase: Acomodar palmitos nos vidros esterilizados, deixando 2cm livres. Completar com salmoura quente.',
          estimatedTime: 45
        },
        {
          stepNumber: 8,
          description: 'Fechamento hermético: Fechar vidros com tampas esterilizadas, garantindo vedação perfeita.',
          estimatedTime: 15
        },
        {
          stepNumber: 9,
          description: 'Esterilização: Processar em autoclave ou banho-maria a 100°C por 25 minutos.',
          estimatedTime: 35
        },
        {
          stepNumber: 10,
          description: 'Resfriamento controlado: Resfriar gradualmente para evitar choque térmico nos vidros.',
          estimatedTime: 90
        },
        {
          stepNumber: 11,
          description: 'Controle de qualidade: Verificar vedação, aparência e integridade dos produtos.',
          estimatedTime: 20
        },
        {
          stepNumber: 12,
          description: 'Rotulagem e armazenamento: Aplicar rótulos e armazenar em ambiente controlado.',
          estimatedTime: 25
        }
      ],
      additionalCosts: [
        {
          name: 'Energia (gás/eletricidade)',
          value: 8.00,
          type: 'fixed'
        },
        {
          name: 'Mão de obra especializada',
          value: 25.00,
          type: 'fixed'
        },
        {
          name: 'Controle de qualidade',
          value: 5.00,
          type: 'fixed'
        }
      ],
      createdBy: admin._id
    };

    // Inserir fichas técnicas
    console.log('Inserindo fichas técnicas...');
    const bomsInseridas = await BillOfMaterial.insertMany([bomPepino, bomPalmito]);
    console.log(`${bomsInseridas.length} fichas técnicas inseridas.`);

    console.log('\n=== RESUMO DO CADASTRO ===');
    console.log(`✅ ${materiasInseridas.length} matérias-primas cadastradas`);
    console.log(`✅ ${produtosInseridos.length} produtos finais cadastrados`);
    console.log(`✅ ${bomsInseridas.length} fichas técnicas cadastradas`);
    console.log('\nProcessos de fabricação de conservas cadastrados com sucesso!');
    
    console.log('\n=== PRODUTOS CADASTRADOS ===');
    console.log('Matérias-primas:');
    materiasInseridas.forEach(mp => console.log(`- ${mp.name} (${mp.sku})`));
    
    console.log('\nProdutos finais:');
    produtosInseridos.forEach(pf => console.log(`- ${pf.name} (${pf.sku}) - R$ ${pf.sellingPrice}`));
    
    console.log('\nFichas técnicas:');
    bomsInseridas.forEach(bom => console.log(`- ${bom.name} (${bom.code})`));

  } catch (error) {
    console.error('Erro ao cadastrar dados de conservas:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar o script
seedConservasData();