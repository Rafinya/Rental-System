/**
 * Weena Loft Accommodations - User Profile & Password Security Modal
 * Allows Owner, Manager, and Staff to update their contact details,
 * profile name, and change passwords.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Key, 
  Phone, 
  Mail, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck,
  LogOut
} from 'lucide-react';
import { User as UserType, UserRole } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  allUsers: UserType[];
  onUpdateProfile: (
    userId: string,
    updates: { name?: string; email?: string; phone?: string; avatar?: string }
  ) => { success: boolean; user?: UserType; message: string };
  onChangePassword: (
    userId: string,
    currentPass: string,
    newPass: string
  ) => { success: boolean; message: string };
  onSwitchUser: (user: UserType) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateProfile,
  onChangePassword,
  onSwitchUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'accounts'>('details');

  // Details Tab State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [detailsMessage, setDetailsMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Security / Password Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone || '');
    setDetailsMessage(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage(null);
  }, [currentUser, isOpen]);

  const canSwitchProfiles = currentUser.role === 'owner';
  const canEditDetails = currentUser.role === 'owner';

  useEffect(() => {
    if (!canSwitchProfiles && activeTab === 'accounts') {
      setActiveTab('details');
    }
  }, [canSwitchProfiles, activeTab]);

  if (!isOpen) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditDetails) return;
    setDetailsMessage(null);

    if (!name.trim()) {
      setDetailsMessage({ text: 'Full name cannot be empty.', isError: true });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setDetailsMessage({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    const res = onUpdateProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });

    setDetailsMessage({ text: res.message, isError: !res.success });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ text: 'Please enter your current password.', isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', isError: true });
      return;
    }

    const res = onChangePassword(currentUser.id, currentPassword, newPassword);
    setPasswordMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151815] border border-[#242A24] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] font-serif font-bold text-base flex items-center justify-center">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
                  {currentUser.role.toUpperCase()} ACCOUNT
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">
                Account Settings & Security
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#8E958C] hover:text-[#F87171] hover:bg-[#1C201C] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#1C201C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#181B18] border border-[#242A24] text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-[#D4A962] text-[#141714] shadow-sm'
                : 'text-[#8E958C] hover:text-[#F6F3EC]'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#D4A962] text-[#141714] shadow-sm'
                : 'text-[#8E958C] hover:text-[#F6F3EC]'
            }`}
          >
            Change Password
          </button>
          {canSwitchProfiles && (
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'accounts'
                  ? 'bg-[#D4A962] text-[#141714] shadow-sm'
                  : 'text-[#8E958C] hover:text-[#F6F3EC]'
              }`}
            >
              Switch Profile
            </button>
          )}
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
            {detailsMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  detailsMessage.isError
                    ? 'bg-[#2A1414] border-[#4A2020] text-[#F87171]'
                    : 'bg-[#142B1A] border-[#235730] text-[#4ADE80]'
                }`}
              >
                {detailsMessage.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 shrink-0" />
                )}
                <span>{detailsMessage.text}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Full Display Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEditDetails}
                  className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475] disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEditDetails}
                  className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475] disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="text"
                  placeholder="+254 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!canEditDetails}
                  className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] text-[11px] text-[#8E958C]">
              <span>Active Role: </span>
              <strong className="text-[#D8B475] uppercase font-mono">{currentUser.role}</strong>
              <p className="mt-0.5">
                {currentUser.role === 'owner'
                  ? 'Full administrative control over all 4 floors, apartments, and finances.'
                  : currentUser.role === 'manager'
                  ? 'Operational control over resident onboarding, units, and reports.'
                  : 'Maintenance staff access for work orders and inspections.'}
              </p>
            </div>

            {!canEditDetails && (
              <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] text-[11px] text-[#8E958C] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D8B475] shrink-0 mt-0.5" />
                <span>
                  Your profile details are managed by the property owner. You can still change
                  your password from the Change Password tab.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242A24]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1C201C] text-xs font-semibold text-[#8E958C] hover:text-[#F6F3EC]"
              >
                Close
              </button>
              {canEditDetails && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-md transition-all"
                >
                  Save Details
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
            {passwordMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  passwordMessage.isError
                    ? 'bg-[#2A1414] border-[#4A2020] text-[#F87171]'
                    : 'bg-[#142B1A] border-[#235730] text-[#4ADE80]'
                }`}
              >
                {passwordMessage.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  placeholder="Enter current password (default: password123)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E958C] hover:text-[#F6F3EC]"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                New Password *
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E958C] hover:text-[#F6F3EC]"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] text-[11px] text-[#8E958C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D8B475] shrink-0" />
              <span>Password updates take effect immediately across all sessions for {currentUser.name}.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242A24]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1C201C] text-xs font-semibold text-[#8E958C] hover:text-[#F6F3EC]"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-md transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Switch Profiles / Roles — owner / system admin only */}
        {activeTab === 'accounts' && canSwitchProfiles && (
          <div className="space-y-4 text-xs">
            <p className="text-xs text-[#8E958C]">
              Owner-only: switch into any account below to view or manage Weena Loft from that
              user perspective:
            </p>

            <div className="space-y-2">
              {allUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#1C201C] border-[#D8B475] shadow-sm ring-1 ring-[#D8B475]'
                        : 'bg-[#181B18] border-[#242A24] hover:border-[#D8B475]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#141714] border border-[#2A312A] text-[#D8B475] font-serif font-bold text-sm flex items-center justify-center">
                        {u.avatar || u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F6F3EC]">{u.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141714] text-[#D8B475] border border-[#2A312A] uppercase">
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E958C] mt-0.5">{u.email}</p>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="text-[10px] font-semibold text-[#4ADE80] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-xs text-[#D8B475] hover:underline font-semibold">
                          Switch
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
