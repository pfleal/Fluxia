import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import ProductionOrderForm from '../Forms/ProductionOrderForm';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useParams } from 'react-router-dom';

export default function UpdateProductionOrderModule({ config }) {
  const { id } = useParams();
  const currentItem = useSelector(selectCurrentItem);

  return (
    <ErpLayout>
      <UpdateItem config={config} UpdateForm={ProductionOrderForm} />
    </ErpLayout>
  );
}