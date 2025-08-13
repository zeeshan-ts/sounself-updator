import { MESSAGES } from '../constants';
import { Processes } from '../interfaces';
import { Loader } from './Loader';
import NoInternet from '../../../assets/noWifi.png';
import { Button } from './Button';
import { openNetworkSettings } from '../../../services';
import ErrorLogo from '../../../assets/errorLogo.png';

interface ProcessStatusProps {
  status: Processes;
  onRetry?: () => void;
  downloadProgress?: number;
  isNetworkError?: boolean;
  errorMessage?: string;
  onRetryError?: () => void;
}

export function ProcessStatus({
  status,
  onRetry,
  downloadProgress = 0,
  isNetworkError = false,
  errorMessage = '',
  onRetryError,
}: ProcessStatusProps) {
  if (status === Processes.Error) {
    return (
      <div className="error-container">
        <img src={ErrorLogo} alt="Error Logo" className="error-logo" />
        <div className="error-message">
          {MESSAGES?.[status].replace('{{ERROR}}', errorMessage)}
        </div>
        <div className="error-retry-btn">
          <Button variant="secondary" onClick={onRetryError}>
            &#x21bb;&nbsp;Retry
          </Button>
        </div>
      </div>
    );
  }
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
        {status === Processes.Installing && (
          <div className="instruction-download">
            The latest version of SoundSelf is being installed. SoundSelf will
            close and may temporarily disappear from your computer during this
            process. Please keep your computer on and do not close the
            application until installation is complete. The app will reopen
            automatically when finished.
          </div>
        )}
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
          <div className="instruction-download">
            Please keep your computer on and do not close SoundSelf until the
            process is complete. Once the download finishes, the installation
            will start automatically. SoundSelf will close and may temporarily
            disappear from your computer during installation, which will run in
            the background. The SoundSelf icon may be unavailable for a short
            time, but the app will reopen automatically once installation is
            complete.
          </div>
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
