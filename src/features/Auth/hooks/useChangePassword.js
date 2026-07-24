import { useState, useCallback } from 'react';
import { apiRequest } from '../../../services/api';

export default function useChangePassword({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest('/change-password', 'POST', {
        currentPassword,
        newPassword
      });

      if (data.success) {
        setSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จแล้ว!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || 'เปลี่ยนรหัสผ่านล้มเหลว');
      }
    } catch (err) {
      console.error('Change password failed:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการติดต่อสื่อสารกับเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, onClose]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    errorMsg,
    successMsg,
    loading,
    handleSubmit
  };
}
