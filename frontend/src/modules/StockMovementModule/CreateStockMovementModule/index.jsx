import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import StockMovementForm from '../Forms/StockMovementForm';

export default function CreateStockMovementModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={StockMovementForm} />
    </ErpLayout>
  );
}