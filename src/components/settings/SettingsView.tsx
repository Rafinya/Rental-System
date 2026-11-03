/**
 * Weena Loft Accommodations - Settings & Property Configuration
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState } from 'react';
import { 
  Building, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  Save,
  Key,
  Shield,
  X
} from 'lucide-react';
import { PropertySettings, User, UserRole } from '../../types';

interface SettingsViewProps {
  settings: PropertySettings;
  onUpdateSettings: (updates: Partial<PropertySettings>) => void;
  currentUser: User;
  onUpdateUserRole: (role: UserRole) => void;
  onOpenProfileModal?: () => void;
  onExportData: () => void;
  onImportData: (json: string) => boolean;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
  onUpdateUserRole,
  onOpenProfileModal,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [formData, setFormData] = useState<PropertySettings>(settings);
  const [newUnitType, setNewUnitType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUnitType = () => {
    if (!newUnitType.trim()) return;
    if (formData.unitTypes.includes(newUnitType.trim())) return;
    const updated = [...formData.unitTypes, newUnitType.trim()];
    setFormData({ ...formData, unitTypes: updated });
    onUpdateSettings({ unitTypes: updated });
    setNewUnitType('');
  };

  const handleRemoveUnitType = (typeToRemove: string) => {
    const updated = formData.unitTypes.filter((t) => t !== typeToRemove);
    setFormData({ ...formData, unitTypes: updated });
    onUpdateSettings({ unitTypes: updated });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (formData.repairCategories.includes(newCategory.trim())) return;
    const updated = [...formData.repairCategories, newCategory.trim()];
    setFormData({ ...formData, repairCategories: updated });
    onUpdateSettings({ repairCategories: updated });
    setNewCategory('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updated = formData.repairCategories.filter((c) => c !== catToRemove);
    setFormData({ ...formData, repairCategories: updated });
    onUpdateSettings({ repairCategories: updated });
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) return;
    const ok = onImportData(importJsonText);
    if (ok) {
      alert('Data imported successfully!');
      setShowImportDialog(false);
      setImportJsonText('');
    } else {
      alert('Invalid JSON structure. Please check backup file.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-[#F6F3EC]">
          Property Configuration & System Settings
        </h2>
        <p className="text-xs text-[#8E958C] mt-1">
          Customize property naming, unit classifications, maintenance workflows, backup storage, and administrator permissions.
        </p>
      </div>

      {/* 1. Property Identity */}
      <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#F6F3EC] flex items-center gap-2">
          <Building className="w-4 h-4 text-[#D8B475]" />
          <span>Building Identity & Location</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Property Name</label>
            <input
              type="text"
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Building Floors (Fixed Architecture)</label>
            <input
              type="number"
              disabled
              value={formData.floorsCount}
              className="w-full px-3 py-2 bg-[#141714] border border-[#242A24] rounded-xl text-[#8E958C] cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Address / Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Currency Code</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono focus:outline-none focus:border-[#D8B475]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
          {saveSuccess && (
            <span className="text-xs font-semibold text-[#4ADE80] flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* 2. Unit Classifications */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
          Unit Types & Configurations
        </h3>
        <p className="text-xs text-[#8E958C]">
          These classifications appear in dropdowns when creating or editing apartments in Weena Loft.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {formData.unitTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs text-[#F6F3EC] font-medium"
            >
              <span>{type}</span>
              <button
                type="button"
                onClick={() => handleRemoveUnitType(type)}
                className="text-[#8E958C] hover:text-[#F87171]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Add new unit type (e.g. Duplex)..."
            value={newUnitType}
            onChange={(e) => setNewUnitType(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
          />
          <button
            type="button"
            onClick={handleAddUnitType}
            className="px-3.5 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72]"
          >
            Add
          </button>
        </div>
      </div>

      {/* 3. Maintenance Categories */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
          Maintenance Categories
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {formData.repairCategories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs text-[#F6F3EC] font-medium"
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                className="text-[#8E958C] hover:text-[#F87171]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Add category (e.g. Elevators)..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-3.5 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72]"
          >
            Add
          </button>
        </div>
      </div>

      {/* 4. Role & Permissions — owner / system admin only */}
      {currentUser.role === 'owner' && (
        <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#F6F3EC] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D8B475]" />
            <span>Role & Access Control</span>
          </h3>
          <p className="text-xs text-[#8E958C]">
            Logged in as <strong className="text-[#F6F3EC]">{currentUser.name}</strong> ({currentUser.email}).
            Only owners can switch viewing roles.
          </p>
          <div className="max-w-xs pt-1">
            <select
              value={currentUser.role}
              onChange={(e) => onUpdateUserRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="owner">Building Owner (Full Administrative Access)</option>
              <option value="manager">Property Manager (Operational Control)</option>
              <option value="maintenance">Maintenance Staff (Repairs View Only)</option>
            </select>
          </div>
        </div>
      )}

      {/* 5. Account Details & Password Security for Owner, Manager, Staff */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#D8B475]" />
              <span>User Profile & Security Password</span>
            </h3>
            <p className="text-xs text-[#8E958C] mt-1">
              {currentUser.role === 'owner'
                ? 'Change personal contact details, display name, and login password for this account.'
                : 'View your account details and change your login password. Contact the owner to update your personal information.'}
            </p>
          </div>

          {onOpenProfileModal && (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-bold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{currentUser.role === 'owner' ? 'Edit Details & Password' : 'View Profile & Change Password'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono text-[#8E958C] uppercase block">Display Name</span>
            <p className="font-bold text-[#F6F3EC] mt-0.5">{currentUser.name}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono text-[#8E958C] uppercase block">Login Email</span>
            <p className="font-semibold text-[#F6F3EC] mt-0.5 truncate">{currentUser.email}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono text-[#8E958C] uppercase block">Password</span>
            <p className="font-mono text-[#D8B475] mt-0.5">•••••••• (Protected)</p>
          </div>
        </div>
      </div>

      {/* 5. Data Backup, Export & Clear Slate */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
          Data Management & Backup
        </h3>
        <p className="text-xs text-[#8E958C]">
          Export complete system records to JSON, or restore from a previous backup file.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] hover:bg-[#252A25] shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#D8B475]" />
            <span>Export Backup JSON</span>
          </button>

          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] hover:bg-[#252A25] shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-[#D8B475]" />
            <span>Restore / Import JSON</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? This will leave your building empty for clean input.')) {
                onResetData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1414] border border-[#4A2020] text-xs font-semibold text-[#F87171] hover:bg-[#381818] shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Clean Slate</span>
          </button>
        </div>

        {showImportDialog && (
          <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24] space-y-3 mt-3">
            <span className="text-xs font-bold text-[#F6F3EC] block">Paste Backup JSON Content:</span>
            <textarea
              rows={5}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON content here..."
              className="w-full p-2.5 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono focus:outline-none focus:border-[#D8B475]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-3 py-1.5 text-xs text-[#8E958C] hover:text-[#F6F3EC]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-4 py-1.5 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72]"
              >
                Apply Restore
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
