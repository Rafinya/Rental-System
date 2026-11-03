/**
 * Weena Loft Accommodations - Create / Edit Unit Modal
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState, useEffect } from 'react';
import { X, DoorOpen, AlertCircle } from 'lucide-react';
import { Unit, UnitType } from '../../types';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (unitData: any) => void;
  unitTypes: string[];
  initialFloor?: number;
  editingUnit?: Unit | null;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  unitTypes,
  initialFloor = 1,
  editingUnit = null,
}) => {
  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState<number>(initialFloor);
  const [type, setType] = useState<UnitType>('One-bedroom' as UnitType);
  const [rentKes, setRentKes] = useState<string>('60000');
  const [depositKes, setDepositKes] = useState<string>('60000');
  const [sizeSqm, setSizeSqm] = useState<string>('');
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'>('Unfurnished');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingUnit) {
      setUnitNumber(editingUnit.unitNumber);
      setFloor(editingUnit.floor);
      setType(editingUnit.type);
      setRentKes(String(editingUnit.rentKes));
      setDepositKes(editingUnit.depositKes ? String(editingUnit.depositKes) : String(editingUnit.rentKes));
      setSizeSqm(editingUnit.sizeSqm ? String(editingUnit.sizeSqm) : '');
      setFurnishing(editingUnit.furnishing || 'Unfurnished');
      setDescription(editingUnit.description || '');
      setNotes(editingUnit.notes || '');
    } else {
      setUnitNumber('');
      setFloor(initialFloor);
      setType((unitTypes[0] as UnitType) || ('One-bedroom' as UnitType));
      setRentKes('60000');
      setDepositKes('60000');
      setSizeSqm('');
      setFurnishing('Unfurnished');
      setDescription('');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingUnit, initialFloor, isOpen, unitTypes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitNumber.trim()) {
      setErrorMessage('Please enter an apartment house number (e.g. 101, A2, etc.).');
      return;
    }

    const rentNum = Number(rentKes);
    if (isNaN(rentNum) || rentNum <= 0) {
      setErrorMessage('Please enter a valid monthly rent amount in KES.');
      return;
    }

    const depositNum = Number(depositKes) || rentNum;
    const sizeNum = sizeSqm ? Number(sizeSqm) : undefined;

    onSubmit({
      unitNumber: unitNumber.trim(),
      floor,
      type,
      rentKes: rentNum,
      depositKes: depositNum,
      sizeSqm: sizeNum,
      furnishing,
      description: description.trim(),
      notes: notes.trim(),
      status: editingUnit ? editingUnit.status : 'vacant',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151815] border border-[#242A24] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
                Weena Loft Accommodation
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">
                {editingUnit ? `Edit Unit #${editingUnit.unitNumber}` : 'Register New Apartment Unit'}
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
                House / Unit Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 2A, 4B"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Floor Allocation *
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                <option value={1}>Floor 01 (Ground Floor)</option>
                <option value={2}>Floor 02 (Second Level)</option>
                <option value={3}>Floor 03 (Third Level)</option>
                <option value={4}>Floor 04 (Top Floor)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Unit Classification *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as UnitType)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                {unitTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Furnishing Level
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Monthly Rent (KES) *
              </label>
              <input
                type="number"
                value={rentKes}
                onChange={(e) => setRentKes(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono font-bold focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Deposit (KES)
              </label>
              <input
                type="number"
                value={depositKes}
                onChange={(e) => setDepositKes(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono focus:outline-none focus:border-[#D8B475]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Size (m²)
              </label>
              <input
                type="number"
                placeholder="e.g. 75"
                value={sizeSqm}
                onChange={(e) => setSizeSqm(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Apartment Description / Features
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Balcony facing sunset, high ceilings, parquet flooring..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Internal Management Notes (Private)
            </label>
            <input
              type="text"
              placeholder="e.g. Meter token number, key tags, spare keys..."
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
              {editingUnit ? 'Save Changes' : 'Register Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
