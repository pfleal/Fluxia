import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Switch, DatePicker } from 'antd';

import useLanguage from '@/locale/useLanguage';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

export default function ProductForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const financeSettings = useSelector(selectFinanceSettings);

  const productTypes = [
    { value: 'finished', label: translate('Finished Product') },
    { value: 'raw_material', label: translate('Raw Material') },
    { value: 'supply', label: translate('Supply') },
  ];

  const units = [
    { value: 'unit', label: translate('Unit') },
    { value: 'kg', label: translate('Kilogram') },
    { value: 'g', label: translate('Gram') },
    { value: 'l', label: translate('Liter') },
    { value: 'ml', label: translate('Milliliter') },
    { value: 'm', label: translate('Meter') },
    { value: 'cm', label: translate('Centimeter') },
    { value: 'm2', label: translate('Square Meter') },
    { value: 'm3', label: translate('Cubic Meter') },
  ];

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            label={translate('Name')}
            name="name"
            rules={[
              {
                required: true,
                message: translate('please_input_product_name'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            label={translate('SKU')}
            name="sku"
            rules={[
              {
                required: true,
                message: translate('please_input_sku'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            label={translate('Type')}
            name="type"
            rules={[
              {
                required: true,
                message: translate('please_select_product_type'),
              },
            ]}
          >
            <Select options={productTypes} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item
            label={translate('Description')}
            name="description"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Unit')}
            name="unit"
            rules={[
              {
                required: true,
                message: translate('please_select_unit'),
              },
            ]}
          >
            <Select options={units} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Weight (kg)')}
            name="weight"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Length (cm)')}
            name="length"
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Width (cm)')}
            name="width"
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Height (cm)')}
            name="height"
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Current Stock')}
            name="stockQuantity"
            rules={[
              {
                required: true,
                message: translate('please_input_current_stock'),
              },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Minimum Stock')}
            name="minimumStock"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Maximum Stock')}
            name="maximumStock"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            label={translate('Location')}
            name="location"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Batch Control')}
            name="batchControl"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            label={translate('Expiry Control')}
            name="expiryControl"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <MoneyInputFormItem
            label={translate('Cost Price')}
            name="costPrice"
            currency={financeSettings.default_currency_code}
            rules={[
              {
                required: true,
                message: translate('please_input_cost_price'),
              },
            ]}
          />
        </Col>
        <Col className="gutter-row" span={8}>
          <MoneyInputFormItem
            label={translate('Sale Price')}
            name="sellingPrice"
            currency={financeSettings.default_currency_code}
            rules={[
              {
                required: true,
                message: translate('please_input_sale_price'),
              },
            ]}
          />
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            label={translate('Tax Rate (%)')}
            name="taxRate"
          >
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            label={translate('Supplier')}
            name="supplier"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={12}>
          <Form.Item
            label={translate('Supplier Code')}
            name="supplierCode"
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item
            label={translate('Notes')}
            name="notes"
          >
            <TextArea rows={2} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}