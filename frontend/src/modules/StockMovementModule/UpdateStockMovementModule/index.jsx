import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import StockMovementForm from '../Forms/StockMovementForm';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useParams } from 'react-router-dom';

export default function UpdateStockMovementModule({ config }) {
  const { id } = useParams();
  const currentItem = useSelector(selectCurrentItem);

  return (
    <ErpLayout>
      <UpdateItem config={config} UpdateForm={StockMovementForm} />
    </ErpLayout>
  );
}