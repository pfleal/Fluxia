import { Tag } from 'antd';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import StockMovementDataTableModule from '@/modules/StockMovementModule/StockMovementDataTableModule';
import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';

export default function StockMovement() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const entity = 'stockmovement';

  const searchConfig = {
    entity: 'stockmovement',
    displayLabels: ['product', 'reference'],
    searchFields: 'product,reference,description,batchLot',
    outputValue: '_id',
  };

  const deleteModalLabels = ['product', 'reference'];

  const getMovementTypeColor = (type) => {
    const colors = {
      manual: 'blue',
      purchase: 'green',
      sale: 'orange',
      production: 'purple',
      consumption: 'red',
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

  // Memoize dataTableColumns to prevent unnecessary re-renders
  const dataTableColumns = useMemo(() => [
    {
      title: translate('date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format(dateFormat),
      sorter: true,
    },
    {
      title: translate('product'),
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: translate('movement_type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getMovementTypeColor(type)}>{translate(type)}</Tag>
      ),
    },
    {
      title: translate('direction'),
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={getDirectionColor(direction)}>
          {direction === 'in' ? `${translate('in')} (+)` : `${translate('out')} (-)`}
        </Tag>
      ),
    },
    {
      title: translate('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        const sign = record.direction === 'in' ? '+' : '-';
        const color = record.direction === 'in' ? 'green' : 'red';
        return (
          <span style={{ color }}>
            {sign}{quantity} {record.product?.unit || 'unit'}
          </span>
        );
      },
    },
    {
      title: translate('reference'),
      dataIndex: 'reference',
      key: 'reference',
      render: (reference) => reference || '-',
    },
    {
      title: translate('batch_lot'),
      dataIndex: 'batchLot',
      key: 'batchLot',
      render: (batchLot) => batchLot || '-',
    },
    {
      title: translate('unit_cost'),
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost) => cost ? moneyFormatter({ amount: cost }) : '-',
    },
    {
      title: translate('total_value'),
      key: 'totalValue',
      render: (_, record) => {
        if (record.unitCost && record.quantity) {
          const total = record.unitCost * record.quantity;
          return moneyFormatter({ amount: total });
        }
        return '-';
      },
    },
    {
      title: translate('responsible_person'),
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      render: (person) => person || '-',
    },
  ], [translate, dateFormat, moneyFormatter]); // Dependencies for memoization

  const Labels = {
    PANEL_TITLE: translate('stock_movement'),
    DATATABLE_TITLE: translate('stock_movement_list'),
    ADD_NEW_ENTITY: translate('add_new_stock_movement'),
    ENTITY_NAME: translate('stock_movement'),
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

  return <StockMovementDataTableModule config={config} />;
}