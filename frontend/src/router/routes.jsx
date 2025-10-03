import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazy(() => import('@/pages/Quote/index'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));

// Production Order pages
const ProductionOrder = lazy(() => import('@/pages/ProductionOrder/index'));
const ProductionOrderCreate = lazy(() => import('@/pages/ProductionOrder/ProductionOrderCreate'));
const ProductionOrderRead = lazy(() => import('@/pages/ProductionOrder/ProductionOrderRead'));
const ProductionOrderUpdate = lazy(() => import('@/pages/ProductionOrder/ProductionOrderUpdate'));

// Páginas de Movimentação de Estoque
const StockMovement = lazy(() => import('@/pages/StockMovement/index'));
const StockMovementCreate = lazy(() => import('@/pages/StockMovement/StockMovementCreate'));
const StockMovementRead = lazy(() => import('@/pages/StockMovement/StockMovementRead'));
const StockMovementUpdate = lazy(() => import('@/pages/StockMovement/StockMovementUpdate'));

const Profile = lazy(() => import('@/pages/Profile'));

const About = lazy(() => import('@/pages/About'));

// Reports
const InventoryReport = lazy(() => import('@/pages/Reports/InventoryReport'));
const StockAnalysis = lazy(() => import('@/pages/Reports/StockAnalysis'));

// Production Planning
const ProductionPlanning = lazy(() => import('@/pages/ProductionPlanning/ProductionPlanning'));

// Product pages
const Product = lazy(() => import('@/pages/Product/index'));
const ProductCreate = lazy(() => import('@/pages/Product/ProductCreate'));
const ProductRead = lazy(() => import('@/pages/Product/ProductRead'));
const ProductUpdate = lazy(() => import('@/pages/Product/ProductUpdate'));

// Bill of Material pages
const BillOfMaterial = lazy(() => import('@/pages/BillOfMaterial/index'));
const BillOfMaterialCreate = lazy(() => import('@/pages/BillOfMaterial/BillOfMaterialCreate'));
const BillOfMaterialRead = lazy(() => import('@/pages/BillOfMaterial/BillOfMaterialRead'));
const BillOfMaterialUpdate = lazy(() => import('@/pages/BillOfMaterial/BillOfMaterialUpdate'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/taxes',
      element: <Taxes />,
    },

    // Production Order routes
    {
      path: '/production-order',
      element: <ProductionOrder />,
    },
    {
      path: '/production-order/create',
      element: <ProductionOrderCreate />,
    },
    {
      path: '/production-order/read/:id',
      element: <ProductionOrderRead />,
    },
    {
      path: '/production-order/update/:id',
      element: <ProductionOrderUpdate />,
    },

    // Rotas de Movimentação de Estoque
    {
      path: '/stockmovement',
      element: <StockMovement />,
    },
    {
      path: '/stockmovement/create',
      element: <StockMovementCreate />,
    },
    {
      path: '/stockmovement/read/:id',
      element: <StockMovementRead />,
    },
    {
      path: '/stockmovement/update/:id',
      element: <StockMovementUpdate />,
    },

    // Reports
    {
      path: '/reports/inventory',
      element: <InventoryReport />,
    },
    {
      path: '/reports/stock-analysis',
      element: <StockAnalysis />,
    },
    
    // Production Planning
    {
      path: '/production-planning',
      element: <ProductionPlanning />,
    },
    
    // Product routes
    {
      path: '/product',
      element: <Product />,
    },
    {
      path: '/product/create',
      element: <ProductCreate />,
    },
    {
      path: '/product/read/:id',
      element: <ProductRead />,
    },
    {
      path: '/product/update/:id',
      element: <ProductUpdate />,
    },

    // Bill of Material routes
    {
      path: '/billofmaterial',
      element: <BillOfMaterial />,
    },
    {
      path: '/billofmaterial/create',
      element: <BillOfMaterialCreate />,
    },
    {
      path: '/billofmaterial/read/:id',
      element: <BillOfMaterialRead />,
    },
    {
      path: '/billofmaterial/update/:id',
      element: <BillOfMaterialUpdate />,
    },
    
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
