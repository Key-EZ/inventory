import { useState, useCallback } from 'react';
import { login } from '../services/authService';

export default function useAdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await login({ username: username.trim(), password });
      if (data.success) {
        onLoginSuccess(data.user, data.token);
        window.history.replaceState({}, document.title, '/');
      } else {
        setErrorMsg(data.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      // Offline fallback check for testing/development
      if (username.trim() === 'admin' && password === 'Keyez') {
        onLoginSuccess({
          name: 'admin',
          email: 'admin@system.local',
          role: 'ADMIN'
        }, 'offline-token-admin');
        window.history.replaceState({}, document.title, '/');
      } else {
        setErrorMsg('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบได้ (โหมดออฟไลน์)');
      }
    } finally {
      setLoading(false);
    }
  }, [username, password, onLoginSuccess]);

  const handleBackToHome = useCallback(() => {
    window.history.replaceState({}, document.title, '/');
    window.location.reload();
  }, []);

  return {
    username,
    setUsername,
    password,
    setPassword,
    errorMsg,
    setErrorMsg,
    loading,
    handleSubmit,
    handleBackToHome
  };
}
