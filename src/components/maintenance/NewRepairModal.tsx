/**
 * Weena Loft Accommodations - Log Maintenance Ticket Modal
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';
import { Unit, RepairCategory, RepairImpact } from '../../types';

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (repairData: any) => void;
  units: Unit[];
  categories: string[];
  initialUnitId?: string | null;
}

export const NewRepairModal: React.FC<NewRepairModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  units,
  categories,
  initialUnitId = null,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitId, setUnitId] = useState<string>(initialUnitId || (units[0]?.id || ''));
  const [impact, setImpact] = useState<RepairImpact>('MEDIUM');
  const [category, setCategory] = useState<RepairCategory>('Plumbing');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);

  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [estimatedCostKes, setEstimatedCostKes] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setUnitId(initialUnitId || (units[0]?.id || ''));
      setImpact('MEDIUM');
      setCategory('Plumbing');
      setDateReported(new Date().toISOString().split('T')[0]);
      setReporterName('');
      setReporterPhone('');
      setAssignedWorker('');
      setEstimatedCostKes('');
      setDueDate('');
      setNotes('');
      setErrorMessage('');
    }
  }, [isOpen, initialUnitId, units]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Please provide an issue title.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide a short description of the fault or maintenance request.');
      return;
    }

    if (!unitId) {
      setErrorMessage('Please select an apartment unit for this repair.');
      return;
    }

    const selectedUnit = units.find((u) => u.id === unitId);

    onSubmit({
      unitId,
      unitNumber: selectedUnit ? selectedUnit.unitNumber : 'Building Common Area',
      floor: selectedUnit ? selectedUnit.floor : 1,
      title: title.trim(),
      description: description.trim(),
      category,
      impact,
      status: 'Reported',
      dateReported,
      reporterName: reporterName.trim() || undefined,
      reporterPhone: reporterPhone.trim() || undefined,
      assignedWorker: assignedWorker.trim() || undefined,
      estimatedCostKes: estimatedCostKes ? Number(estimatedCostKes) : undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151815] border border-[#242A24] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B475] font-bold">
                Maintenance Work Order
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">
                Log Repair Ticket
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
                Affected Apartment Unit *
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                required
              >
                {units.length === 0 ? (
                  <option value="">No units created yet</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit #{u.unitNumber} • Floor {u.floor} ({u.type})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Impact / Urgency Level *
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as RepairImpact)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                <option value="LOW">LOW — Cosmetic / Minor non-urgent</option>
                <option value="MEDIUM">MEDIUM — Standard maintenance</option>
                <option value="HIGH">HIGH — Urgent / Habitability / Water / Electric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Maintenance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RepairCategory)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Date Reported *
              </label>
              <input
                type="date"
                value={dateReported}
                onChange={(e) => setDateReported(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Master bathroom mixer tap leaking water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, what needs replacing, access instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Assigned Contractor / Worker
              </label>
              <input
                type="text"
                placeholder="e.g. Samuel (Plumber)"
                value={assignedWorker}
                onChange={(e) => setAssignedWorker(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E958C] block mb-1">
                Estimated Cost (KES)
              </label>
              <input
                type="number"
                placeholder="KES estimate"
                value={estimatedCostKes}
                onChange={(e) => setEstimatedCostKes(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono focus:outline-none focus:border-[#D8B475]"
              />
            </div>
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
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
