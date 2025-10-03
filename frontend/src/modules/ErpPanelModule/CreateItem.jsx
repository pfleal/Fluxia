import { useState, useEffect } from 'react';

import { Button, Tag, Form, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';

import useLanguage from '@/locale/useLanguage';

import { settingsAction } from '@/redux/settings/actions';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';

import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';

import Loading from '@/components/Loading';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

function SaveForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

export default function CreateItem({ config, CreateForm }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);
  let { entity } = config;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const [offerSubTotal, setOfferSubTotal] = useState(0);
  const handelValuesChange = (changedValues, values) => {
    const items = values['items'];
    let subTotal = 0;
    let subOfferTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          if (item.offerPrice && item.quantity) {
            let offerTotal = calculate.multiply(item['quantity'], item['offerPrice']);
            subOfferTotal = calculate.add(subOfferTotal, offerTotal);
          }
          if (item.quantity && item.price) {
            let total = calculate.multiply(item['quantity'], item['price']);
            //sub total
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
      setOfferSubTotal(subOfferTotal);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      setSubTotal(0);
      setOfferSubTotal(0);
      // Convert camelCase to kebab-case for URL routing
      const kebabCaseEntity = entity.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      navigate(`/${kebabCaseEntity}/read/${result._id}`);
    }
    return () => {};
  }, [isSuccess]);

  const onSubmit = (fieldsValue) => {
    console.log('🚀 ~ onSubmit ~ fieldsValue:', fieldsValue);
    
    // Get all form values directly from the form instance as a fallback
    const allFormValues = form.getFieldsValue();
    console.log('🚀 ~ onSubmit ~ allFormValues from form instance:', allFormValues);
    
    // Use allFormValues if fieldsValue is empty
    const dataToSubmit = Object.keys(fieldsValue || {}).length > 0 ? fieldsValue : allFormValues;
    console.log('🚀 ~ onSubmit ~ dataToSubmit:', dataToSubmit);
    
    if (dataToSubmit) {
      // Convert direction field to isIncrease for stock movement
      if (entity === 'stockmovement' && dataToSubmit.direction) {
        dataToSubmit.isIncrease = dataToSubmit.direction === 'in';
        delete dataToSubmit.direction; // Remove the direction field as backend doesn't expect it
      }
      
      if (dataToSubmit.items) {
        let newList = [...dataToSubmit.items];
        newList.map((item) => {
          item.total = calculate.multiply(item.quantity, item.price);
        });
        dataToSubmit.items = newList;
      }
    }
    dispatch(erp.create({ entity, jsonData: dataToSubmit }));
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          // Convert camelCase to kebab-case for URL routing
          const kebabCaseEntity = entity.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          navigate(`/${kebabCaseEntity}`);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        // subTitle="This is create page"
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              // Convert camelCase to kebab-case for URL routing
              const kebabCaseEntity = entity.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
              navigate(`/${kebabCaseEntity}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <CreateForm subTotal={subTotal} offerTotal={offerSubTotal} form={form} />
        </Form>
      </Loading>
    </>
  );
}
