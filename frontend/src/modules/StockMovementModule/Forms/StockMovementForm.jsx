import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card, Alert, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export default function StockMovementForm({ current = null, form }) {
  const translate = useLanguage();
  // Remove the local form instance and use the one passed as prop
  // const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('manual');

  // Load products for selection from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await request.list({ entity: 'product' });
        if (response.success) {
          setProducts(response.result);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []); // Only run once on mount

  // Handle form initialization when current data changes
  useEffect(() => {
    if (current) {
      form.setFieldsValue({
        ...current,
        date: current.date ? dayjs(current.date) : dayjs(),
      });
      
      if (current.product && products.length > 0) {
        const product = products.find(p => p._id === current.product);
        setSelectedProduct(product);
      }
      
      if (current.type) {
        setMovementType(current.type);
      }
    } else {
      form.setFieldsValue({
        date: dayjs(),
        type: 'manual',
        direction: 'in',
      });
    }
  }, [current, form, products]);

  const handleProductChange = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
  };

  const handleMovementTypeChange = (type) => {
    setMovementType(type);
    
    // Auto-set direction based on movement type
    if (type === 'purchase' || type === 'production' || type === 'return') {
      form.setFieldsValue({ direction: 'in' });
    } else if (type === 'sale' || type === 'waste') {
      form.setFieldsValue({ direction: 'out' });
    }
  };

  const getMovementTypeColor = (type) => {
    const colors = {
      purchase: 'green',
      sale: 'orange',
      production: 'purple',
      adjustment: 'yellow',
      transfer: 'cyan',
      return: 'lime',
      waste: 'magenta'
    };
    return colors[type] || 'default';
  };

  const getDirectionColor = (direction) => {
    return direction === 'in' ? 'green' : 'red';
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('product')}
            name="product"
            rules={[{ required: true, message: translate('please_select_product') }]}
          >
            <Select
              placeholder={translate('select_product')}
              onChange={handleProductChange}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name} ({product.sku}) - Stock: {product.stockQuantity || 0} {product.unit}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('date')}
            name="date"
            rules={[{ required: true, message: translate('please_select_date') }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>

      {selectedProduct && (
        <Alert
          message={translate('current_stock_info')}
          description={
            <Space direction="vertical" size="small">
              <div><strong>{translate('current_stock')}:</strong> {selectedProduct.stockQuantity || 0} {selectedProduct.unit}</div>
              <div><strong>{translate('location')}:</strong> {selectedProduct.location || 'N/A'}</div>
            </Space>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Form.Item
            label={translate('movement_type')}
            name="type"
            rules={[{ required: true, message: translate('please_select_movement_type') }]}
          >
            <Select
              placeholder={translate('select_movement_type')}
              onChange={handleMovementTypeChange}
            >
              <Option value="purchase">{translate('purchase')}</Option>
              <Option value="production">{translate('production')}</Option>
              <Option value="sale">{translate('sale')}</Option>
              <Option value="adjustment">{translate('adjustment')}</Option>
              <Option value="transfer">{translate('transfer')}</Option>
              <Option value="return">{translate('return')}</Option>
              <Option value="waste">{translate('waste')}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label={translate('direction')}
            name="direction"
            rules={[{ required: true, message: translate('please_select_direction') }]}
          >
            <Select
              placeholder={translate('select_direction')}
              disabled={movementType !== 'adjustment' && movementType !== 'transfer'}
            >
              <Option value="in">{translate('in')} (+)</Option>
              <Option value="out">{translate('out')} (-)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label={translate('quantity')}
            name="quantity"
            rules={[
              { required: true, message: translate('please_input_quantity') },
              { type: 'number', min: 0.01, message: translate('quantity_must_be_positive') }
            ]}
          >
            <InputNumber
              placeholder="0"
              min={0.01}
              step={0.01}
              style={{ width: '100%' }}
              addonAfter={selectedProduct?.unit || 'unit'}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('reference')}
            name="reference"
          >
            <Input placeholder={translate('enter_reference')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('batch_lot')}
            name="batchLot"
          >
            <Input placeholder={translate('enter_batch_lot')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('location_from')}
            name="locationFrom"
          >
            <Input placeholder={translate('enter_location_from')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('location_to')}
            name="locationTo"
          >
            <Input placeholder={translate('enter_location_to')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('unit_cost')}
            name="unitCost"
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('responsible_person')}
            name="responsiblePerson"
          >
            <Input placeholder={translate('enter_responsible_person')} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={translate('description')}
        name="description"
      >
        <TextArea rows={3} placeholder={translate('enter_description')} />
      </Form.Item>

      <Form.Item
        label={translate('notes')}
        name="notes"
      >
        <TextArea rows={2} placeholder={translate('enter_notes')} />
      </Form.Item>
    </div>
  );
}