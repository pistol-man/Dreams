// src/components/Sidebar.tsx
'use client';

export default function Sidebar() {
  return (
    <div
      style={{
        width: '220px',
        height: '100vh',
        backgroundColor: '#1e293b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>🧭 Officer Panel</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {['Overview', 'Posts', 'Statistics', 'To Do Lists', 'Plugins', 'Settings'].map((item) => (
          <a
            key={item}
            href="#"
            style={{ color: 'white', textDecoration: 'none', fontSize: '1rem' }}
          >
            {item}
          </a>
        ))}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <button
          style={{
            background: '#334155',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
