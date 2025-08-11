import { RingLoader } from 'react-spinners';
import { COLORS } from '../../../constants/colors';

export function Loader() {
  return <RingLoader color={COLORS.PRIMARY} size={110} />;
}

export default Loader;
