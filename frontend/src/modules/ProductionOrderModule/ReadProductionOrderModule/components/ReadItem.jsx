import { useState, useEffect } from 'react';
import { Button, Row, Col, Descriptions, Statistic, Tag, Divider, Card, Space } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';

import { generate as uniqueId } from 'shortid';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function ReadItem({ config, selectedItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentOrder, setCurrentOrder] = useState(selectedItem || {});

  useEffect(() => {
    if (selectedItem) {
      setCurrentOrder(selectedItem);
    }
  }, [selectedItem]);

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

  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentOrder.reference || currentOrder.number || 'N/A'}`}
        ghost={false}
        tags={[
          <Tag key="status" color={getStatusColor(currentOrder.status)}>
            {currentOrder.status && translate(currentOrder.status)}
          </Tag>,
          <Tag key="priority" color={getPriorityColor(currentOrder.priority)}>
            {currentOrder.priority && translate(currentOrder.priority)}
          </Tag>
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              window.open(
                `${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentOrder._id}.pdf`,
                '_blank'
              );
            }}
            icon={<FilePdfOutlined />}
          >
            {translate('download_pdf')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                crud.currentAction({
                  actionType: 'update',
                  data: currentOrder,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentOrder._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <Row gutter={[32, 16]}>
          <Col>
            <Statistic 
              title={translate('status')} 
              value={currentOrder.status ? translate(currentOrder.status) : 'N/A'} 
            />
          </Col>
          <Col>
            <Statistic 
              title={translate('priority')} 
              value={currentOrder.priority ? translate(currentOrder.priority) : 'N/A'} 
            />
          </Col>
          <Col>
            <Statistic 
              title={translate('quantity_to_produce')} 
              value={currentOrder.plannedQuantity || 0} 
            />
          </Col>
          <Col>
            <Statistic 
              title={translate('quantity_produced')} 
              value={currentOrder.producedQuantity || 0} 
            />
          </Col>
        </Row>
      </PageHeader>
      
      <Divider dashed />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={translate('production_details')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('product')}>
                {currentOrder.product?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('bill_of_material')}>
                {currentOrder.billOfMaterial?.product?.name || 'N/A'} - v{currentOrder.billOfMaterial?.version || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('responsible_person')}>
                {currentOrder.responsiblePerson || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title={translate('planning_dates')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('planned_start_date')}>
                {formatDate(currentOrder.plannedStartDate)}
              </Descriptions.Item>
              <Descriptions.Item label={translate('planned_end_date')}>
                {formatDate(currentOrder.plannedEndDate)}
              </Descriptions.Item>
              <Descriptions.Item label={translate('actual_start_date')}>
                {formatDate(currentOrder.actualStartDate)}
              </Descriptions.Item>
              <Descriptions.Item label={translate('actual_end_date')}>
                {formatDate(currentOrder.actualEndDate)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {currentOrder.billOfMaterial && (
        <>
          <Divider />
          <Card title={translate('bill_of_material_details')} size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <strong>{translate('product')}:</strong> {currentOrder.billOfMaterial.product?.name || 'N/A'}
              </Col>
              <Col xs={24} md={8}>
                <strong>{translate('version')}:</strong> {currentOrder.billOfMaterial.version}
              </Col>
              <Col xs={24} md={8}>
                <strong>{translate('quantity_per_unit')}:</strong> {currentOrder.billOfMaterial.quantityProduced} {currentOrder.billOfMaterial.unit}
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <strong>{translate('components')}:</strong>
              <div style={{ marginTop: 8 }}>
                {currentOrder.billOfMaterial.components?.map((component, index) => (
                  <Tag key={index} style={{ margin: '2px' }}>
                    {component.product?.name || component.product}: {component.quantity} {component.unit}
                  </Tag>
                )) || <span>Nenhum componente</span>}
              </div>
            </div>
          </Card>
        </>
      )}

      {currentOrder.description && (
        <>
          <Divider />
          <Card title={translate('description')} size="small">
            <p>{currentOrder.description}</p>
          </Card>
        </>
      )}

      {currentOrder.notes && (
        <>
          <Divider />
          <Card title={translate('notes')} size="small">
            <p>{currentOrder.notes}</p>
          </Card>
        </>
      )}
    </>
  );
}