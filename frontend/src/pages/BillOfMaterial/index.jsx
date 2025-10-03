import { Tag } from 'antd';
import BillOfMaterialDataTableModule from '@/modules/BillOfMaterialModule/BillOfMaterialDataTableModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';

export default function BillOfMaterial() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const entity = 'billofmaterial';

  const searchConfig = {
    displayLabels: ['product', 'version'],
    searchFields: 'product,version,description',
    outputValue: '_id',
  };

  const deleteModalLabels = ['product', 'version'];

  const dataTableColumns = [
    {
      title: translate('product'),
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: translate('version'),
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: translate('quantity_produced'),
      dataIndex: 'quantityProduced',
      key: 'quantityProduced',
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: translate('total_cost'),
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => moneyFormatter({ amount: cost }),
    },
    {
      title: translate('components_count'),
      dataIndex: 'components',
      key: 'componentsCount',
      render: (components) => components?.length || 0,
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange';
        return <Tag color={color}>{translate(status)}</Tag>;
      },
    },
    {
      title: translate('effective_date'),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('bill_of_material'),
    DATATABLE_TITLE: translate('bill_of_material_list'),
    ADD_NEW_ENTITY: translate('add_new_bill_of_material'),
    ENTITY_NAME: translate('bill_of_material'),
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

  return <BillOfMaterialDataTableModule config={config} />;
}