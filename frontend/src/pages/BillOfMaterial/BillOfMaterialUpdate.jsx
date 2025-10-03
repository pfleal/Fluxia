import UpdateBillOfMaterialModule from '@/modules/BillOfMaterialModule/UpdateBillOfMaterialModule';
import useLanguage from '@/locale/useLanguage';

export default function BillOfMaterialUpdate() {
  const translate = useLanguage();
  const entity = 'billofmaterial';

  const Labels = {
    PANEL_TITLE: translate('bill_of_material'),
    DATATABLE_TITLE: translate('bill_of_material_list'),
    ADD_NEW_ENTITY: translate('add_new_bill_of_material'),
    ENTITY_NAME: translate('bill_of_material'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  return <UpdateBillOfMaterialModule config={configPage} />;
}