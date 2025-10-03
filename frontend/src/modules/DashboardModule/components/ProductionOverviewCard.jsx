import { Card, Row, Col, Statistic, Tag, List, Spin } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function ProductionOverviewCard({ 
  isLoading = false, 
  activeOrders = 0,
  completedOrders = 0,
  pendingOrders = 0,
  delayedOrders = 0,
  recentOrders = []
}) {
  const translate = useLanguage();

  const getStatusIcon = (status) => {
    const icons = {
      'in_progress': <PlayCircleOutlined style={{ color: '#1890ff' }} />,
      'paused': <PauseCircleOutlined style={{ color: '#faad14' }} />,
      'completed': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'pending': <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
      'delayed': <WarningOutlined style={{ color: '#ff4d4f' }} />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'in_progress': 'processing',
      'paused': 'warning',
      'completed': 'success',
      'pending': 'default',
      'delayed': 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Card 
      title={translate('production_overview')} 
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
            <Col span={6}>
              <Statistic
                title={translate('active')}
                value={activeOrders}
                valueStyle={{ color: '#1890ff' }}
                prefix={<PlayCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={translate('completed')}
                value={completedOrders}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={translate('pending')}
                value={pendingOrders}
                valueStyle={{ color: '#d9d9d9' }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={translate('delayed')}
                value={delayedOrders}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<WarningOutlined />}
              />
            </Col>
          </Row>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h4 style={{ marginBottom: 16 }}>{translate('recent_production_orders')}</h4>
            <List
              size="small"
              dataSource={recentOrders.slice(0, 5)}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getStatusIcon(order.status)}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{order.orderNumber}</span>
                        <Tag color={getStatusColor(order.status)}>
                          {translate(order.status)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>{order.product?.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {order.quantityProduced}/{order.quantityToProduce} {translate('units')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </>
      )}
    </Card>
  );
}