import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, DatePicker, Button, Statistic, Progress, Tag, Space, Tabs, Timeline, Calendar, Modal, Form, Input, InputNumber } from 'antd';
import { CalendarOutlined, ToolOutlined, TeamOutlined, AlertOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export default function ProductionPlanning() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [form] = Form.useForm();
  
  const [planningData, setPlanningData] = useState({
    productionSchedule: [],
    capacityData: [],
    resourceUtilization: [],
    workOrders: [],
    bottlenecks: [],
    kpis: {
      plannedProduction: 1250,
      actualProduction: 1180,
      efficiency: 94.4,
      onTimeDelivery: 87.5,
      resourceUtilization: 82.3,
      qualityRate: 96.8
    }
  });
  
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf('month'), moment().endOf('month')],
    department: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchPlanningData();
  }, [filters, activeTab]);

  const fetchPlanningData = async () => {
    setLoading(true);
    try {
      // Mock production planning data
      setPlanningData({
        productionSchedule: [
          {
            id: 1,
            workOrder: 'WO-2024-001',
            product: 'Steel Frame Assembly',
            quantity: 100,
            startDate: '2024-07-01',
            endDate: '2024-07-05',
            status: 'In Progress',
            priority: 'High',
            department: 'Assembly',
            progress: 65
          },
          {
            id: 2,
            workOrder: 'WO-2024-002',
            product: 'Aluminum Housing',
            quantity: 250,
            startDate: '2024-07-03',
            endDate: '2024-07-08',
            status: 'Scheduled',
            priority: 'Medium',
            department: 'Machining',
            progress: 0
          },
          {
            id: 3,
            workOrder: 'WO-2024-003',
            product: 'Copper Components',
            quantity: 500,
            startDate: '2024-07-06',
            endDate: '2024-07-12',
            status: 'Planned',
            priority: 'Low',
            department: 'Fabrication',
            progress: 0
          }
        ],
        capacityData: [
          { department: 'Assembly', capacity: 100, planned: 85, available: 15 },
          { department: 'Machining', capacity: 80, planned: 72, available: 8 },
          { department: 'Fabrication', capacity: 120, planned: 95, available: 25 },
          { department: 'Quality Control', capacity: 60, planned: 45, available: 15 },
          { department: 'Packaging', capacity: 90, planned: 68, available: 22 }
        ],
        resourceUtilization: [
          { week: 'Week 1', assembly: 85, machining: 90, fabrication: 78, quality: 75 },
          { week: 'Week 2', assembly: 92, machining: 88, fabrication: 82, quality: 80 },
          { week: 'Week 3', assembly: 78, machining: 85, fabrication: 90, quality: 85 },
          { week: 'Week 4', assembly: 88, machining: 92, fabrication: 85, quality: 78 }
        ],
        workOrders: [
          {
            id: 'WO-2024-001',
            product: 'Steel Frame Assembly',
            customer: 'ABC Manufacturing',
            dueDate: '2024-07-15',
            status: 'In Progress',
            priority: 'High',
            completionRate: 65
          },
          {
            id: 'WO-2024-002',
            product: 'Aluminum Housing',
            customer: 'XYZ Industries',
            dueDate: '2024-07-20',
            status: 'Scheduled',
            priority: 'Medium',
            completionRate: 0
          },
          {
            id: 'WO-2024-003',
            product: 'Copper Components',
            customer: 'DEF Corp',
            dueDate: '2024-07-25',
            status: 'Planned',
            priority: 'Low',
            completionRate: 0
          }
        ],
        bottlenecks: [
          {
            department: 'Machining',
            issue: 'Equipment maintenance scheduled',
            impact: 'High',
            estimatedDelay: '2 days',
            affectedOrders: ['WO-2024-002', 'WO-2024-005']
          },
          {
            department: 'Assembly',
            issue: 'Material shortage - Steel rods',
            impact: 'Medium',
            estimatedDelay: '1 day',
            affectedOrders: ['WO-2024-001']
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = (values) => {
    console.log('Creating work order:', values);
    setModalVisible(false);
    form.resetFields();
    // Refresh data
    fetchPlanningData();
  };

  const scheduleColumns = [
    {
      title: translate('work_order'),
      dataIndex: 'workOrder',
      key: 'workOrder',
    },
    {
      title: translate('product'),
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('start_date'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format(dateFormat)
    },
    {
      title: translate('end_date'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format(dateFormat)
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'In Progress' ? 'blue' : status === 'Scheduled' ? 'orange' : 'green';
        return <Tag color={color}>{translate(status.toLowerCase().replace(' ', '_'))}</Tag>;
      }
    },
    {
      title: translate('priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{translate(priority.toLowerCase())}</Tag>;
      }
    },
    {
      title: translate('progress'),
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    }
  ];

  const capacityColumns = [
    {
      title: translate('department'),
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: translate('total_capacity'),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (value) => `${value}%`
    },
    {
      title: translate('planned_capacity'),
      dataIndex: 'planned',
      key: 'planned',
      render: (value) => `${value}%`
    },
    {
      title: translate('available_capacity'),
      dataIndex: 'available',
      key: 'available',
      render: (value) => `${value}%`
    },
    {
      title: translate('utilization'),
      key: 'utilization',
      render: (_, record) => {
        const utilization = (record.planned / record.capacity) * 100;
        return <Progress percent={Math.round(utilization)} size="small" />;
      }
    }
  ];

  const bottleneckColumns = [
    {
      title: translate('department'),
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: translate('issue'),
      dataIndex: 'issue',
      key: 'issue',
    },
    {
      title: translate('impact'),
      dataIndex: 'impact',
      key: 'impact',
      render: (impact) => {
        const color = impact === 'High' ? 'red' : impact === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{translate(impact.toLowerCase())}</Tag>;
      }
    },
    {
      title: translate('estimated_delay'),
      dataIndex: 'estimatedDelay',
      key: 'estimatedDelay',
    },
    {
      title: translate('affected_orders'),
      dataIndex: 'affectedOrders',
      key: 'affectedOrders',
      render: (orders) => orders.join(', ')
    }
  ];

  const utilizationConfig = {
    data: planningData.resourceUtilization,
    xField: 'week',
    yField: 'assembly',
    seriesField: 'department',
    smooth: true,
  };

  const capacityConfig = {
    data: planningData.capacityData,
    xField: 'department',
    yField: 'planned',
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
  };

  const onCalendarSelect = (date) => {
    setSelectedDate(date);
    // Filter data for selected date
  };

  const getListData = (value) => {
    // Mock calendar events
    const events = [
      { type: 'warning', content: 'WO-2024-001 Due' },
      { type: 'success', content: 'Equipment Maintenance' },
    ];
    return events || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Tag color={item.type === 'warning' ? 'orange' : 'green'} style={{ fontSize: '10px' }}>
              {item.content}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ErpLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <h2 style={{ margin: 0 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {translate('production_planning')}
            </h2>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                {translate('create_work_order')}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* KPI Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('planned_production')}
                value={planningData?.kpis?.plannedProduction || 0}
                suffix={translate('units')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('actual_production')}
                value={planningData?.kpis?.actualProduction || 0}
                suffix={translate('units')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('efficiency')}
                value={planningData?.kpis?.efficiency || 0}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('on_time_delivery')}
                value={planningData?.kpis?.onTimeDelivery || 0}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('resource_utilization')}
                value={planningData?.kpis?.resourceUtilization || 0}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title={translate('quality_rate')}
                value={planningData?.kpis?.qualityRate || 0}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={translate('production_schedule')} key="schedule">
            <Card title={translate('production_schedule')} loading={loading}>
              <Table
                dataSource={planningData.productionSchedule}
                columns={scheduleColumns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={translate('capacity_planning')} key="capacity">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title={translate('capacity_utilization')} loading={loading}>
                  <Column {...capacityConfig} height={300} />
                </Card>
              </Col>
              <Col span={24}>
                <Card title={translate('capacity_details')} loading={loading}>
                  <Table
                    dataSource={planningData.capacityData}
                    columns={capacityColumns}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={translate('resource_management')} key="resources">
            <Card title={translate('resource_utilization_trends')} loading={loading}>
              <Line {...utilizationConfig} height={300} />
            </Card>
          </TabPane>

          <TabPane tab={translate('calendar_view')} key="calendar">
            <Card title={translate('production_calendar')} loading={loading}>
              <Calendar
                dateCellRender={dateCellRender}
                onSelect={onCalendarSelect}
              />
            </Card>
          </TabPane>

          <TabPane tab={translate('bottlenecks')} key="bottlenecks">
            <Card 
              title={translate('production_bottlenecks')} 
              loading={loading}
              extra={<AlertOutlined style={{ color: '#ff4d4f' }} />}
            >
              <Table
                dataSource={planningData.bottlenecks}
                columns={bottleneckColumns}
                pagination={false}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Create Work Order Modal */}
        <Modal
          title={translate('create_work_order')}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateWorkOrder}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="workOrder"
                  label={translate('work_order_number')}
                  rules={[{ required: true }]}
                >
                  <Input placeholder={translate('work_order_example')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="product"
                  label={translate('product')}
                  rules={[{ required: true }]}
                >
                  <Select placeholder={translate('select_product')}>
                    <Option value="steel_frame">Steel Frame Assembly</Option>
                    <Option value="aluminum_housing">Aluminum Housing</Option>
                    <Option value="copper_components">Copper Components</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={translate('quantity')}
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label={translate('priority')}
                  rules={[{ required: true }]}
                >
                  <Select placeholder={translate('select_priority')}>
                    <Option value="high">{translate('high')}</Option>
                    <Option value="medium">{translate('medium')}</Option>
                    <Option value="low">{translate('low')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label={translate('start_date')}
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} format={dateFormat} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label={translate('end_date')}
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} format={dateFormat} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="department"
              label={translate('department')}
              rules={[{ required: true }]}
            >
              <Select placeholder={translate('select_department')}>
                <Option value="assembly">Assembly</Option>
                <Option value="machining">Machining</Option>
                <Option value="fabrication">Fabrication</Option>
                <Option value="quality">Quality Control</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {translate('create')}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  {translate('cancel')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ErpLayout>
  );
}