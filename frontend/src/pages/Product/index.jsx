import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { tagColor } from '@/utils/statusTagColor';

import { useMoney } from '@/settings';
import ProductDataTableModule from '@/modules/ProductModule/ProductDataTableModule';

export default function Product() {
  const translate = useLanguage();
  const entity = 'product';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'product',
    displayLabels: ['name', 'sku'],
    searchFields: 'name,sku',
  };

  const deleteModalLabels = ['name', 'sku'];

  const dataTableColumns = [
    {
      title: translate('Name'),
      dataIndex: 'name',
    },
    {
      title: translate('SKU'),
      dataIndex: 'sku',
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      render: (type) => {
        const typeLabels = {
          finished: translate('Finished Product'),
          raw_material: translate('Raw Material'),
          supply: translate('Supply'),
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: translate('Current Stock'),
      dataIndex: 'stockQuantity',
      render: (stock, record) => `${stock} ${record.unit}`,
      onCell: () => ({
        style: {
          textAlign: 'right',
        },
      }),
    },
    {
      title: translate('Cost Price'),
      dataIndex: 'costPrice',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (costPrice, record) => {
        return moneyFormatter({ 
          amount: costPrice, 
          currency_code: record.currency || 'USD' 
        });
      },
    },
    {
      title: translate('Sale Price'),
      dataIndex: 'sellingPrice',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (salePrice, record) => {
        return moneyFormatter({ 
          amount: salePrice, 
          currency_code: record.currency || 'USD' 
        });
      },
    },
    {
      title: translate('Location'),
      dataIndex: 'location',
      render: (location) => location || '-',
    },
    {
      title: translate('Status'),
      dataIndex: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? translate('Active') : translate('Inactive')}
        </Tag>
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <ProductDataTableModule config={config} />;
}