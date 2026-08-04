import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/');
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-xl px-margin-mobile sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h1 className="text-center font-display-lg-mobile text-display-lg-mobile font-bold text-primary">
          TicketBox
        </h1>
        <p className="mt-sm text-center font-body-sm text-body-sm text-on-surface-variant">
          Admin Portal Login
        </p>
        <p className="mt-xs text-center font-body-sm text-body-sm text-on-surface-variant/70">
          admin@ticketbox.local / Admin@12345
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mt-lg sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow py-xl px-lg sm:px-xl">
          <form className="space-y-md" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <div className="relative input-glow rounded-lg transition-shadow">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-[40px]"
                  placeholder="admin@ticketbox.local"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative input-glow rounded-lg transition-shadow">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-[40px]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full !rounded-lg">
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Login'
              )}
            </button>

            {loginMutation.isError && (
              <p className="text-error font-body-sm text-body-sm text-center font-medium">
                Invalid credentials
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
