import { MESSAGES } from '../constants';
import { Processes } from '../interfaces';
import { Loader } from './Loader';
import NoInternet from '../../../assets/noWifi.png';
import { Button } from './Button';
import { openNetworkSettings } from '../../../services';

interface ProcessStatusProps {
  status: Processes;
  onRetry?: () => void;
  downloadProgress?: number;
  isNetworkError?: boolean;
}

export function ProcessStatus({
  status,
  onRetry,
  downloadProgress = 0,
  isNetworkError = false,
}: ProcessStatusProps) {
  if (
    status === Processes.CheckingInternet ||
    status === Processes.CheckingUpdates ||
    status === Processes.LastVersion ||
    status === Processes.Installing
  ) {
    return (
      <>
        <Loader />
        <div className="process-status">{MESSAGES?.[status]}</div>
      </>
    );
  }
  if (status === Processes.Downloading) {
    return (
      <>
        <Loader />
        <div className="process-status">
          {isNetworkError
            ? 'Network connection lost. Monitoring for reconnection...'
            : MESSAGES?.[status]?.replace(
                '{{PROGRESS}}',
                `${downloadProgress}`,
              )}
          <br />
          Please keep your computer on and do not close the application until
          the process is complete.
        </div>
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
