import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { ShoppingOutlined } from '@ant-design/icons';

export default function ProductDataTableModule({ config }) {
  const translate = useLanguage();
  return (
    <ErpLayout>
      <ErpPanel
        config={config}
        extra={[
          {
            label: translate('Update Stock'),
            key: 'updateStock',
            icon: <ShoppingOutlined />,
          },
        ]}
      ></ErpPanel>
    </ErpLayout>
  );
}