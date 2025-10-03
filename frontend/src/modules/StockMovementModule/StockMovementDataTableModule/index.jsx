import { ErpContextProvider } from '@/context/erp';
import ErpPanelModule from '@/modules/ErpPanelModule';

export default function StockMovementDataTableModule({ config }) {
  return (
    <ErpContextProvider>
      <ErpPanelModule config={config}></ErpPanelModule>
    </ErpContextProvider>
  );
}