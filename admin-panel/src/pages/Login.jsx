import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('ticketbox-auth', 'mock-token-123');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-deepPurple flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-electricViolet/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-hotPink/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <h2 className="mt-6 text-center text-5xl font-extrabold text-gradient tracking-wider pb-2">
          TicketBox
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">Admin Portal Login</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-panel py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-gray-500 focus:ring-electricViolet focus:border-electricViolet transition-colors"
                  placeholder="admin@ticketbox.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-gray-500 focus:ring-electricViolet focus:border-electricViolet transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] text-sm font-bold text-white bg-gradient-to-r from-electricViolet to-hotPink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electricViolet focus:ring-offset-deepPurple transition-all"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
