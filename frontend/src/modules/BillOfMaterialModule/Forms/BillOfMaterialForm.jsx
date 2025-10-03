import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Table, Space, Divider, Row, Col, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { selectFinanceSettings } from '@/redux/settings/selectors';

const { Option } = Select;
const { TextArea } = Input;

export default function BillOfMaterialForm({ current = null }) {
  const translate = useLanguage();
  const { currency } = useSelector(selectFinanceSettings);
  const [form] = Form.useForm();
  const [components, setComponents] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products for selection
    // This would typically fetch from API
    setProducts([
      { _id: '1', name: 'Product A', sku: 'PA001', costPrice: 10.50 },
      { _id: '2', name: 'Product B', sku: 'PB002', costPrice: 25.00 },
      { _id: '3', name: 'Product C', sku: 'PC003', costPrice: 15.75 },
    ]);

    if (current) {
      form.setFieldsValue(current);
      setComponents(current.components || []);
    }
  }, [current, form]);

  const addComponent = () => {
    const newComponent = {
      key: Date.now(),
      product: null,
      quantity: 1,
      unit: 'pcs',
      costPerUnit: 0,
      totalCost: 0,
      notes: '',
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (key) => {
    setComponents(components.filter(comp => comp.key !== key));
  };

  const updateComponent = (key, field, value) => {
    const updatedComponents = components.map(comp => {
      if (comp.key === key) {
        const updated = { ...comp, [field]: value };
        
        // Auto-calculate cost when product or quantity changes
        if (field === 'product') {
          const selectedProduct = products.find(p => p._id === value);
          if (selectedProduct) {
            updated.costPerUnit = selectedProduct.costPrice;
            updated.totalCost = updated.quantity * selectedProduct.costPrice;
          }
        } else if (field === 'quantity') {
          updated.totalCost = value * updated.costPerUnit;
        }
        
        return updated;
      }
      return comp;
    });
    setComponents(updatedComponents);
  };

  const componentColumns = [
    {
      title: translate('product'),
      dataIndex: 'product',
      key: 'product',
      width: '25%',
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => updateComponent(record.key, 'product', val)}
          placeholder={translate('select_product')}
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="children"
        >
          {products.map(product => (
            <Option key={product._id} value={product._id}>
              {product.name} ({product.sku})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => updateComponent(record.key, 'quantity', val)}
          min={0}
          step={0.01}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: translate('unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => updateComponent(record.key, 'unit', val)}
          style={{ width: '100%' }}
        >
          <Option value="pcs">pcs</Option>
          <Option value="kg">kg</Option>
          <Option value="m">m</Option>
          <Option value="l">l</Option>
          <Option value="m²">m²</Option>
        </Select>
      ),
    },
    {
      title: `${translate('cost_per_unit')} (${currency?.symbol})`,
      dataIndex: 'costPerUnit',
      key: 'costPerUnit',
      width: '15%',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    {
      title: `${translate('total_cost')} (${currency?.symbol})`,
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: '15%',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    {
      title: translate('notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: '15%',
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) => updateComponent(record.key, 'notes', e.target.value)}
          placeholder={translate('notes')}
        />
      ),
    },
    {
      title: translate('action'),
      key: 'action',
      width: '5%',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeComponent(record.key)}
        />
      ),
    },
  ];

  const totalCost = components.reduce((sum, comp) => sum + (comp.totalCost || 0), 0);

  return (
    <Form form={form} layout="vertical" name="billOfMaterialForm">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('product')}
            name="product"
            rules={[{ required: true, message: translate('please_select_product') }]}
          >
            <Select
              placeholder={translate('select_product')}
              showSearch
              optionFilterProp="children"
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('version')}
            name="version"
            rules={[{ required: true, message: translate('please_input_version') }]}
          >
            <Input placeholder="1.0" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('quantity_produced')}
            name="quantityProduced"
            rules={[{ required: true, message: translate('please_input_quantity') }]}
          >
            <InputNumber
              placeholder="1"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('unit')}
            name="unit"
            rules={[{ required: true, message: translate('please_select_unit') }]}
          >
            <Select placeholder={translate('select_unit')}>
              <Option value="pcs">pcs</Option>
              <Option value="kg">kg</Option>
              <Option value="m">m</Option>
              <Option value="l">l</Option>
              <Option value="m²">m²</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('status')}
            name="status"
            initialValue="active"
          >
            <Select>
              <Option value="active">{translate('active')}</Option>
              <Option value="inactive">{translate('inactive')}</Option>
              <Option value="draft">{translate('draft')}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('effective_date')}
            name="effectiveDate"
          >
            <Input type="date" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={translate('description')}
        name="description"
      >
        <TextArea rows={3} placeholder={translate('enter_description')} />
      </Form.Item>

      <Divider>{translate('components')}</Divider>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="dashed"
            onClick={addComponent}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            {translate('add_component')}
          </Button>
        </div>

        <Table
          dataSource={components}
          columns={componentColumns}
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <strong>
              {translate('total_cost')}: {currency?.symbol} {totalCost.toFixed(2)}
            </strong>
          </Space>
        </div>
      </Card>

      <Form.Item
        label={translate('notes')}
        name="notes"
        style={{ marginTop: 24 }}
      >
        <TextArea rows={3} placeholder={translate('enter_notes')} />
      </Form.Item>
    </Form>
  );
}