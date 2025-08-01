import './index.css';
import FullLogo from '../../assets/logoYellow.png';

export function Home() {
  return (
    <div className="home-container">
      <div className="update-card">
        <div className="full-logo">
          <img src={FullLogo} alt="Full Logo" />
        </div>
        <div className="update-card-content">Content</div>
      </div>
    </div>
  );
}

export default Home;
