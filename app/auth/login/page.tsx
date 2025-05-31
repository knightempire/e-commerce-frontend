// pages/auth/login.page.tsx (or app/auth/login/page.tsx for App Router)

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/components/googlelogin';
import Image from 'next/image';

const LoginPage = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading]           = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const milkyWhite     = "#f5f5f7";
  const primaryColor   = "#6366f1";
  const darkColor      = "#1e293b";
  const gradientButton = "linear-gradient(135deg, #ec4899 0%, #6366f1 100%)";

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('linkendin', JSON.stringify({ token: tokenFromUrl }));
      console.log('Google token saved to localStorage:', tokenFromUrl);
      verifyToken(tokenFromUrl);
    }

    const stored = localStorage.getItem('linkendin');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) verifyToken(token);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.log('Token verification failed');
        localStorage.removeItem('linkendin');
        return;
      }

      const data = await res.json();
      const { role, name } = data.user;

      localStorage.setItem(
        'linkendin',
        JSON.stringify({ token, role, name: btoa(name) })
      );

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/feed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }
  };

  const validateEmail = (email: string): boolean =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email.');
      setLoading(false);
      return;
    }
    if (!password) {
      setPasswordError('Password is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const base64Name = btoa(data.user.name);
        localStorage.setItem('linkendin', JSON.stringify({ token: data.token, name: base64Name }));
        router.push('/feed');
      } else {
        setPasswordError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setPasswordError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center" style={{ background: milkyWhite }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'white' }}>
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => router.push('/feed')}>
          <Image
            src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png"
            alt="Company Logo"
            width={120}
            height={48}
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: darkColor }}>
          Log in to your account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: darkColor }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailError('')}
              className="w-full px-3 py-2 border rounded-md"
              style={{ borderColor: `${darkColor}20` }}
              placeholder="Enter your Email"
            />
            {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: darkColor }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordError('')}
              className="w-full px-3 py-2 border rounded-md"
              style={{ borderColor: `${darkColor}20` }}
              placeholder="Enter Password"
            />
            {passwordError && <div className="text-red-500 text-sm mt-1">{passwordError}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium py-2 rounded-md text-white relative overflow-hidden group"
            style={{ background: gradientButton }}
          >
            <span
              className="absolute inset-0 w-0 bg-opacity-30 transition-all duration-300 group-hover:w-full"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            />
            <span className="relative z-10">{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div className="mt-4 text-right">
          <button onClick={() => router.push('/forgot-password')} className="text-sm" style={{ color: primaryColor }}>
            Forgot your password?
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <button onClick={() => router.push('/SignupPage')} className="text-sm font-medium" style={{ color: primaryColor }}>
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-6">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
