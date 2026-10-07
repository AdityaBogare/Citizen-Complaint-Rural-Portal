import { ArrowRight, Bell, FileText, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <FileText size={20} />,
    title: 'Smart Complaint Filing',
    text: 'Submit issues with images, GPS, and village-level tagging.'
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Transparent Escalation',
    text: 'Track each complaint through accountable administrative action.'
  },
  {
    icon: <MapPin size={20} />,
    title: 'Rural Area Coverage',
    text: 'Support villages, wards, and underserved local bodies effectively.'
  },
  {
    icon: <Bell size={20} />,
    title: 'Live Notifications',
    text: 'Keep citizens and officers updated on every change.'
  }
];

const stats = [
  { label: 'Complaints Tracked', value: '12.4K+' },
  { label: 'Departments Routed', value: '28' },
  { label: 'Average Resolution', value: '4.2 days' },
  { label: 'Villages Covered', value: '620+' }
];

const HomePage = () => {
  return (
    <div className="page-shell">
      <header className="topbar glass-panel">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <h3>CivicBridge</h3>
            <small>Local Administration Portal</small>
          </div>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/complaints">Complaints</Link>
          <Link to="/auth">Login</Link>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> AI-powered civic accountability</span>
          <h1>Transparent governance for every village, ward, and town.</h1>
          <p>
            A practical platform that helps citizens report civic issues, routes them to the right authority,
            and creates a transparent accountability ledger for local administration.
          </p>

          <div className="cta-row">
            <Link className="primary-btn" to="/auth">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link className="secondary-btn" to="/dashboard">
              View Demo Dashboard
            </Link>
          </div>

          <div className="stat-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card glass-panel">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual glass-panel">
          <div className="mini-card card-top">
            <Users size={18} />
            <div>
              <strong>205 Active</strong>
              <span>citizens this week</span>
            </div>
          </div>

          <div className="map-box">
            <div className="pulse pulse-a" />
            <div className="pulse pulse-b" />
            <div className="pulse pulse-c" />
            <div className="map-center">Village Ward 12</div>
          </div>

          <div className="mini-card card-bottom">
            <div className="progress-line">
              <span style={{ width: '78%' }} />
            </div>
            <strong>78% issue resolution rate</strong>
          </div>
        </div>
      </main>

      <section className="features-section">
        {features.map((feature) => (
          <div className="feature-card glass-panel" key={feature.title}>
            <div className="icon-wrap">{feature.icon}</div>
            <h4>{feature.title}</h4>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
