/**
 * Weena Loft Accommodations - Register / Edit Tenant Modal
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Tenant, Unit } from '../../types';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: any) => void;
  units: Unit[];
  initialUnitId?: string | null;
  editingTenant?: Tenant | null;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  units,
  initialUnitId = null,
  editingTenant = null,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedUnitId, setAssignedUnitId] = useState<string>(initialUnitId || '');
  const [tenancyStartDate, setTenancyStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Optional fields
  const [email, setEmail] = useState('');
  const [idPassportNumber, setIdPassportNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const assignableUnits = units.filter(
    (u) =>
      u.status === 'vacant' ||
      (editingTenant && u.id === editingTenant.assignedUnitId) ||
      u.id === initialUnitId
  );

  useEffect(() => {
    if (editingTenant) {
      setFullName(editingTenant.fullName);
      setPhone(editingTenant.phone);
      setAssignedUnitId(editingTenant.assignedUnitId || '');
      setTenancyStartDate(editingTenant.tenancyStartDate);
      setEmail(editingTenant.email || '');
      setIdPassportNumber(editingTenant.idPassportNumber || '');
      setEmergencyContactName(editingTenant.emergencyContactName || '');
      setEmergencyContactPhone(editingTenant.emergencyContactPhone || '');
      setEmergencyContactRelation(editingTenant.emergencyContactRelation || '');
      setNotes(editingTenant.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setAssignedUnitId(initialUnitId || '');
      setTenancyStartDate(new Date().toISOString().split('T')[0]);
      setEmail('');
      setIdPassportNumber('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setEmergencyContactRelation('');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingTenant, initialUnitId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter the resident’s full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter a primary phone number.');
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      assignedUnitId: assignedUnitId || null,
      tenancyStartDate,
      email: email.trim() || undefined,
      idPassportNumber: idPassportNumber.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      emergencyContactRelation: emergencyContactRelation.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'active',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151815] border border-[#242A24] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
                Resident Profile
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">
                {editingTenant ? `Edit Resident: ${editingTenant.fullName}` : 'Register New Resident'}
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

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#2A1414] border border-[#4A2020] text-xs text-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Amani Odhiambo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Assign Unit
              </label>
              <select
                value={assignedUnitId}
                onChange={(e) => setAssignedUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                <option value="">No Unit Assigned (Unassigned)</option>
                {assignableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit #{u.unitNumber} • Floor {u.floor} ({u.type}) - KES {u.rentKes.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Tenancy Start Date *
              </label>
              <input
                type="date"
                value={tenancyStartDate}
                onChange={(e) => setTenancyStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="resident@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                National ID / Passport (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 12345678"
                value={idPassportNumber}
                onChange={(e) => setIdPassportNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181B18] border border-[#242A24] space-y-3">
            <span className="text-[11px] font-mono text-[#D8B475] uppercase font-bold block">
              Emergency Contact Details (Optional)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="px-2.5 py-1.5 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={emergencyContactRelation}
                onChange={(e) => setEmergencyContactRelation(e.target.value)}
                className="px-2.5 py-1.5 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="px-2.5 py-1.5 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Car parking slot allocation, lease agreement notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            />
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
              {editingTenant ? 'Save Changes' : 'Register Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
