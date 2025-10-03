import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card, Divider, Space, Tag } from 'antd';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import dayjs from 'dayjs';
import { request } from '@/request';

const { Option } = Select;
const { TextArea } = Input;

export default function ProductionOrderForm({ current = null, form: parentForm }) {
  const translate = useLanguage();
  const { currency } = useSelector(selectFinanceSettings);
  const [form] = Form.useForm(parentForm);
  const [products, setProducts] = useState([]);
  const [billOfMaterials, setBillOfMaterials] = useState([]);
  const [selectedBOM, setSelectedBOM] = useState(null);

  useEffect(() => {
    // Load products and BOMs from API
    const fetchData = async () => {
      try {
        const [productsRes, bomsRes] = await Promise.all([
          request.list({ entity: 'product' }),
          request.list({ entity: 'billOfMaterial' })
        ]);

        if (productsRes.success) {
          setProducts(productsRes.result || []);
        }

        if (bomsRes.success) {
          setBillOfMaterials(bomsRes.result || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays
        setProducts([]);
        setBillOfMaterials([]);
      }
    };

    fetchData();

    if (current) {
      form.setFieldsValue({
        ...current,
        plannedStartDate: current.plannedStartDate ? dayjs(current.plannedStartDate) : null,
        plannedEndDate: current.plannedEndDate ? dayjs(current.plannedEndDate) : null,
        actualStartDate: current.actualStartDate ? dayjs(current.actualStartDate) : null,
        actualEndDate: current.actualEndDate ? dayjs(current.actualEndDate) : null,
      });
      
      if (current.billOfMaterial) {
        const bom = billOfMaterials.find(b => b._id === current.billOfMaterial);
        setSelectedBOM(bom);
      }
    }
  }, [current, form]);

  const handleBOMChange = (bomId) => {
    const bom = billOfMaterials.find(b => b._id === bomId);
    setSelectedBOM(bom);
    
    if (bom) {
      // Set values immediately
      form.setFieldsValue({
        billOfMaterial: bomId,
        product: bom.product._id,
      });
      
      // Log for debugging
      console.log('BOM changed - setting values:', {
        billOfMaterial: bomId,
        product: bom.product._id,
      });
      console.log('Form values after setting:', form.getFieldsValue());
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      planned: 'blue',
      in_progress: 'orange',
      completed: 'green',
      cancelled: 'red',
      on_hold: 'yellow'
    };
    return colors[status] || 'default';
  };

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('order_number')}
            name="reference"
            rules={[{ required: true, message: translate('please_input_order_number') }]}
          >
            <Input placeholder={translate('production_order_example')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('status')}
            name="status"
            initialValue="draft"
          >
            <Select>
              <Option value="draft">
                <Tag color={getStatusColor('draft')}>{translate('draft')}</Tag>
              </Option>
              <Option value="planned">
                <Tag color={getStatusColor('planned')}>{translate('planned')}</Tag>
              </Option>
              <Option value="in_progress">
                <Tag color={getStatusColor('in_progress')}>{translate('in_progress')}</Tag>
              </Option>
              <Option value="completed">
                <Tag color={getStatusColor('completed')}>{translate('completed')}</Tag>
              </Option>
              <Option value="cancelled">
                <Tag color={getStatusColor('cancelled')}>{translate('cancelled')}</Tag>
              </Option>
              <Option value="on_hold">
                <Tag color={getStatusColor('on_hold')}>{translate('on_hold')}</Tag>
              </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('bill_of_material')}
            name="billOfMaterial"
            rules={[{ required: true, message: translate('please_select_bill_of_material') }]}
          >
            <Select
              placeholder={translate('select_bill_of_material')}
              onChange={handleBOMChange}
              showSearch
              optionFilterProp="children"
            >
              {billOfMaterials.map(bom => (
                <Option key={bom._id} value={bom._id}>
                  {bom.product?.name || 'Produto sem nome'} - v{bom.version}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
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
              disabled={!!selectedBOM}
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('quantity_to_produce')}
            name="plannedQuantity"
            rules={[{ required: true, message: translate('please_input_quantity') }]}
          >
            <InputNumber
              placeholder="100"
              min={0}
              step={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('quantity_produced')}
            name="producedQuantity"
            initialValue={0}
          >
            <InputNumber
              placeholder="0"
              min={0}
              step={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('priority')}
            name="priority"
            initialValue="medium"
          >
            <Select>
              <Option value="low">{translate('low')}</Option>
              <Option value="medium">{translate('medium')}</Option>
              <Option value="high">{translate('high')}</Option>
              <Option value="urgent">{translate('urgent')}</Option>
            </Select>
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

      <Divider>{translate('planning_dates')}</Divider>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('planned_start_date')}
            name="plannedStartDate"
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('planned_end_date')}
            name="plannedEndDate"
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('actual_start_date')}
            name="actualStartDate"
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('actual_end_date')}
            name="actualEndDate"
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>

      {selectedBOM && (
        <>
          <Divider>{translate('bill_of_material_details')}</Divider>
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <strong>{translate('product')}:</strong> {selectedBOM.product?.name || 'N/A'}
              </Col>
              <Col xs={24} md={8}>
                <strong>{translate('version')}:</strong> {selectedBOM.version}
              </Col>
              <Col xs={24} md={8}>
                <strong>{translate('quantity_per_unit')}:</strong> {selectedBOM.quantityProduced} {selectedBOM.unit}
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <strong>{translate('components')}:</strong>
              <div style={{ marginTop: 8 }}>
                {selectedBOM.components?.map((component, index) => (
                  <Tag key={index} style={{ margin: '2px' }}>
                    {component.product?.name || component.product}: {component.quantity} {component.unit}
                  </Tag>
                )) || <span>Nenhum componente</span>}
              </div>
            </div>
          </Card>
        </>
      )}

      <Form.Item
        label={translate('description')}
        name="description"
        style={{ marginTop: 24 }}
      >
        <TextArea rows={3} placeholder={translate('enter_description')} />
      </Form.Item>

      <Form.Item
        label={translate('notes')}
        name="notes"
      >
        <TextArea rows={3} placeholder={translate('enter_notes')} />
      </Form.Item>
    </>
  );
}