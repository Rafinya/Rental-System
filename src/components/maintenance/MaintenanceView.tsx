/**
 * Weena Loft Accommodations - Repairs & Maintenance Operations
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  ShieldAlert, 
  Kanban, 
  List, 
  X,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Repair, RepairStatus, Unit } from '../../types';

interface MaintenanceViewProps {
  repairs: Repair[];
  units: Unit[];
  onOpenNewRepair: () => void;
  onUpdateRepairStatus: (
    id: string,
    status: RepairStatus,
    note: string,
    actualCostKes?: number,
    assignedWorker?: string
  ) => void;
  selectedRepairIdInitial?: string | null;
}

const STATUSES: RepairStatus[] = [
  'Reported',
  'Acknowledged',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
];

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  repairs,
  units,
  onOpenNewRepair,
  onUpdateRepairStatus,
  selectedRepairIdInitial = null,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(
    selectedRepairIdInitial ? repairs.find((r) => r.id === selectedRepairIdInitial) || null : null
  );

  const [transitioningRepair, setTransitioningRepair] = useState<Repair | null>(null);
  const [targetStatus, setTargetStatus] = useState<RepairStatus>('In Progress');
  const [transitionNote, setTransitionNote] = useState<string>('');
  const [actualCostInput, setActualCostInput] = useState<number>(0);
  const [contractorInput, setContractorInput] = useState<string>('');

  React.useEffect(() => {
    if (selectedRepairIdInitial) {
      const found = repairs.find((r) => r.id === selectedRepairIdInitial);
      if (found) setSelectedRepair(found);
    }
  }, [selectedRepairIdInitial, repairs]);

  const filteredRepairs = repairs.filter((r) => {
    if (filterImpact !== 'all' && r.impact !== filterImpact) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterFloor !== 'all' && r.floor !== Number(filterFloor)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTicket = r.ticketNumber.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchUnit = r.unitNumber.toLowerCase().includes(q);
      const matchWorker = (r.assignedWorker || '').toLowerCase().includes(q);
      if (!matchTicket && !matchTitle && !matchUnit && !matchWorker) return false;
    }
    return true;
  });

  const openTransitionModal = (repair: Repair, nextStatus: RepairStatus) => {
    setTransitioningRepair(repair);
    setTargetStatus(nextStatus);
    setTransitionNote(`Status updated to ${nextStatus}.`);
    setActualCostInput(repair.actualCostKes || repair.estimatedCostKes || 0);
    setContractorInput(repair.assignedWorker || '');
  };

  const handleConfirmTransition = () => {
    if (!transitioningRepair) return;
    onUpdateRepairStatus(
      transitioningRepair.id,
      targetStatus,
      transitionNote,
      targetStatus === 'Completed' ? actualCostInput : undefined,
      contractorInput || undefined
    );
    setTransitioningRepair(null);
    if (selectedRepair?.id === transitioningRepair.id) {
      setSelectedRepair(null);
    }
  };

  const highImpactCount = repairs.filter((r) => r.impact === 'HIGH' && !['Completed', 'Cancelled'].includes(r.status)).length;
  const inProgressCount = repairs.filter((r) => r.status === 'In Progress').length;
  const totalCostKes = repairs.reduce((acc, r) => acc + (r.actualCostKes || r.estimatedCostKes || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#D8B475]" />
              <h2 className="text-2xl font-serif font-bold text-[#F6F3EC]">
                Repairs & Maintenance Operations
              </h2>
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              Log tickets, assign local contractors, track parts and repair costs for Weena Loft.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-[#1C201C] border border-[#2A312A]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'kanban' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
                title="Board Pipeline"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
                title="List Table"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenNewRepair}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Repair</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono uppercase text-[#8E958C] block">Open Tickets</span>
            <span className="text-xl font-bold font-serif text-[#F6F3EC] mt-0.5 block">
              {repairs.filter((r) => !['Completed', 'Cancelled'].includes(r.status)).length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono uppercase text-[#F87171] block">High Urgency</span>
            <span className="text-xl font-bold font-serif text-[#F87171] mt-0.5 block">
              {highImpactCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono uppercase text-[#D8B475] block">In Progress</span>
            <span className="text-xl font-bold font-serif text-[#D8B475] mt-0.5 block">
              {inProgressCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] font-mono uppercase text-[#8E958C] block">Total Incurred</span>
            <span className="text-lg font-bold font-mono text-[#F6F3EC] mt-0.5 block">
              KES {totalCostKes.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
            <input
              type="text"
              placeholder="Search ticket #, title, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] placeholder-[#70786E] focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          <div>
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Impact Levels</option>
              <option value="HIGH">High Impact (Urgent)</option>
              <option value="MEDIUM">Medium Impact</option>
              <option value="LOW">Low Impact</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Four Floors</option>
              <option value="1">Floor 01</option>
              <option value="2">Floor 02</option>
              <option value="3">Floor 03</option>
              <option value="4">Floor 04</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Content: Kanban or List */}
      {repairs.length === 0 ? (
        <div className="p-12 text-center bg-[#151815] border border-dashed border-[#242A24] rounded-3xl shadow-sm">
          <Wrench className="w-12 h-12 mx-auto text-[#8E958C]/40 mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">No repairs or maintenance tickets</h3>
          <p className="text-xs text-[#8E958C] mt-1 max-w-sm mx-auto leading-relaxed">
            All systems in Weena Loft are operating smoothly. When a resident reports a plumbing, electrical, or structural issue, log it here.
          </p>
          <button
            onClick={onOpenNewRepair}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm"
          >
            + Log First Issue
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const statusRepairs = filteredRepairs.filter((r) => r.status === status);

            return (
              <div
                key={status}
                className="p-3 rounded-2xl bg-[#131613] border border-[#242A24] space-y-2.5 min-w-[210px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#242A24]">
                  <span className="font-serif text-xs font-bold text-[#F6F3EC]">{status}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1C201C] text-[#8E958C] border border-[#2A312A] font-bold">
                    {statusRepairs.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[620px] overflow-y-auto pr-0.5">
                  {statusRepairs.map((repair) => (
                    <div
                      key={repair.id}
                      onClick={() => setSelectedRepair(repair)}
                      className={`p-3 rounded-xl bg-[#181B18] border transition-all cursor-pointer space-y-2 shadow-sm hover:border-[#D8B475]/60 ${
                        selectedRepair?.id === repair.id ? 'border-[#D8B475]' : 'border-[#242A24]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#D8B475] font-bold">
                          {repair.ticketNumber}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold border ${
                            repair.impact === 'HIGH'
                              ? 'bg-[#331414] text-[#F87171] border-[#5A1E1E]'
                              : repair.impact === 'MEDIUM'
                              ? 'bg-[#2B2312] text-[#D8B475] border-[#48351F]'
                              : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                          }`}
                        >
                          {repair.impact}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#F6F3EC] line-clamp-2">
                        {repair.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-[#8E958C] pt-1 border-t border-[#1F241F]">
                        <span>Unit #{repair.unitNumber}</span>
                        <span>Floor {repair.floor}</span>
                      </div>

                      {/* Quick Next Stage Button */}
                      {status !== 'Completed' && status !== 'Cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = status === 'Reported' ? 'Acknowledged' : status === 'Acknowledged' ? 'In Progress' : 'Completed';
                            openTransitionModal(repair, next as RepairStatus);
                          }}
                          className="w-full mt-1 py-1 rounded-lg bg-[#1C201C] hover:bg-[#252A25] text-[#D8B475] text-[10px] font-semibold flex items-center justify-center gap-1 border border-[#2A312A]"
                        >
                          <span>Move to {status === 'Reported' ? 'Ack' : status === 'Acknowledged' ? 'Progress' : 'Fixed'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="overflow-x-auto rounded-2xl border border-[#242A24] bg-[#151815] shadow-sm">
          <table className="w-full text-left text-xs text-[#F6F3EC]">
            <thead className="bg-[#181B18] text-[#8E958C] font-mono text-[10px] uppercase border-b border-[#242A24]">
              <tr>
                <th className="p-3.5">Ticket</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">Issue Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Impact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Contractor</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F241F]">
              {filteredRepairs.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRepair(r)}
                  className="hover:bg-[#1C201C] cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-mono font-bold text-[#D8B475]">{r.ticketNumber}</td>
                  <td className="p-3.5 font-semibold text-[#F6F3EC]">Unit #{r.unitNumber} (Fl {r.floor})</td>
                  <td className="p-3.5 font-semibold text-[#F6F3EC]">{r.title}</td>
                  <td className="p-3.5 text-[#8E958C]">{r.category}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        r.impact === 'HIGH'
                          ? 'bg-[#331414] text-[#F87171] border-[#5A1E1E]'
                          : r.impact === 'MEDIUM'
                          ? 'bg-[#2B2312] text-[#D8B475] border-[#48351F]'
                          : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                      }`}
                    >
                      {r.impact}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-[#F6F3EC]">{r.status}</td>
                  <td className="p-3.5 text-[#8E958C]">{r.assignedWorker || 'Unassigned'}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRepair(r);
                      }}
                      className="text-xs text-[#D8B475] hover:underline font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Ticket Detail Drawer */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-[#151815] border-l border-[#242A24] p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8B475] font-bold">
                  {selectedRepair.ticketNumber}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#F6F3EC]">
                  {selectedRepair.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRepair(null)}
                className="p-1.5 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#1C201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                <span className="text-[10px] font-mono uppercase text-[#8E958C]">Apartment</span>
                <p className="font-bold text-sm text-[#F6F3EC] mt-0.5">
                  Unit #{selectedRepair.unitNumber} (Floor {selectedRepair.floor})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                <span className="text-[10px] font-mono uppercase text-[#8E958C]">Status</span>
                <p className="font-bold text-sm text-[#D8B475] mt-0.5">
                  {selectedRepair.status}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC]">Description</h4>
              <p className="text-xs text-[#8E958C] bg-[#181B18] p-3 rounded-xl border border-[#242A24] leading-relaxed">
                {selectedRepair.description}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                Contractor & Costs
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                  <span className="text-[#8E958C] block text-[10px]">Assigned Worker</span>
                  <p className="font-semibold text-[#F6F3EC] mt-0.5">
                    {selectedRepair.assignedWorker || 'Unassigned'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                  <span className="text-[#8E958C] block text-[10px]">Actual / Est. Cost</span>
                  <p className="font-mono font-bold text-[#D8B475] mt-0.5">
                    KES {(selectedRepair.actualCostKes || selectedRepair.estimatedCostKes || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Advance */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#8E958C]">Advance Workflow State:</span>
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.filter((s) => s !== selectedRepair.status).slice(0, 3).map((st) => (
                  <button
                    key={st}
                    onClick={() => openTransitionModal(selectedRepair, st)}
                    className="p-2 rounded-xl bg-[#1C201C] hover:bg-[#252A25] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] text-center"
                  >
                    → {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Status Transition Modal */}
      {transitioningRepair && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#151815] border border-[#242A24] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono text-[#D8B475] uppercase font-bold">
                Update Ticket Workflow
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F6F3EC] mt-0.5">
                Set status to "{targetStatus}"
              </h3>
              <p className="text-xs text-[#8E958C] mt-1">
                {transitioningRepair.ticketNumber} • {transitioningRepair.title}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Contractor / Technician</label>
                <input
                  type="text"
                  placeholder="e.g. John Mwangi (Plumber)"
                  value={contractorInput}
                  onChange={(e) => setContractorInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                />
              </div>

              {targetStatus === 'Completed' && (
                <div>
                  <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Final Cost Incurred (KES)</label>
                  <input
                    type="number"
                    value={actualCostInput}
                    onChange={(e) => setActualCostInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-mono focus:outline-none focus:border-[#D8B475]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Status Note / Activity Log</label>
                <textarea
                  rows={2}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#242A24]">
              <button
                onClick={() => setTransitioningRepair(null)}
                className="px-4 py-2 rounded-xl bg-[#1C201C] text-xs font-semibold text-[#8E958C] hover:text-[#F6F3EC]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransition}
                className="px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72]"
              >
                Apply State Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
