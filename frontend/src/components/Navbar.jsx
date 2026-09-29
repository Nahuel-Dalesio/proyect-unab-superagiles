import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Package, BarChart3, BadgePercent, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand} onClick={() => navigate(user.rol === 'admin' ? '/admin' : '/pos')}>
        🏪 <span>KioscoApp</span>
      </div>

      <ul style={styles.menu}>
        {/* 🛒 ACCESO PERMITIDO A AMBOS ROLES */}
        <li>
          <Link to="/pos" style={styles.link}>
            <ShoppingCart size={18} /> <span>Cobro / POS</span>
          </Link>
        </li>

        {/* 🛡️ REGLA EXCLUSIVA PARA ADMIN (Oculto completamente para el Cajero) */}
        {user.rol === 'admin' && (
          <>
            <li>
              <Link to="/admin" style={styles.link}>
                <Package size={18} /> <span>Productos</span>
              </Link>
            </li>
            <li>
              <Link to="/admin" style={styles.link}>
                <BadgePercent size={18} /> <span>Precios</span>
              </Link>
            </li>
            <li>
              <Link to="/admin" style={styles.link}>
                <BarChart3 size={18} /> <span>Reportes</span>
              </Link>
            </li>
          </>
        )}
      </ul>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <User size={16} />
          <span style={styles.username}>{user.usuario}</span>
          <span style={styles.roleTag}>{user.rol}</span>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 20px', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexWrap: 'wrap', gap: '10px' },
  brand: { fontSize: '20px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  menu: { display: 'flex', listStyle: 'none', gap: '20px', margin: 0, padding: 0, flexWrap: 'wrap' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '20px' },
  username: { fontWeight: '600', color: '#f8fafc' },
  roleTag: { fontSize: '11px', backgroundColor: '#3b82f6', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' },
  logoutBtn: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};
