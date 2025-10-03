import { Card, Row, Col, Statistic, Progress, List, Tag, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  TrophyOutlined,
  BugOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function QualityMetricsCard({ 
  isLoading = false, 
  qualityRate = 0,
  defectRate = 0,
  reworkRate = 0,
  customerComplaints = 0,
  qualityTrends = []
}) {
  const translate = useLanguage();

  const getQualityColor = (rate) => {
    if (rate >= 95) return '#52c41a';
    if (rate >= 90) return '#faad14';
    return '#ff4d4f';
  };

  const getDefectColor = (rate) => {
    if (rate <= 2) return '#52c41a';
    if (rate <= 5) return '#faad14';
    return '#ff4d4f';
  };

  const qualityMetrics = [
    {
      title: translate('quality_rate'),
      value: qualityRate,
      suffix: '%',
      color: getQualityColor(qualityRate),
      icon: <TrophyOutlined />,
      target: 95
    },
    {
      title: translate('defect_rate'),
      value: defectRate,
      suffix: '%',
      color: getDefectColor(defectRate),
      icon: <BugOutlined />,
      target: 2,
      reverse: true
    },
    {
      title: translate('rework_rate'),
      value: reworkRate,
      suffix: '%',
      color: getDefectColor(reworkRate),
      icon: <ExclamationCircleOutlined />,
      target: 3,
      reverse: true
    }
  ];

  return (
    <Card 
      title={translate('quality_metrics')} 
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
            {qualityMetrics.map((metric, index) => (
              <Col span={8} key={index}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    borderColor: metric.color,
                    borderWidth: 1
                  }}
                >
                  <div style={{ fontSize: '20px', color: metric.color, marginBottom: 8 }}>
                    {metric.icon}
                  </div>
                  <Statistic
                    title={metric.title}
                    value={metric.value}
                    suffix={metric.suffix}
                    valueStyle={{ color: metric.color, fontSize: '16px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                    {translate('target')}: {metric.target}%
                  </div>
                  <Progress
                    percent={metric.reverse ? 100 - metric.value : metric.value}
                    strokeColor={metric.color}
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card size="small">
                <Statistic
                  title={translate('customer_complaints')}
                  value={customerComplaints}
                  valueStyle={{ 
                    color: customerComplaints === 0 ? '#52c41a' : customerComplaints <= 5 ? '#faad14' : '#ff4d4f' 
                  }}
                  prefix={
                    customerComplaints === 0 ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                  }
                  suffix={translate('this_month')}
                />
              </Card>
            </Col>
          </Row>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h4 style={{ marginBottom: 16 }}>{translate('quality_trends')}</h4>
            <List
              size="small"
              dataSource={qualityTrends.slice(0, 4)}
              renderItem={(trend) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{trend.period}</span>
                        <div>
                          <Tag color={getQualityColor(trend.qualityRate)}>
                            {trend.qualityRate}%
                          </Tag>
                          <Tag color={getDefectColor(trend.defectRate)}>
                            {translate('defects')}: {trend.defectRate}%
                          </Tag>
                        </div>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {translate('units_produced')}: {trend.unitsProduced}
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