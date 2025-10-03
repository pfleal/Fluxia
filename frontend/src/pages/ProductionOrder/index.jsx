import dayjs from 'dayjs';
import { Tag, Progress } from 'antd';
import ProductionOrderDataTableModule from '@/modules/ProductionOrderModule/ProductionOrderDataTableModule';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

export default function ProductionOrder() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'productionOrder';

  const searchConfig = {
    entity: 'productionOrder',
    displayLabels: ['orderNumber', 'product'],
    searchFields: 'orderNumber,product,description',
    outputValue: '_id',
  };

  const deleteModalLabels = ['orderNumber', 'product'];

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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'default';
  };

  const dataTableColumns = [
    {
      title: translate('order_number'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: translate('product'),
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantityToProduce',
      key: 'quantity',
      render: (quantity, record) => `${record.quantityProduced || 0} / ${quantity}`,
    },
    {
      title: translate('progress'),
      key: 'progress',
      render: (_, record) => {
        const progress = record.quantityToProduce > 0 
          ? Math.round((record.quantityProduced || 0) / record.quantityToProduce * 100)
          : 0;
        return <Progress percent={progress} size="small" />;
      },
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{translate(status)}</Tag>
      ),
    },
    {
      title: translate('priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{translate(priority)}</Tag>
      ),
    },
    {
      title: translate('planned_start'),
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      render: (date) => date ? dayjs(date).format(dateFormat) : '-',
    },
    {
      title: translate('planned_end'),
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date) => date ? dayjs(date).format(dateFormat) : '-',
    },
    {
      title: translate('responsible_person'),
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      render: (person) => person || '-',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('production_order'),
    DATATABLE_TITLE: translate('production_order_list'),
    ADD_NEW_ENTITY: translate('add_new_production_order'),
    ENTITY_NAME: translate('production_order'),
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

  return <ProductionOrderDataTableModule config={config} />;
}