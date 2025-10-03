import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import BillOfMaterialForm from '../Forms/BillOfMaterialForm';

export default function CreateBillOfMaterialModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={BillOfMaterialForm} />
    </ErpLayout>
  );
}