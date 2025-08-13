import './index.css';
import { useEffect, useState } from 'react';
import FullLogo from '../../assets/soundSelfFullLogo.png';
import { Processes } from './interfaces';
import {
  checkUpdates,
  downloadUpdates,
  hasInternetConnection,
  logger,
} from '../../services';
import { ProcessStatus } from './components/ProcessStatus';

export function Home() {
  const [currentProcess, setCurrentProcess] = useState<Processes>(
    Processes.CheckingInternet,
  );
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [errMsg, setErrMsg] = useState<string>('');

  const checkWifiConnection = async () => {
    logger.info('Checking internet connection...');
    setCurrentProcess(Processes.CheckingInternet);
    const isInternetConnected = await hasInternetConnection();
    if (isInternetConnected) {
      logger.info('Internet connected.');
      return true;
    }
    logger.info('Internet connection failed.');
    setCurrentProcess(Processes.NoInternet);
    return false;
  };

  const checkForUpdates = async () => {
    setCurrentProcess(Processes.CheckingUpdates);
    const updates = await checkUpdates();
    if (updates.data) {
      logger.info(`Update available = ${JSON.stringify(updates.data)}`);
      setCurrentProcess(Processes.LastVersion);
      await downloadUpdates(updates.data.buildLink);
      setTimeout(() => {
        setCurrentProcess(Processes.Downloading);
      }, 1000);
    } else {
      logger.info('No updates available.');
    }
  };

  const initiateProcess = async () => {
    const isWifiConnected = await checkWifiConnection();
    if (isWifiConnected) {
      await checkForUpdates();
    }
  };

  useEffect(() => {
    initiateProcess();
    window.electron.ipcRenderer.on(
      'download-progress',
      (...args: unknown[]) => {
        const response = args[0] as {
          percent: number;
          isError: boolean;
          updateReady: boolean;
          isNetworkError?: boolean;
          error?: string;
        };
        setDownloadProgress(Math.trunc(response.percent));
        if (response?.percent === 100) {
          setIsNetworkError(false);
          setTimeout(() => {
            setCurrentProcess(Processes.Installing);
          }, 400);
        } else if (response?.isError && response?.isNetworkError) {
          setIsNetworkError(true);
        } else if (response?.isError) {
          setIsNetworkError(false);
          setCurrentProcess(Processes.Error);
          setErrMsg(response?.error || 'An error occurred');
        } else {
          setIsNetworkError(false);
        }
      },
    );
  }, []);

  return (
    <div className="home-container">
      <div className="update-card">
        <div className="full-logo">
          <img src={FullLogo} alt="Full Logo" />
        </div>
        <ProcessStatus
          status={currentProcess}
          onRetry={checkWifiConnection}
          downloadProgress={downloadProgress}
          isNetworkError={isNetworkError}
          errorMessage={errMsg}
          onRetryError={initiateProcess}
        />
      </div>
    </div>
  );
}

export default Home;
