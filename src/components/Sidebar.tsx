import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Дашборд', icon: '📊' },
  { to: '/users', label: 'Пользователи', icon: '👥' },
  { to: '/orders', label: 'Заказы', icon: '📦' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>BROX CRM</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.email}</div>
        <button className="sidebar-logout" onClick={logout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}