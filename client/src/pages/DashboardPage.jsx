import { useEffect, useState } from 'react';
import { Briefcase, Building2, FileSpreadsheet, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
    escalated: 0
  });
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('portalUser') || 'null');
    setUser(storedUser);

    const loadDashboard = async () => {
      const token = localStorage.getItem('portalToken');
      try {
        const response = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setSummary(data.summary || summary);
          setComplaints(data.complaints || []);
        }
      } catch (error) {
        console.error('Dashboard load failed', error);
      }
    };

    loadDashboard();
  }, []);

  const roleIcon = {
    citizen: <FileSpreadsheet size={18} />,
    officer: <Briefcase size={18} />,
    admin: <Building2 size={18} />
  };

  return (
    <div className="page-shell dashboard-page">
      <header className="topbar glass-panel dashboard-topbar">
        <div>
          <h3>{user?.name || 'Citizen Dashboard'}</h3>
          <small>{user?.role || 'citizen'}</small>
        </div>
        <button className="secondary-btn" onClick={() => window.location.href = '/complaints'}>
          New complaint
        </button>
      </header>

      <div className="summary-grid">
        <div className="glass-panel metric-card">
          <ShieldCheck size={18} />
          <span>Total</span>
          <strong>{summary.totalComplaints}</strong>
        </div>
        <div className="glass-panel metric-card">
          <FileSpreadsheet size={18} />
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </div>
        <div className="glass-panel metric-card">
          <Briefcase size={18} />
          <span>Resolved</span>
          <strong>{summary.resolved}</strong>
        </div>
        <div className="glass-panel metric-card">
          <Building2 size={18} />
          <span>Escalated</span>
          <strong>{summary.escalated}</strong>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="glass-panel insights-panel">
          <h3>Complaint Activity</h3>
          <ul className="list-card">
            {complaints.length > 0 ? complaints.map((complaint) => (
              <li key={complaint.id}>
                <span>{complaint.title}</span>
                <strong>{complaint.status}</strong>
              </li>
            )) : <li>No complaints yet</li>}
          </ul>
        </div>

        <div className="glass-panel profile-panel">
          <h3>Role Profile</h3>
          <div className="profile-tag">{roleIcon[user?.role || 'citizen']}</div>
          <p><strong>Name:</strong> {user?.name || 'Guest'}</p>
          <p><strong>Email:</strong> {user?.email || 'guest@example.com'}</p>
          <p><strong>Role:</strong> {user?.role || 'citizen'}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
