import UpdateProductModule from '@/modules/ProductModule/UpdateProductModule';
import useLanguage from '@/locale/useLanguage';

export default function ProductUpdate() {
  const translate = useLanguage();
  const entity = 'product';

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  return <UpdateProductModule config={configPage} />;
}