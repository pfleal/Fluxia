import { useState, useEffect } from 'react';
import { Button, Row, Col, Descriptions, Statistic, Tag, Divider, Card } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';

import { generate as uniqueId } from 'shortid';

import { selectReadItem } from '@/redux/crud/selectors';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function ReadItem({ config }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { result: currentResult } = useSelector(selectReadItem);

  const resetStockMovement = {
    product: null,
    date: null,
    movementType: '',
    direction: '',
    quantity: 0,
    reference: '',
    batch: '',
    sourceLocation: '',
    destinationLocation: '',
    unitCost: 0,
    totalValue: 0,
    responsiblePerson: '',
    description: '',
    notes: '',
  };

  const [currentStockMovement, setCurrentStockMovement] = useState(resetStockMovement);

  useEffect(() => {
    if (currentResult) {
      setCurrentStockMovement(currentResult);
    }
    return () => {
      setCurrentStockMovement(resetStockMovement);
    };
  }, [currentResult]);

  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const getDirectionColor = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'entrada':
      case 'in':
        return 'green';
      case 'saída':
      case 'out':
        return 'red';
      default:
        return 'default';
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'compra':
      case 'purchase':
        return 'blue';
      case 'venda':
      case 'sale':
        return 'orange';
      case 'ajuste':
      case 'adjustment':
        return 'purple';
      case 'transferência':
      case 'transfer':
        return 'cyan';
      case 'manual':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentStockMovement.reference || currentStockMovement._id || 'N/A'}`}
        ghost={false}
        tags={[
          <Tag key="movementType" color={getMovementTypeColor(currentStockMovement.movementType)}>
            {currentStockMovement.movementType || 'N/A'}
          </Tag>,
          <Tag key="direction" color={getDirectionColor(currentStockMovement.direction)}>
            {currentStockMovement.direction || 'N/A'}
          </Tag>,
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
              window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentStockMovement._id}.pdf`, '_blank');
            }}
            icon={<FilePdfOutlined />}
          >
            PDF
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                crud.currentAction({
                  actionType: 'update',
                  data: currentStockMovement,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentStockMovement._id}`);
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
              title={translate('quantity')} 
              value={currentStockMovement.quantity || 0}
              suffix={currentStockMovement.product?.unit || 'un'}
            />
          </Col>
          <Col>
            <Statistic 
              title={translate('unit_cost')} 
              value={`$ ${currentStockMovement.unitCost || 0}`}
            />
          </Col>
          <Col>
            <Statistic 
              title={translate('total_value')} 
              value={`$ ${currentStockMovement.totalValue || (currentStockMovement.quantity * currentStockMovement.unitCost) || 0}`}
            />
          </Col>
        </Row>
      </PageHeader>
      
      <Divider dashed />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={translate('product_information')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('product')}>
                {currentStockMovement.product?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('product_code')}>
                {currentStockMovement.product?.code || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('current_stock')}>
                {currentStockMovement.product?.stock || 0} {currentStockMovement.product?.unit || 'un'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title={translate('movement_details')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('date')}>
                {formatDate(currentStockMovement.date)}
              </Descriptions.Item>
              <Descriptions.Item label={translate('movement_type')}>
                {currentStockMovement.movementType || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('direction')}>
                {currentStockMovement.direction || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('responsible_person')}>
                {currentStockMovement.responsiblePerson || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={translate('location_information')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('source_location')}>
                {currentStockMovement.sourceLocation || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('destination_location')}>
                {currentStockMovement.destinationLocation || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title={translate('additional_information')} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={translate('reference')}>
                {currentStockMovement.reference || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={translate('batch')}>
                {currentStockMovement.batch || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {currentStockMovement.description && (
        <>
          <Divider />
          <Card title={translate('description')} size="small">
            <p>{currentStockMovement.description}</p>
          </Card>
        </>
      )}

      {currentStockMovement.notes && (
        <>
          <Divider />
          <Card title={translate('notes')} size="small">
            <p>{currentStockMovement.notes}</p>
          </Card>
        </>
      )}
    </>
  );
}