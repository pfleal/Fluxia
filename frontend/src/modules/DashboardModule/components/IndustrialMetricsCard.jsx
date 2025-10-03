import { Card, Row, Col, Statistic, Progress, Spin } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  TrophyOutlined 
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function IndustrialMetricsCard({ 
  isLoading = false, 
  productionEfficiency = 0,
  stockTurnover = 0,
  qualityRate = 0,
  onTimeDelivery = 0
}) {
  const translate = useLanguage();

  const getEfficiencyColor = (value) => {
    if (value >= 90) return '#52c41a';
    if (value >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const metrics = [
    {
      title: translate('production_efficiency'),
      value: productionEfficiency,
      suffix: '%',
      icon: <BarChartOutlined />,
      color: getEfficiencyColor(productionEfficiency),
    },
    {
      title: translate('stock_turnover'),
      value: stockTurnover,
      suffix: 'x',
      icon: <LineChartOutlined />,
      color: '#1890ff',
    },
    {
      title: translate('quality_rate'),
      value: qualityRate,
      suffix: '%',
      icon: <TrophyOutlined />,
      color: getEfficiencyColor(qualityRate),
    },
    {
      title: translate('on_time_delivery'),
      value: onTimeDelivery,
      suffix: '%',
      icon: <PieChartOutlined />,
      color: getEfficiencyColor(onTimeDelivery),
    },
  ];

  return (
    <Card 
      title={translate('industrial_metrics')} 
      className="whiteBox shadow"
      style={{ height: 458 }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {metrics.map((metric, index) => (
            <Col span={12} key={index}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  borderColor: metric.color,
                  borderWidth: 2
                }}
              >
                <div style={{ fontSize: '24px', color: metric.color, marginBottom: 8 }}>
                  {metric.icon}
                </div>
                <Statistic
                  title={metric.title}
                  value={metric.value}
                  suffix={metric.suffix}
                  valueStyle={{ color: metric.color, fontSize: '18px' }}
                />
                <Progress
                  percent={metric.suffix === '%' ? metric.value : (metric.value / 10) * 100}
                  strokeColor={metric.color}
                  showInfo={false}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}