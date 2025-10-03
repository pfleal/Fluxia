import { ErpLayout } from '@/layout';
import { Form, Input, InputNumber, Button, Select, Row, Col, Card, Descriptions } from 'antd';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';
import PageLoader from '@/components/PageLoader';
import { request } from '@/request';

export default function UpdateStockModule({ config }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const translate = useLanguage();

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  useEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const movementTypes = [
    { value: 'purchase', label: translate('Purchase') },
    { value: 'production', label: translate('Production') },
    { value: 'sale', label: translate('Sale') },
    { value: 'adjustment', label: translate('Adjustment') },
    { value: 'transfer', label: translate('Transfer') },
    { value: 'return', label: translate('Return') },
    { value: 'waste', label: translate('Waste') },
  ];

  const directions = [
    { value: 'in', label: translate('Stock In') },
    { value: 'out', label: translate('Stock Out') },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { direction, batch, description, ...rest } = values;
      const payload = {
        action: 'updateStock',
        isIncrease: direction === 'in',
        lotNumber: batch,
        notes: description,
        ...rest,
      };
      const response = await request.patch({
        entity: 'product',
        id: id,
        jsonData: payload,
      });

      if (response.success) {
        navigate('/product');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  if (!isSuccess || !currentResult) {
    return (
      <ErpLayout>
        <div>Product not found</div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title={translate('Update Stock')}>
            <Descriptions column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label={translate('Product Name')}>
                {currentResult.name}
              </Descriptions.Item>
              <Descriptions.Item label={translate('SKU')}>
                {currentResult.sku}
              </Descriptions.Item>
              <Descriptions.Item label={translate('Current Stock')}>
                {currentResult.stockQuantity} {currentResult.unit}
              </Descriptions.Item>
              <Descriptions.Item label={translate('Location')}>
                {currentResult.location || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                direction: 'in',
                type: 'adjustment',
              }}
            >
              <Row gutter={[16, 0]}>
                <Col span={8}>
                  <Form.Item
                    label={translate('Movement Type')}
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: translate('please_select_movement_type'),
                      },
                    ]}
                  >
                    <Select options={movementTypes} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={translate('Direction')}
                    name="direction"
                    rules={[
                      {
                        required: true,
                        message: translate('please_select_direction'),
                      },
                    ]}
                  >
                    <Select options={directions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={translate('Quantity')}
                    name="quantity"
                    rules={[
                      {
                        required: true,
                        message: translate('please_input_quantity'),
                      },
                      {
                        type: 'number',
                        min: 0.01,
                        message: translate('Quantity must be greater than 0!'),
                      },
                    ]}
                  >
                    <InputNumber
                      min={0.01}
                      step={0.01}
                      style={{ width: '100%' }}
                      addonAfter={currentResult.unit}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item
                    label={translate('Reference')}
                    name="reference"
                  >
                    <Input placeholder={translate('Document reference')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={translate('Batch/Lot')}
                    name="batch"
                  >
                    <Input placeholder={translate('Batch or lot number')} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col span={24}>
                  <Form.Item
                    label={translate('Description')}
                    name="description"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={translate('Movement description')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={() => navigate('/product')}
                  >
                    {translate('Cancel')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    {translate('Update Stock')}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </ErpLayout>
  );
}