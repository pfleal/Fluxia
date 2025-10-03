import { useEffect, useState } from 'react';

import { Tag, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';

import { useMoney } from '@/settings';

import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';

import RecentTable from './components/RecentTable';

import SummaryCard from './components/SummaryCard';
import PreviewCard from './components/PreviewCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';
import IndustrialMetricsCard from './components/IndustrialMetricsCard';
import ProductionOverviewCard from './components/ProductionOverviewCard';
import InventoryStatusCard from './components/InventoryStatusCard';
import QualityMetricsCard from './components/QualityMetricsCard';

import { selectMoneyFormat } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';

export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);

  const getStatsData = async ({ entity, currency }) => {
    return await request.summary({
      entity,
      options: { currency },
    });
  };

  const {
    result: invoiceResult,
    isLoading: invoiceLoading,
    onFetch: fetchInvoicesStats,
  } = useOnFetch();

  const { result: quoteResult, isLoading: quoteLoading, onFetch: fetchQuotesStats } = useOnFetch();

  const {
    result: paymentResult,
    isLoading: paymentLoading,
    onFetch: fetchPayemntsStats,
  } = useOnFetch();

  // Industrial analytics data fetching
  const {
    result: productionResult,
    isLoading: productionLoading,
    onFetch: fetchProductionStats,
  } = useOnFetch();

  const {
    result: inventoryResult,
    isLoading: inventoryLoading,
    onFetch: fetchInventoryStats,
  } = useOnFetch();

  const {
    result: qualityResult,
    isLoading: qualityLoading,
    onFetch: fetchQualityStats,
  } = useOnFetch();

  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );

  useEffect(() => {
    const currency = money_format_settings.default_currency_code || null;

    if (currency) {
      fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
      fetchQuotesStats(getStatsData({ entity: 'quote', currency }));
      fetchPayemntsStats(getStatsData({ entity: 'payment', currency }));
      
      // Fetch industrial analytics data
      fetchProductionStats(request.summary({ entity: 'productionOrder' }));
      fetchInventoryStats(request.summary({ entity: 'product' }));
      fetchQualityStats(request.summary({ entity: 'quality' }));
    }
  }, [money_format_settings.default_currency_code]);

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },

    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const entityData = [
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Invoices'),
    },
    {
      result: quoteResult,
      isLoading: quoteLoading,
      entity: 'quote',
      title: translate('quote'),
    },
  ];

  const statisticCards = entityData.map((data, index) => {
    const { result, entity, isLoading, title } = data;

    return (
      <PreviewCard
        key={index}
        title={title}
        isLoading={isLoading}
        entity={entity}
        statistics={
          !isLoading &&
          result?.performance?.map((item) => ({
            tag: item?.status,
            color: 'blue',
            value: item?.percentage,
          }))
        }
      />
    );
  });

  if (money_format_settings) {
    return (
      <>
        <Row gutter={[32, 32]}>
          <SummaryCard
            title={translate('Invoices')}
            prefix={translate('This month')}
            isLoading={invoiceLoading}
            data={invoiceResult?.total}
          />
          <SummaryCard
            title={translate('Quote')}
            prefix={translate('This month')}
            isLoading={quoteLoading}
            data={quoteResult?.total}
          />
          <SummaryCard
            title={translate('paid')}
            prefix={translate('This month')}
            isLoading={paymentLoading}
            data={paymentResult?.total}
          />
          <SummaryCard
            title={translate('Unpaid')}
            prefix={translate('Not Paid')}
            isLoading={invoiceLoading}
            data={invoiceResult?.total_undue}
          />
        </Row>
        <div className="space30"></div>
        
        {/* Industrial Analytics Section */}
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }}>
            <IndustrialMetricsCard
              isLoading={productionLoading}
              productionEfficiency={productionResult?.efficiency || 0}
              stockTurnover={inventoryResult?.turnover || 0}
              qualityRate={qualityResult?.qualityRate || 0}
              onTimeDelivery={productionResult?.onTimeDelivery || 0}
            />
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }}>
            <ProductionOverviewCard
              isLoading={productionLoading}
              activeOrders={productionResult?.activeOrders || 0}
              completedOrders={productionResult?.completedOrders || 0}
              pendingOrders={productionResult?.pendingOrders || 0}
              delayedOrders={productionResult?.delayedOrders || 0}
              recentOrders={productionResult?.recentOrders || []}
            />
          </Col>
        </Row>
        <div className="space30"></div>
        
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }}>
            <InventoryStatusCard
              isLoading={inventoryLoading}
              totalProducts={inventoryResult?.totalProducts || 0}
              lowStockProducts={inventoryResult?.lowStockProducts || 0}
              outOfStockProducts={inventoryResult?.outOfStockProducts || 0}
              stockValue={inventoryResult?.stockValue || 0}
              criticalItems={inventoryResult?.criticalItems || []}
            />
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }}>
            <QualityMetricsCard
              isLoading={qualityLoading}
              qualityRate={qualityResult?.qualityRate || 0}
              defectRate={qualityResult?.defectRate || 0}
              reworkRate={qualityResult?.reworkRate || 0}
              customerComplaints={qualityResult?.customerComplaints || 0}
              qualityTrends={qualityResult?.qualityTrends || []}
            />
          </Col>
        </Row>
        <div className="space30"></div>
        
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 18 }}>
            <div className="whiteBox shadow" style={{ height: 458 }}>
              <Row className="pad20" gutter={[0, 0]}>
                {statisticCards}
              </Row>
            </div>
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 6 }}>
            <CustomerPreviewCard
              isLoading={clientLoading}
              activeCustomer={clientResult?.active}
              newCustomer={clientResult?.new}
            />
          </Col>
        </Row>
        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Invoices')}
              </h3>

              <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
            </div>
          </Col>

          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Quotes')}
              </h3>
              <RecentTable entity={'quote'} dataTableColumns={dataTableColumns} />
            </div>
          </Col>
        </Row>
      </>
    );
  } else {
    return <></>;
  }
}
