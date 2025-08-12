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

  const [downloadProgress, setDownloadProgress] = useState<number>(0);

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
        };
        setDownloadProgress(Math.trunc(response.percent));
        if (response?.percent === 100) {
          setTimeout(() => {
            setCurrentProcess(Processes.Installing);
          }, 400);
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
        />
      </div>
    </div>
  );
}

export default Home;
