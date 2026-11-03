/**
 * Weena Loft Accommodations - User & Access Management
 * Owner-only workspace for creating accounts and managing user details.
 */

import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  Wrench,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Mail,
  Phone,
  Key,
  UserCog,
} from 'lucide-react';
import { User, UserRole } from '../../types';

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner / System Admin',
  manager: 'Property Manager',
  maintenance: 'Maintenance Staff',
};

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  owner: 'bg-[#2A1F12] text-[#D8B475] border-[#48351F]',
  manager: 'bg-[#14202B] text-[#7DD3FC] border-[#234257]',
  maintenance: 'bg-[#142B1A] text-[#4ADE80] border-[#235730]',
};

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  owner: Shield,
  manager: Users,
  maintenance: Wrench,
};

type UserFormPayload = {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
};

type SaveResult = { success: boolean; message: string };

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (payload: UserFormPayload) => SaveResult;
  onUpdateUser: (userId: string, updates: Partial<UserFormPayload>) => SaveResult;
  onDeleteUser: (userId: string) => SaveResult;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  currentUser: User;
  onSave: (payload: UserFormPayload, editingUser: User | null) => SaveResult;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(editingUser?.name || '');
    setEmail(editingUser?.email || '');
    setPhone(editingUser?.phone || '');
    setRole(editingUser?.role || 'manager');
    setPassword('');
    setError(null);
  }, [isOpen, editingUser]);

  if (!isOpen) return null;

  const isEditingSelf = editingUser?.id === currentUser.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.trim() && password.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const result = onSave(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        ...(password.trim() ? { password: password.trim() } : {}),
      },
      editingUser
    );

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151815] border border-[#242A24] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        <div className="flex items-start justify-between border-b border-[#242A24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
                {editingUser ? 'Edit Account' : 'New Account'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">
                {editingUser ? editingUser.name : 'Add a System User'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#1C201C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl border bg-[#2A1414] border-[#4A2020] text-[#F87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Full Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Wanjiku"
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
              required
            />
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
                placeholder="user@weenaloft.co.ke"
                className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Access Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isEditingSelf}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="owner">Owner / System Admin</option>
                <option value="manager">Property Manager</option>
                <option value="maintenance">Maintenance Staff</option>
              </select>
            </div>
          </div>

          {isEditingSelf && (
            <p className="text-[11px] text-[#8E958C]">
              You cannot change your own role while signed in. Another owner must do this.
            </p>
          )}

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password (optional)'}
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? 'Unchanged' : 'Defaults to password123'}
                className="w-full pl-8 pr-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] text-[11px] text-[#8E958C]">
            <span className="font-semibold text-[#F6F3EC]">Role permissions: </span>
            Owners manage users and all property data. Managers handle day-to-day operations.
            Maintenance staff only see the repairs &amp; maintenance dashboard.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242A24]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C201C] text-xs font-semibold text-[#8E958C] hover:text-[#F6F3EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-md transition-all"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const maintenanceCount = users.filter((u) => u.role === 'maintenance').length;

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      ROLE_LABELS[user.role].toLowerCase().includes(query)
    );
  });

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (payload: UserFormPayload, editing: User | null): SaveResult => {
    const result = editing
      ? onUpdateUser(editing.id, payload)
      : onCreateUser(payload);

    setFeedback({ text: result.message, isError: !result.success });
    return result;
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser.id) {
      setFeedback({ text: 'You cannot delete your own account while signed in.', isError: true });
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.name}'s ${ROLE_LABELS[user.role]} account? This cannot be undone.`
    );
    if (!confirmed) return;

    const result = onDeleteUser(user.id);
    setFeedback({ text: result.message, isError: !result.success });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-[#D8B475]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
              Owner Workspace
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F6F3EC] mt-1">
            User & Access Management
          </h2>
          <p className="text-xs text-[#8E958C] mt-1">
            Create accounts, edit personal details, assign roles, and control who can access Weena Loft.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
            feedback.isError
              ? 'bg-[#2A1414] border-[#4A2020] text-[#F87171]'
              : 'bg-[#142B1A] border-[#235730] text-[#4ADE80]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-[#F6F3EC]' },
          { label: 'Owners', value: ownerCount, icon: Shield, color: 'text-[#D8B475]' },
          { label: 'Managers', value: managerCount, icon: Users, color: 'text-[#7DD3FC]' },
          { label: 'Maintenance', value: maintenanceCount, icon: Wrench, color: 'text-[#4ADE80]' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 rounded-2xl bg-[#151815] border border-[#242A24] flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E958C] block">
                  {stat.label}
                </span>
                <span className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1C201C] border border-[#2A312A] flex items-center justify-center">
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs bg-[#141714] border border-[#242A24] rounded-xl text-[#F6F3EC] placeholder-[#70786E] focus:outline-none focus:border-[#D8B475]"
        />
      </div>

      {/* User list */}
      {filteredUsers.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#151815] border border-[#242A24] text-center space-y-2">
          <UserCog className="w-8 h-8 text-[#8E958C] mx-auto" />
          <p className="text-sm font-semibold text-[#F6F3EC]">No users match your search</p>
          <p className="text-xs text-[#8E958C]">Try a different name, email, or role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredUsers.map((user) => {
            const RoleIcon = ROLE_ICONS[user.role];
            const isSelf = user.id === currentUser.id;
            const isLastOwner = user.role === 'owner' && ownerCount <= 1;

            return (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/40 transition-all flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#1C201C] border border-[#D8B475]/40 text-[#D8B475] font-serif font-bold text-base flex items-center justify-center shrink-0">
                      {user.avatar || user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#F6F3EC] truncate">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C201C] text-[#F6F3EC] border border-[#2A312A] uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#8E958C] min-w-0">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#8E958C]">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono uppercase font-semibold border shrink-0 ${ROLE_BADGE_STYLES[user.role]}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#242A24]">
                  <span className="text-[10px] text-[#666C63] font-mono">
                    {user.updatedAt
                      ? `Updated ${new Date(user.updatedAt).toLocaleDateString()}`
                      : 'Active account'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C201C] border border-[#2A312A] text-[#F6F3EC] text-[11px] font-semibold hover:border-[#D8B475] transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={isSelf || isLastOwner}
                      title={
                        isSelf
                          ? 'You cannot delete your own account'
                          : isLastOwner
                          ? 'At least one owner account must remain'
                          : 'Delete account'
                      }
                      className="p-1.5 rounded-lg bg-[#1C201C] border border-[#2A312A] text-[#8E958C] hover:text-[#F87171] hover:border-[#4A2020] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#8E958C] disabled:hover:border-[#2A312A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        currentUser={currentUser}
        onSave={handleSave}
      />
    </div>
  );
};
