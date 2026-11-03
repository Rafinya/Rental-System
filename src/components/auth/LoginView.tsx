/**
 * Weena Loft Accommodations - Dark Editorial Authentication Screen
 * Complete visibility and matching dark olive-charcoal aesthetic.
 */

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('ralphokono@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let name = 'Ralph Okono';
      if (selectedRole === 'manager') name = 'Property Manager';
      if (selectedRole === 'maintenance') name = 'Maintenance Lead';

      onLogin({
        id: `usr-${selectedRole}-01`,
        name,
        email,
        role: selectedRole,
        avatar: name.split(' ').map((n) => n[0]).join(''),
      });
      setLoading(false);
    }, 400);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'owner') setEmail('ralphokono@gmail.com');
    if (role === 'manager') setEmail('manager@weenaloft.co.ke');
    if (role === 'maintenance') setEmail('maintenance@weenaloft.co.ke');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0C0E0D] relative overflow-hidden bg-dark-grid">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Monogram Showcase */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-24 h-24 rounded-2xl overflow-hidden border border-[#D4A962]/40 bg-[#161816] shadow-xl relative flex items-center justify-center p-1">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_fpvvh1fpvvh1fpvv_15e70fd6.jpg"
              alt="Weena Loft Logo"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-serif font-bold text-3xl text-[#D8B475] absolute pointer-events-none">
              W
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#D8B475] uppercase font-bold">
              MANAGEMENT PORTAL
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F6F3EC] tracking-tight mt-1">
              WEENA LOFT ACCOMMODATIONS
            </h1>
            <p className="text-xs text-[#8E958C] mt-1">
              Residential property system for four floors.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151815] border border-[#242A24] shadow-2xl space-y-5">
          {/* Role Quick Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E958C] block mb-2">
              Select Access Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'owner', label: 'Owner' },
                { role: 'manager', label: 'Manager' },
                { role: 'maintenance', label: 'Staff' },
              ].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRole(role as UserRole)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedRole === role
                      ? 'bg-[#D4A962] border-[#D4A962] text-[#141714] shadow-sm'
                      : 'bg-[#181B18] border-[#2A312A] text-[#8E958C] hover:text-[#F6F3EC]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#8E958C] block mb-1">Email Account</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8E958C] block mb-1">Security Credential</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-md flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Weena Loft'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-[#8E958C] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D8B475]" />
            <span>Secure offline local storage • Zero cloud telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
