import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import ProductionOrderForm from '../Forms/ProductionOrderForm';

export default function CreateProductionOrderModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ProductionOrderForm} />
    </ErpLayout>
  );
}