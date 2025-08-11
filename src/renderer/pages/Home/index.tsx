import { useEffect, useState } from 'react';
import './index.css';
import FullLogo from '../../assets/logoYellow.png';

export function Home() {
  const [updateStatus, setUpdateStatus] = useState('Checking for updates...');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateReady, setIsUpdateReady] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Check for updates
        const updateResponse = await window.electron.ipcRenderer.invoke(
          'checkHummingbirdUpdates',
        );

        if (updateResponse?.data?.buildLink) {
          // Update available
          setIsUpdateAvailable(true);
          setUpdateStatus(`Update available (v${updateResponse.data.version})`);

          // Start download
          setIsDownloading(true);
          const downloadStarted = await window.electron.ipcRenderer.invoke(
            'downloadHummingbird',
            updateResponse.data.buildLink,
          );

          if (!downloadStarted) {
            setUpdateStatus(
              'Failed to start download. Please try again later.',
            );
            setIsDownloading(false);
          }
        } else {
          // No update available
          setUpdateStatus('You have the latest version!');
        }
      } catch (error) {
        setUpdateStatus('Error checking for updates. Please try again later.');
        console.error('Update check error:', error);
      }
    };

    // Listen for download progress updates
    interface DownloadProgress {
      percent: number;
      [key: string]: any;
    }

    const progressListener = (...args: unknown[]) => {
      const progress = args[0] as DownloadProgress;
      setDownloadProgress(progress?.percent || 0);

      if (progress?.percent === 100) {
        setIsDownloading(false);
        setIsUpdateReady(true);
        setUpdateStatus('Update downloaded! Restarting soon...');
      }
    };

    window.electron.ipcRenderer.on('download-progress', progressListener);

    // Start checking for updates
    checkForUpdates();

    // Cleanup listener
    return () => {
      window.electron.ipcRenderer.removeListener(
        'download-progress',
        progressListener,
      );
    };
  }, []);

  return (
    <div className="home-container">
      <div className="update-card">
        <div className="full-logo">
          <img src={FullLogo} alt="Full Logo" />
        </div>
        <div className="update-card-content">
          <div className="update-info">
            <h2>{updateStatus}</h2>

            {isDownloading && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${downloadProgress}%` }}
                />
                <span className="progress-text">
                  {Math.round(downloadProgress)}%
                </span>
              </div>
            )}

            {isUpdateReady && (
              <p className="update-message">
                Application will restart automatically to install the update...
              </p>
            )}

            {!isUpdateAvailable && !isDownloading && (
              <p className="launch-message">Launching SoundSelf...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
