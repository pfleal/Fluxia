import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import ProductForm from '@/modules/ProductModule/Forms/ProductForm';

export default function CreateProductModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ProductForm} />
    </ErpLayout>
  );
}