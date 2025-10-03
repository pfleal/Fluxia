import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useParams } from 'react-router-dom';

export default function ReadBillOfMaterialModule({ config }) {
  const { id } = useParams();
  const currentItem = useSelector(selectCurrentItem);

  return (
    <ErpLayout>
      <ReadItem config={config} />
    </ErpLayout>
  );
}