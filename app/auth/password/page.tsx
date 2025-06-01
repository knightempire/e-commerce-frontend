'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const PasswordSettings: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [userName, setUserName] = useState('');
  const [hash, setHash] = useState<string | null>(null);
  const [query, setQuery] = useState<Record<string, string | string[]>>({});

  const router = useRouter();

  const milkyWhite = "#f5f5f7";
  const primaryColor = "#6366f1";
  const gradientButton = "linear-gradient(135deg, #ec4899 0%, #6366f1 100%)";
  const darkColor = "#1e293b";

  const validatePasswords = () => {
    let valid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hashParams = new URLSearchParams(hash?.replace('#', '?') || '');
    const type = hashParams.get('type');
    const token = query.token as string;

    if (validatePasswords()) {
      setLoading(true);

      let endpoint = '';
      let body;

      if (type === 'register') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/password`;
        body = { password: newPassword };
      } else if (type === 'forgot') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/user/resetpassword`;
        body = { password: newPassword };
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'Success!',
            text: 'Your password has been set successfully',
            icon: 'success',
            confirmButtonColor: primaryColor,
            allowOutsideClick: false,
            confirmButtonText: 'Continue',
          }).then(() => router.push('/auth/login'));
        } else {
          throw new Error(data.message || 'Link has expired or is invalid');
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Link has been expired or is invalid',
          icon: 'error',
          confirmButtonColor: primaryColor,
          allowOutsideClick: false,
          confirmButtonText: 'Retry',
        }).then(() => router.push('/auth/login'));
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Please make sure your passwords match.',
        icon: 'error',
        confirmButtonColor: primaryColor,
        allowOutsideClick: false,
        confirmButtonText: 'Retry',
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { hash, search } = window.location;
      setHash(hash);
      const params = new URLSearchParams(search);
      setQuery(Object.fromEntries(params.entries()));
    }
  }, []);

  useEffect(() => {
    if (!hash || !query.token) return;

    const hashParams = new URLSearchParams(hash.replace('#', '?'));
    const type = hashParams.get('type');
    const token = query.token as string;

    if ((!type || (type !== 'register' && type !== 'forgot')) || !token) {
      Swal.fire({
        title: 'Error',
        text: 'Invalid URL or link. Please try again.',
        icon: 'error',
        confirmButtonColor: primaryColor,
        confirmButtonText: 'Retry',
      }).then(() => router.push('/auth/login'));
    } else {
      const verifyToken = async () => {
        try {
          const endpoint = type === 'register'
            ? `${process.env.NEXT_PUBLIC_API_URL}/user/verify-token-register`
            : `${process.env.NEXT_PUBLIC_API_URL}/user/verify-token-forgot`;

          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message);
          } else {
            setUserName(data.user.name);
          }
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
            icon: 'error',
            confirmButtonColor: primaryColor,
            confirmButtonText: 'Retry',
          }).then(() => router.push('/auth/login'));
        }
      };

      verifyToken();
    }
  }, [hash, query.token]);

  return (
    <div className="h-screen w-full flex items-center justify-center" style={{ background: milkyWhite }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: darkColor }}>
          Set Your Password
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Hi, {userName || 'user'}. Create a strong password for your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: darkColor }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${passwordError ? 'border-red-500' : ''}`}
              style={{ borderColor: `${darkColor}20` }}
              placeholder="Enter your new password"
            />
            {passwordError && (
              <p className="text-xs text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: darkColor }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${confirmPasswordError ? 'border-red-500' : ''}`}
              style={{ borderColor: `${darkColor}20` }}
              placeholder="Confirm your password"
            />
            {confirmPasswordError && (
              <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium py-2 rounded-md text-white relative overflow-hidden group"
            style={{ background: gradientButton }}
          >
            <span className="absolute inset-0 w-0 bg-opacity-30 transition-all duration-300 group-hover:w-full"
                  style={{ background: `rgba(255, 255, 255, 0.3)` }}></span>
            <span className="relative z-10">
              {loading ? 'Setting password...' : 'Set Password'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordSettings;
