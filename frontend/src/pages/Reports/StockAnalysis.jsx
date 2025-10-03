import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, DatePicker, Button, Statistic, Alert, Tabs, Space, Input, Tag } from 'antd';
import { 
  LineChartOutlined, 
  WarningOutlined, 
  SearchOutlined, 
  FilterOutlined 
} from '@ant-design/icons';
import { Line, Column, Area } from '@ant-design/plots';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { ErpLayout } from '@/layout';
import { request } from '@/request';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

export default function StockAnalysis() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [analysisData, setAnalysisData] = useState({
    trends: [],
    forecast: [],
    turnoverAnalysis: [],
    abcAnalysis: [],
    seasonalityData: [],
    stockoutRisk: [],
    reorderRecommendations: []
  });
  
  const [filters, setFilters] = useState({
    dateRange: null,
    category: 'all',
    analysisType: 'all'
  });

  useEffect(() => {
    fetchAnalysisData();
  }, [filters, activeTab]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      // Mock comprehensive analysis data
      setAnalysisData({
        trends: [
          { date: '2024-01', consumption: 1200, replenishment: 1350, stockLevel: 2500 },
          { date: '2024-02', consumption: 1100, replenishment: 1200, stockLevel: 2600 },
          { date: '2024-03', consumption: 1250, replenishment: 1180, stockLevel: 2530 },
          { date: '2024-04', consumption: 1180, replenishment: 1420, stockLevel: 2770 },
          { date: '2024-05', consumption: 1320, replenishment: 1380, stockLevel: 2830 },
          { date: '2024-06', consumption: 1400, replenishment: 1500, stockLevel: 2930 }
        ],
        forecast: [
          { month: 'Jul 2024', predicted: 1450, confidence: 85, lower: 1320, upper: 1580 },
          { month: 'Aug 2024', predicted: 1380, confidence: 82, lower: 1250, upper: 1510 },
          { month: 'Sep 2024', predicted: 1520, confidence: 78, lower: 1380, upper: 1660 },
          { month: 'Oct 2024', predicted: 1600, confidence: 75, lower: 1450, upper: 1750 },
          { month: 'Nov 2024', predicted: 1480, confidence: 72, lower: 1330, upper: 1630 },
          { month: 'Dec 2024', predicted: 1350, confidence: 70, lower: 1200, upper: 1500 }
        ],
        turnoverAnalysis: [
          { product: 'Steel Rods 10mm', turnoverRate: 8.2, daysOnHand: 44, category: 'Fast Moving' },
          { product: 'Aluminum Sheets', turnoverRate: 6.8, daysOnHand: 54, category: 'Fast Moving' },
          { product: 'Copper Wire 2.5mm', turnoverRate: 7.5, daysOnHand: 49, category: 'Fast Moving' },
          { product: 'Plastic Pellets', turnoverRate: 3.2, daysOnHand: 114, category: 'Slow Moving' },
          { product: 'Stainless Bolts M8', turnoverRate: 9.1, daysOnHand: 40, category: 'Fast Moving' },
          { product: 'Rubber Gaskets', turnoverRate: 1.8, daysOnHand: 203, category: 'Slow Moving' }
        ],
        abcAnalysis: [
          { category: 'A', products: 125, valuePercentage: 70, quantityPercentage: 20, description: 'High Value, Low Quantity' },
          { category: 'B', products: 250, valuePercentage: 20, quantityPercentage: 30, description: 'Medium Value, Medium Quantity' },
          { category: 'C', products: 875, valuePercentage: 10, quantityPercentage: 50, description: 'Low Value, High Quantity' }
        ],
        seasonalityData: [
          { month: 'Jan', factor: 0.85, demand: 1020 },
          { month: 'Feb', factor: 0.90, demand: 1080 },
          { month: 'Mar', factor: 1.15, demand: 1380 },
          { month: 'Apr', factor: 1.25, demand: 1500 },
          { month: 'May', factor: 1.30, demand: 1560 },
          { month: 'Jun', factor: 1.20, demand: 1440 },
          { month: 'Jul', factor: 1.10, demand: 1320 },
          { month: 'Aug', factor: 1.05, demand: 1260 },
          { month: 'Sep', factor: 1.15, demand: 1380 },
          { month: 'Oct', factor: 1.25, demand: 1500 },
          { month: 'Nov', factor: 0.95, demand: 1140 },
          { month: 'Dec', factor: 0.80, demand: 960 }
        ],
        stockoutRisk: [
          { product: 'Hydraulic Oil', currentStock: 5, avgConsumption: 12, daysUntilStockout: 10, risk: 'High' },
          { product: 'Safety Gloves', currentStock: 15, avgConsumption: 8, daysUntilStockout: 45, risk: 'Medium' },
          { product: 'Welding Rods', stockQuantity: 8, avgConsumption: 15, daysUntilStockout: 13, risk: 'High' },
          { product: 'Cutting Discs', currentStock: 22, avgConsumption: 6, daysUntilStockout: 88, risk: 'Low' }
        ],
        reorderRecommendations: [
          { product: 'Steel Rods 10mm', stockQuantity: 2500, reorderPoint: 3000, suggestedOrder: 1500, priority: 'Medium' },
          { product: 'Hydraulic Oil', currentStock: 5, reorderPoint: 20, suggestedOrder: 50, priority: 'Urgent' },
          { product: 'Aluminum Sheets', currentStock: 1800, reorderPoint: 2200, suggestedOrder: 1000, priority: 'Medium' },
          { product: 'Welding Rods', currentStock: 8, reorderPoint: 25, suggestedOrder: 100, priority: 'Urgent' }
        ]
      });
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendColumns = [
    {
      title: translate('product'),
      dataIndex: 'product',
      key: 'product',
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: (value, record) => record.product.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: translate('turnover_rate'),
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (value) => `${value}x`,
      sorter: (a, b) => a.turnoverRate - b.turnoverRate,
    },
    {
      title: translate('days_on_hand'),
      dataIndex: 'daysOnHand',
      key: 'daysOnHand',
      render: (value) => `${value} ${translate('days')}`,
      sorter: (a, b) => a.daysOnHand - b.daysOnHand,
    },
    {
      title: translate('category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'Fast Moving' ? 'green' : category === 'Slow Moving' ? 'orange' : 'red'}>
          {translate(category.toLowerCase().replace(' ', '_'))}
        </Tag>
      ),
      filters: [
        { text: translate('fast_moving'), value: 'Fast Moving' },
        { text: translate('slow_moving'), value: 'Slow Moving' },
      ],
      onFilter: (value, record) => record.category === value,
    }
  ];

  const riskColumns = [
    {
      title: translate('product'),
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: translate('current_stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
    },
    {
      title: translate('avg_consumption'),
      dataIndex: 'avgConsumption',
      key: 'avgConsumption',
      render: (value) => `${value}/${translate('day')}`,
    },
    {
      title: translate('days_until_stockout'),
      dataIndex: 'daysUntilStockout',
      key: 'daysUntilStockout',
      render: (value) => `${value} ${translate('days')}`,
      sorter: (a, b) => a.daysUntilStockout - b.daysUntilStockout,
    },
    {
      title: translate('risk_level'),
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => (
        <Tag color={risk === 'High' ? 'red' : risk === 'Medium' ? 'orange' : 'green'}>
          {translate(risk.toLowerCase())}
        </Tag>
      ),
    }
  ];

  const reorderColumns = [
    {
      title: translate('product'),
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: translate('current_stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
    },
    {
      title: translate('reorder_point'),
      dataIndex: 'reorderPoint',
      key: 'reorderPoint',
    },
    {
      title: translate('suggested_order_quantity'),
      dataIndex: 'suggestedOrder',
      key: 'suggestedOrder',
    },
    {
      title: translate('priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'Urgent' ? 'red' : priority === 'High' ? 'orange' : 'blue'}>
          {translate(priority.toLowerCase())}
        </Tag>
      ),
    }
  ];

  const trendConfig = {
    data: analysisData.trends,
    xField: 'date',
    yField: 'stockLevel',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  const forecastConfig = {
    data: analysisData.forecast,
    xField: 'month',
    yField: 'predicted',
    smooth: true,
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
        fillOpacity: 0.3,
      },
    },
  };

  const seasonalityConfig = {
    data: analysisData.seasonalityData,
    xField: 'month',
    yField: 'factor',
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
  };

  return (
    <ErpLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <h2 style={{ margin: 0 }}>
              <LineChartOutlined style={{ marginRight: 8 }} />
              {translate('stock_analysis')}
            </h2>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder={translate('search_products')}
                allowClear
                onSearch={setSearchTerm}
                style={{ width: 200 }}
              />
              <Button icon={<FilterOutlined />}>
                {translate('advanced_filters')}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Alert for Critical Items */}
        <Alert
          message={translate('critical_stock_alert')}
          description={translate('critical_stock_description')}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />

        {/* Analysis Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={translate('stock_trends')} key="trends">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title={translate('stock_level_trends')} loading={loading}>
                  <Line {...trendConfig} height={300} />
                </Card>
              </Col>
              <Col span={24}>
                <Card title={translate('turnover_analysis')} loading={loading}>
                  <Table
                    dataSource={analysisData.turnoverAnalysis}
                    columns={trendColumns}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={translate('demand_forecast')} key="forecast">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title={translate('demand_forecast_6_months')} loading={loading}>
                  <Area {...forecastConfig} height={300} />
                </Card>
              </Col>
              <Col span={24}>
                <Card title={translate('seasonality_analysis')} loading={loading}>
                  <Column {...seasonalityConfig} height={300} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={translate('abc_analysis')} key="abc">
            <Row gutter={[24, 24]}>
              {analysisData.abcAnalysis.map((item) => (
                <Col xs={24} md={8} key={item.category}>
                  <Card>
                    <Statistic
                      title={`${translate('category')} ${item.category}`}
                      value={item.products}
                      suffix={translate('products')}
                    />
                    <div style={{ marginTop: 16 }}>
                      <div>{translate('value_percentage')}: {item.valuePercentage}%</div>
                      <div>{translate('quantity_percentage')}: {item.quantityPercentage}%</div>
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        {item.description}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab={translate('stockout_risk')} key="risk">
            <Card title={translate('stockout_risk_analysis')} loading={loading}>
              <Table
                dataSource={analysisData.stockoutRisk}
                columns={riskColumns}
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab={translate('reorder_recommendations')} key="reorder">
            <Card title={translate('reorder_recommendations')} loading={loading}>
              <Table
                dataSource={analysisData.reorderRecommendations}
                columns={reorderColumns}
                pagination={false}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </ErpLayout>
  );
}