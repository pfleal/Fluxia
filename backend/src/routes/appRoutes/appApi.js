const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  // Rotas específicas para invoice, quote e payment
  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  // Rota específica para quote
  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
  
  // Rotas específicas para product
  if (entity === 'product') {
    router.route(`/${entity}/updateStock/:id`).patch(catchErrors(controller['updateStock']));
  }
  
  // Rotas específicas para billOfMaterial
  if (entity === 'billOfMaterial') {
    router.route(`/${entity}/calculateCost/:id`).get(catchErrors(controller['calculateCost']));
  }
  
  // Rotas específicas para productionOrder
  if (entity === 'productionOrder') {
    router.route(`/${entity}/startProduction/:id`).post(catchErrors(controller['startProduction']));
    router.route(`/${entity}/recordProduction/:id`).post(catchErrors(controller['recordProduction']));
    router.route(`/${entity}/completeProduction/:id`).post(catchErrors(controller['completeProduction']));
  }
  
  // Rotas específicas para inventory
  if (entity === 'inventory') {
    router.route(`/${entity}/stock-levels`).get(catchErrors(controller['stock-levels']));
    router.route(`/${entity}/category-analysis`).get(catchErrors(controller['category-analysis']));
    router.route(`/${entity}/movement-trends`).get(catchErrors(controller['movement-trends']));
    router.route(`/${entity}/top-products`).get(catchErrors(controller['top-products']));
    router.route(`/${entity}/low-stock-alerts`).get(catchErrors(controller['low-stock-alerts']));
    router.route(`/${entity}/sync`).post(catchErrors(controller['syncWithProducts']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;
