import { Card, Row, Col, Statistic, Progress, List, Tag, Spin } from 'antd';
import { 
  InboxOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function InventoryStatusCard({ 
  isLoading = false, 
  totalProducts = 0,
  lowStockProducts = 0,
  outOfStockProducts = 0,
  stockValue = 0,
  criticalItems = []
}) {
  const translate = useLanguage();

  const getStockLevel = (current, minimum) => {
    if (current === 0) return 'out_of_stock';
    if (current <= minimum) return 'low_stock';
    if (current <= minimum * 2) return 'medium_stock';
    return 'good_stock';
  };

  const getStockColor = (level) => {
    const colors = {
      'out_of_stock': '#ff4d4f',
      'low_stock': '#faad14',
      'medium_stock': '#1890ff',
      'good_stock': '#52c41a'
    };
    return colors[level] || '#d9d9d9';
  };

  const getStockIcon = (level) => {
    const icons = {
      'out_of_stock': <StopOutlined />,
      'low_stock': <WarningOutlined />,
      'medium_stock': <ExclamationCircleOutlined />,
      'good_stock': <CheckCircleOutlined />
    };
    return icons[level] || <InboxOutlined />;
  };

  const stockHealthPercentage = totalProducts > 0 
    ? Math.round(((totalProducts - lowStockProducts - outOfStockProducts) / totalProducts) * 100)
    : 0;

  return (
    <Card 
      title={translate('inventory_status')} 
      className="whiteBox shadow"
      style={{ height: 458 }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Statistic
                title={translate('total_products')}
                value={totalProducts}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={translate('stock_value')}
                value={stockValue}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={translate('low_stock')}
                  value={lowStockProducts}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={translate('out_of_stock')}
                  value={outOfStockProducts}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<StopOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{translate('stock_health')}</span>
              <span>{stockHealthPercentage}%</span>
            </div>
            <Progress
              percent={stockHealthPercentage}
              strokeColor={stockHealthPercentage > 80 ? '#52c41a' : stockHealthPercentage > 60 ? '#faad14' : '#ff4d4f'}
              showInfo={false}
            />
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h4 style={{ marginBottom: 16 }}>{translate('critical_items')}</h4>
            <List
              size="small"
              dataSource={criticalItems.slice(0, 4)}
              renderItem={(item) => {
                const level = getStockLevel(item.currentStock, item.minimumStock);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getStockIcon(level)}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{item.name}</span>
                          <Tag color={getStockColor(level)}>
                            {item.currentStock} {item.unit}
                          </Tag>
                        </div>
                      }
                      description={
                        <span style={{ fontSize: '12px', color: '#999' }}>
                          {translate('minimum')}: {item.minimumStock} {item.unit}
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </>
      )}
    </Card>
  );
}