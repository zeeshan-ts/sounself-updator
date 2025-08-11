import './index.css';
import { useEffect, useState } from 'react';
import FullLogo from '../../assets/soundSelfFullLogo.png';
import { Processes } from './interfaces';
import { hasInternetConnection } from '../../services';
import { ProcessStatus } from './components/ProcessStatus';

export function Home() {
  const [currentProcess, setCurrentProcess] = useState<Processes>(
    Processes.CheckingInternet,
  );

  const checkWifiConnection = async () => {
    setCurrentProcess(Processes.CheckingInternet);
    const isInternetConnected = await hasInternetConnection();
    if (isInternetConnected) {
      return true;
    }
    setCurrentProcess(Processes.NoInternet);
    return false;
  };

  const initiateProcess = async () => {
    checkWifiConnection();
  };

  useEffect(() => {
    initiateProcess();
  }, [currentProcess]);

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
