import { MESSAGES } from '../constants';
import { Processes } from '../interfaces';
import Loader from './Loader';
import NoInternet from '../../../assets/noWifi.png';
import Button from './Button';
import { openNetworkSettings } from '../../../services';

interface ProcessStatusProps {
  status: Processes;
  onRetry?: () => void;
}

export function ProcessStatus({ status, onRetry }: ProcessStatusProps) {
  if (status === Processes.CheckingInternet) {
    return (
      <>
        <Loader />
        <div className="process-status">{MESSAGES?.[status]}</div>
      </>
    );
  }
  if (status === Processes.NoInternet) {
    return (
      <>
        <img
          src={NoInternet}
          alt="No Internet Connection"
          className="no-internet-image"
        />
        <div>{MESSAGES?.[status]}</div>
        <div className="network-buttons">
          <Button variant="secondary" onClick={onRetry}>
            &#x21bb;&nbsp;Retry
          </Button>
          <Button onClick={openNetworkSettings}>
            🔧&nbsp;Open Network Settings
          </Button>
        </div>
      </>
    );
  }
  return null;
}

export default ProcessStatus;
