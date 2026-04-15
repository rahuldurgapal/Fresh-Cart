import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      zIndex: 9999,
      animation: 'slideInUp 0.3s ease forwards'
    }}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span style={{ fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
