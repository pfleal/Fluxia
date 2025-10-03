import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, DatePicker, Button, Statistic, Progress, Tag, Space, Divider } from 'antd';
import { BarChartOutlined, FileExcelOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons';
import { Bar, Pie, Line } from '@ant-design/charts';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { ErpLayout } from '@/layout';
import { request } from '@/request';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function InventoryReport() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      averageTurnover: 0
    },
    stockLevels: [],
    categoryAnalysis: [],
    movementTrends: [],
    topProducts: [],
    lowStockAlerts: []
  });
  
  const [filters, setFilters] = useState({
    dateRange: null,
    category: 'all',
    location: 'all',
    reportType: 'summary'
  });

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // API calls for different report data
      const [summaryRes, stockRes, categoryRes, movementRes, topProductsRes, alertsRes] = await Promise.all([
        request.get({ entity: 'inventory/summary', params: filters }),
        request.get({ entity: 'inventory/stock-levels', params: filters }),
        request.get({ entity: 'inventory/category-analysis', params: filters }),
        request.get({ entity: 'inventory/movement-trends', params: filters }),
        request.get({ entity: 'inventory/top-products', params: filters }),
        request.get({ entity: 'inventory/low-stock-alerts', params: filters })
      ]);

      // Use real data from APIs
      setReportData({
        summary: {
          totalProducts: summaryRes?.result?.overview?.totalProducts || 0,
          totalValue: summaryRes?.result?.overview?.totalInventoryValue || 0,
          lowStockItems: summaryRes?.result?.overview?.lowStockCount || 0,
          outOfStockItems: summaryRes?.result?.overview?.outOfStockCount || 0,
          averageTurnover: summaryRes?.result?.overview?.averageTurnover || 0
        },
        stockLevels: stockRes?.result || [],
        categoryAnalysis: categoryRes?.result || summaryRes?.result?.categoryStats || [],
        movementTrends: movementRes?.result || [],
        topProducts: topProductsRes?.result || summaryRes?.result?.topValueProducts || [],
        lowStockAlerts: alertsRes?.result || summaryRes?.result?.alerts || []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    // Implementation for export functionality
    console.log(`Exporting report in ${format} format`);
  };

  const stockLevelColumns = [
    {
      title: translate('category'),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: translate('in_stock'),
      dataIndex: 'inStock',
      key: 'inStock',
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: translate('low_stock'),
      dataIndex: 'lowStock',
      key: 'lowStock',
      render: (value) => <Tag color="orange">{value}</Tag>
    },
    {
      title: translate('out_of_stock'),
      dataIndex: 'outOfStock',
      key: 'outOfStock',
      render: (value) => <Tag color="red">{value}</Tag>
    }
  ];

  const topProductsColumns = [
    {
      title: translate('product'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('sku'),
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: translate('current_stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value) => value ? value.toLocaleString() : '0'
    },
    {
      title: translate('value'),
      dataIndex: 'value',
      key: 'value',
      render: (value) => moneyFormatter({ amount: value || 0 })
    },
    {
      title: translate('turnover_rate'),
      dataIndex: 'turnover',
      key: 'turnover',
      render: (value) => `${value || 0}x`
    }
  ];

  const alertsColumns = [
    {
      title: translate('product'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('sku'),
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: translate('current_stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
    },
    {
      title: translate('minimum_stock'),
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'critical' ? 'red' : 'orange'}>
          {translate(status)}
        </Tag>
      )
    }
  ];

  const barConfig = {
    data: reportData.movementTrends || [],
    xField: 'month',
    yField: 'value',
    height: 300,
    // Simplified configuration to avoid getBandWidth errors
    autoFit: true,
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  const pieConfig = {
    data: reportData.categoryAnalysis || [],
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    height: 300,
    autoFit: true,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
  };

  return (
    <ErpLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <h2 style={{ margin: 0 }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              {translate('inventory_reports')}
            </h2>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchReportData}
                loading={loading}
              >
                {translate('refresh')}
              </Button>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={() => handleExport('excel')}
              >
                Excel
              </Button>
              <Button 
                icon={<FilePdfOutlined />} 
                onClick={() => handleExport('pdf')}
              >
                PDF
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder={translate('select_report_type')}
                value={filters.reportType}
                onChange={(value) => setFilters({ ...filters, reportType: value })}
              >
                <Option value="summary">{translate('summary_report')}</Option>
                <Option value="detailed">{translate('detailed_report')}</Option>
                <Option value="movement">{translate('movement_report')}</Option>
                <Option value="valuation">{translate('valuation_report')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder={translate('select_category')}
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
              >
                <Option value="all">{translate('all_categories')}</Option>
                <Option value="raw_materials">{translate('raw_materials')}</Option>
                <Option value="finished_products">{translate('finished_products')}</Option>
                <Option value="supplies">{translate('supplies')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder={translate('select_location')}
                value={filters.location}
                onChange={(value) => setFilters({ ...filters, location: value })}
              >
                <Option value="all">{translate('all_locations')}</Option>
                <Option value="warehouse_a">{translate('warehouse_a')}</Option>
                <Option value="warehouse_b">{translate('warehouse_b')}</Option>
                <Option value="production_floor">{translate('production_floor')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                format={dateFormat}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
          </Row>
        </Card>

        {/* Summary Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={translate('total_products')}
                value={reportData.summary.totalProducts}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={translate('total_inventory_value')}
                value={reportData.summary.totalValue}
                formatter={(value) => moneyFormatter({ amount: value })}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={translate('low_stock_items')}
                value={reportData.summary.lowStockItems}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={translate('out_of_stock_items')}
                value={reportData.summary.outOfStockItems}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title={translate('inventory_movement_trends')} loading={loading}>
              {reportData.movementTrends && reportData.movementTrends.length > 0 ? (
                <Line {...barConfig} />
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  {translate('no_data_available') || 'No Data Available'}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={translate('inventory_by_category')} loading={loading}>
              {reportData.categoryAnalysis && reportData.categoryAnalysis.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  {translate('no_data_available') || 'No Data Available'}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title={translate('stock_levels_by_category')} loading={loading}>
              <Table
                dataSource={reportData.stockLevels}
                columns={stockLevelColumns}
                pagination={false}
                size="small"
                rowKey={(record, index) => record.id || record.category || index}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={translate('low_stock_alerts')} loading={loading}>
              <Table
                dataSource={reportData.lowStockAlerts}
                columns={alertsColumns}
                pagination={false}
                size="small"
                rowKey={(record, index) => record.id || record.sku || index}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Top Products Table */}
        <Card title={translate('top_products_by_value')} loading={loading}>
          <Table
            dataSource={reportData.topProducts}
            columns={topProductsColumns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            rowKey={(record, index) => record.id || record.sku || index}
          />
        </Card>
      </div>
    </ErpLayout>
  );
}