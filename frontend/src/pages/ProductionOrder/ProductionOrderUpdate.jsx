import UpdateProductionOrderModule from '@/modules/ProductionOrderModule/UpdateProductionOrderModule';
import useLanguage from '@/locale/useLanguage';

export default function ProductionOrderUpdate() {
  const translate = useLanguage();
  const entity = 'productionOrder';

  const Labels = {
    PANEL_TITLE: translate('production_order'),
    DATATABLE_TITLE: translate('production_order_list'),
    ADD_NEW_ENTITY: translate('add_new_production_order'),
    ENTITY_NAME: translate('production_order'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  return <UpdateProductionOrderModule config={configPage} />;
}