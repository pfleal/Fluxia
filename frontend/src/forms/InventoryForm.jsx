import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function InventoryForm() {
  const translate = useLanguage();
  // Renamed to InventoryForm for clarity
  return (
    <>
      <Form.Item
        label="Product"
        name="product"
        rules={[
          {
            required: true,
            message: translate('please_input_product_name_inventory'),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Quantity"
        name="quantity"
        rules={[
          {
            required: true,
            message: translate('please_input_quantity_inventory'),
            type: 'number',
            min: 0, // Ensure non-negative numbers
          },
        ]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        label="Unit Price"
        name="unitPrice"
        rules={[
          {
            required: true,
            message: translate('please_input_unit_price'),
            type: 'number',
            min: 0, // Ensure non-negative numbers
          },
        ]}
      >
        <InputNumber
          formatter={(value) => `$ ${value}`} // Optional: format value as currency
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')} // Optional: parse input as number
        />
      </Form.Item>
    </>
  );
}
