import './index.css';
import { useEffect, useState } from 'react';
import FullLogo from '../../assets/soundSelfFullLogo.png';
import { Processes } from './interfaces';
import { checkUpdates, hasInternetConnection, logger } from '../../services';
import { ProcessStatus } from './components/ProcessStatus';

export function Home() {
  const [currentProcess, setCurrentProcess] = useState<Processes>(
    Processes.CheckingInternet,
  );

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
  }, []);

  return (
    <div className="home-container">
      <div className="update-card">
        <div className="full-logo">
          <img src={FullLogo} alt="Full Logo" />
        </div>
        <ProcessStatus status={currentProcess} onRetry={checkWifiConnection} />
      </div>
    </div>
  );
}

export default Home;
