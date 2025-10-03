import UpdateStockMovementModule from '@/modules/StockMovementModule/UpdateStockMovementModule';
import useLanguage from '@/locale/useLanguage';

export default function StockMovementUpdate() {
  const translate = useLanguage();
  const entity = 'stockmovement';

  const Labels = {
    PANEL_TITLE: translate('stock_movement'),
    DATATABLE_TITLE: translate('stock_movement_list'),
    ADD_NEW_ENTITY: translate('add_new_stock_movement'),
    ENTITY_NAME: translate('stock_movement'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  return <UpdateStockMovementModule config={configPage} />;
}