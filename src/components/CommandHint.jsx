import { useState, useEffect } from 'react';
import React from 'react';

const hints = [
  '试试说：明天下午三点开会',
  '试试说：五月三十号上午十点看牙医',
  '试试说：后天中午十二点午餐'
];

function CommandHint() {
  const [visible, setVisible] = useState(true);
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint(prev => (prev + 1) % hints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '10px 18px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      fontSize: '0.9rem',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px'
    }}>
      <span>💡 {hints[currentHint]}</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: '#9ca3af',
          padding: 0
        }}
      >
        ×
      </button>
    </div>
  );
}

export default CommandHint;