/**
 * Weena Loft Accommodations - Executive Overview
 * Matches the reference screenshot layout, color tokens, and 3D hero integration.
 */

import React, { useState } from 'react';
import { 
  Building2, 
  DoorOpen, 
  Users, 
  Wrench, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Activity,
  Plus,
  Download,
  MoreHorizontal,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { RealBuildingScene } from './RealBuildingScene';
import { Unit, Tenant, Repair, Floor, AuditLog } from '../../types';

interface OverviewViewProps {
  units: Unit[];
  tenants: Tenant[];
  repairs: Repair[];
  floors: Floor[];
  auditLogs: AuditLog[];
  showActivityLog: boolean;
  onNavigateTab: (tab: string, targetId?: string) => void;
  onOpenAddUnit: (floorNum?: number) => void;
  onOpenAddTenant: () => void;
  onOpenNewRepair: () => void;
  onQuickUpdateRepair: (repairId: string, status: any, note: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  units,
  tenants,
  repairs,
  floors,
  auditLogs,
  showActivityLog,
  onNavigateTab,
  onOpenAddUnit,
  onOpenAddTenant,
  onOpenNewRepair,
  onQuickUpdateRepair,
}) => {
  const [selected3dFloor, setSelected3dFloor] = useState<number | null>(null);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const vacantUnits = units.filter((u) => u.status === 'vacant').length;
  const maintenanceUnits = units.filter((u) => u.status === 'maintenance').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const activeTenants = tenants.filter((t) => t.status === 'active');
  const openRepairs = repairs.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
  const highImpactRepairs = openRepairs.filter((r) => r.impact === 'HIGH');
  const completedRepairsCount = repairs.filter((r) => r.status === 'Completed').length;

  const floorUnits = selected3dFloor !== null ? units.filter((u) => u.floor === selected3dFloor) : units;
  const floorOccupied = floorUnits.filter((u) => u.status === 'occupied').length;
  const floorRate = floorUnits.length > 0 ? Math.round((floorOccupied / floorUnits.length) * 100) : 0;

  const handleExportCSV = () => {
    const csvRows = [
      ['Unit Number', 'Floor', 'Type', 'Status', 'Rent KES', 'Tenant Name', 'Tenant Phone'],
      ...units.map((u) => {
        const tenant = tenants.find((t) => t.id === u.tenantId);
        return [
          u.unitNumber,
          u.floor,
          u.type,
          u.status,
          u.rentKes || 0,
          tenant ? tenant.fullName : '',
          tenant ? tenant.phone : '',
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `weena-loft-overview-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header matching screenshot layout */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#8E958C] uppercase font-semibold block">
            WEENA LOFT / PROPERTY OVERVIEW
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F6F3EC] tracking-tight mt-1">
            Your property, in perspective.
          </h1>
          <p className="text-xs sm:text-sm text-[#9EA59B] mt-1 max-w-xl">
            A considered view of your building, tenants and day-to-day operations.
          </p>
        </div>

        {/* Action buttons matching screenshot */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161916] border border-[#2D352D] text-[#F6F3EC] text-xs font-medium hover:bg-[#1E241E] hover:border-[#D8B475]/40 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#8E958C]" />
            <span>Export</span>
          </button>

          <button
            onClick={() => onOpenAddUnit(1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] hover:bg-[#E2BA72] text-[#141714] text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add unit</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Card matching screenshot */}
      <div className="relative rounded-3xl bg-[#1F241F] border border-[#2C332C] p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-6 space-y-4 z-10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#D8B475] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A BETTER VIEW OF HOME</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F6F3EC] leading-[1.15] tracking-tight">
              Thoughtful living.<br />
              <span className="italic font-normal text-[#EAE4D8]">Beautifully managed.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#A9B2A6] max-w-md leading-relaxed">
              Your building at a glance — from the people who call it home to the details that keep it running.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('floors')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F6F3EC] text-[#151815] text-xs font-semibold hover:bg-white transition-all shadow-sm group"
              >
                <span>Explore your building</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Bottom accent badge */}
            <div className="pt-6">
              <span className="text-[11px] font-mono tracking-widest text-[#D8B475]/90 uppercase font-medium">
                — FOUR FLOORS. ONE HOME.
              </span>
            </div>
          </div>

          {/* Right Column: 3D Architectural Scene & Badges from Screenshot */}
          <div className="lg:col-span-6 relative flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
            {/* Top Right Counter: "01 / 04" */}
            <div className="absolute top-0 right-0 z-20">
              <span className="text-xs font-mono font-bold text-[#D8B475] bg-[#141714]/80 px-2.5 py-1 rounded-lg border border-[#242A24]">
                01 <span className="text-[#8E958C]">/ 04</span>
              </span>
            </div>

            {/* Real building showcase */}
            <div className="w-full h-full min-h-[340px] sm:min-h-[400px] rounded-2xl overflow-hidden relative">
              <RealBuildingScene
                selectedFloor={selected3dFloor}
                onSelectFloor={(f) => setSelected3dFloor(f)}
                onManageFloor={(f) => onNavigateTab('floors')}
                className="w-full h-full border-0 !bg-[#1F241F]"
              />
            </div>

            {/* Bottom Badges from Screenshot: "● ARCHITECTURAL OVERVIEW" and "04 FLOORS" */}
            <div className="flex items-center justify-between pt-2 z-20 text-[10px] font-mono text-[#8E958C] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D8B475]" />
                <span className="font-semibold text-[#A9B2A6]">ARCHITECTURAL OVERVIEW</span>
              </div>
              <span className="font-bold text-[#D8B475]">04 FLOORS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Four Metric Cards from Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Building Floors / Inventory */}
        <div 
          onClick={() => onNavigateTab('floors')}
          className="p-5 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8E958C] group-hover:text-[#F6F3EC]">
              <span className="text-[11px] font-mono">Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-[#F6F3EC]">
              04
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              Building floors active
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1F241F] flex items-center justify-between text-[11px] text-[#8E958C]">
            <span>Ground to Top Floor</span>
            <span className="text-[#D8B475] font-mono font-medium">Ready</span>
          </div>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div 
          onClick={() => onNavigateTab('tenants')}
          className="p-5 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8E958C] group-hover:text-[#F6F3EC]">
              <span className="text-[11px] font-mono">{occupancyRate}%</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-[#F6F3EC]">
              {occupancyRate}%
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              {activeTenants.length} active resident{activeTenants.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1F241F] flex items-center justify-between text-[11px] text-[#8E958C]">
            <span>{occupiedUnits} occupied</span>
            <span>{vacantUnits} vacant</span>
          </div>
        </div>

        {/* Card 3: Apartment Units */}
        <div 
          onClick={() => onNavigateTab('units')}
          className="p-5 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8E958C] group-hover:text-[#F6F3EC]">
              <span className="text-[11px] font-mono">Units</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-[#F6F3EC]">
              {totalUnits < 10 ? `0${totalUnits}` : totalUnits}
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              {totalUnits === 0 ? 'No units added yet' : 'Registered apartments'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1F241F] flex items-center justify-between text-[11px] text-[#8E958C]">
            <span className="text-[#D8B475] hover:underline" onClick={(e) => { e.stopPropagation(); onOpenAddUnit(1); }}>
              + Add unit
            </span>
            <span className="font-mono text-[#8E958C]">Weena Loft</span>
          </div>
        </div>

        {/* Card 4: Maintenance / Repairs */}
        <div 
          onClick={() => onNavigateTab('repairs')}
          className="p-5 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8E958C] group-hover:text-[#F6F3EC]">
              <span className="text-[11px] font-mono">Repairs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-[#F6F3EC]">
              {openRepairs.length < 10 ? `0${openRepairs.length}` : openRepairs.length}
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              {highImpactRepairs.length > 0 ? (
                <span className="text-[#F87171] font-semibold">{highImpactRepairs.length} critical priority</span>
              ) : (
                'Active maintenance issues'
              )}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1F241F] flex items-center justify-between text-[11px] text-[#8E958C]">
            <span>{completedRepairsCount} resolved</span>
            <span className="text-[#D8B475] font-mono">Log issue →</span>
          </div>
        </div>
      </div>

      {/* 4. Critical Impact Alert Banner (if any) */}
      {highImpactRepairs.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#2A1414] border border-[#5A1E1E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#3B1A1A] text-[#F87171]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#F87171]">
                  Critical Priority Maintenance ({highImpactRepairs.length} active)
                </h3>
                <p className="text-xs text-[#E5A8A8]">
                  These high-impact items affect building operations or habitability.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('repairs')}
              className="text-xs font-semibold text-[#F87171] hover:underline"
            >
              View in maintenance board →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {highImpactRepairs.map((repair) => (
              <div
                key={repair.id}
                className="p-3.5 rounded-xl bg-[#1C1616] border border-[#4A2020] flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F87171]">
                      {repair.ticketNumber} • Unit {repair.unitNumber} (Floor {repair.floor})
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#331414] text-[#F87171] border border-[#5A1E1E] font-bold">
                      {repair.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F6F3EC] mt-1">{repair.title}</h4>
                  <p className="text-xs text-[#9EA59B] mt-1 line-clamp-2">
                    {repair.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2F1C1C] text-xs">
                  <span className="text-[#9EA59B]">
                    Assigned: <strong className="text-[#F6F3EC]">{repair.assignedWorker || 'Unassigned'}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {repair.status !== 'In Progress' && (
                      <button
                        onClick={() => onQuickUpdateRepair(repair.id, 'In Progress', 'Contractor dispatched.')}
                        className="px-2.5 py-1 rounded-lg bg-[#2A1F12] text-[#D8B475] border border-[#48351F] text-[11px] font-semibold"
                      >
                        Start Work
                      </button>
                    )}
                    {repair.status !== 'Completed' && (
                      <button
                        onClick={() => onQuickUpdateRepair(repair.id, 'Completed', 'Issue resolved.')}
                        className="px-2.5 py-1 rounded-lg bg-[#142B1A] text-[#4ADE80] border border-[#235730] text-[11px] font-semibold"
                      >
                        Mark Fixed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Four Floor Overview & Activity Trail */}
      <div className={`grid grid-cols-1 ${showActivityLog ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* Four Floor Structure breakdown */}
        <div className={`${showActivityLog ? 'lg:col-span-7' : ''} space-y-3`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
                Four-Floor Building Structure
              </h3>
              <p className="text-xs text-[#8E958C]">Click any floor to view registered units</p>
            </div>
            <button
              onClick={() => onNavigateTab('floors')}
              className="text-xs text-[#D8B475] hover:underline flex items-center gap-1 font-semibold"
            >
              Manage floors <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {floors.map((fl) => {
              const fUnits = units.filter((u) => u.floor === fl.floorNumber);
              const fOccupied = fUnits.filter((u) => u.status === 'occupied').length;
              const fVacant = fUnits.filter((u) => u.status === 'vacant').length;
              const fMaint = fUnits.filter((u) => u.status === 'maintenance').length;
              const fRate = fUnits.length > 0 ? Math.round((fOccupied / fUnits.length) * 100) : 0;

              return (
                <div
                  key={fl.floorNumber}
                  onClick={() => setSelected3dFloor(fl.floorNumber)}
                  className="p-4 rounded-xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C201C] text-[#D8B475] font-serif font-bold text-lg flex items-center justify-center shrink-0 border border-[#2A312A]">
                      0{fl.floorNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F6F3EC]">{fl.name}</h4>
                      <p className="text-[11px] text-[#8E958C] line-clamp-1">
                        {fl.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#F6F3EC] font-mono">
                        {fOccupied}/{fUnits.length} Occupied
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8E958C]">
                        <span>{fVacant} Vacant</span>
                        {fMaint > 0 && <span className="text-[#D8B475]">• {fMaint} Maint</span>}
                      </div>
                    </div>

                    <div className="w-16 sm:w-20 bg-[#1C201C] h-2 rounded-full overflow-hidden border border-[#242A24]">
                      <div
                        className="bg-[#D4A962] h-full rounded-full transition-all duration-300"
                        style={{ width: `${fRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Activity Log — owner / system admin only */}
        {showActivityLog && (
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#151815] border border-[#242A24] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#242A24] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D8B475]" />
                <h3 className="font-serif text-base font-bold text-[#F6F3EC]">
                  Operational Activity Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8E958C]">
                {auditLogs.length} events
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8E958C] italic">
                  No activity logged yet. Your changes will appear here as you add units, tenants, and repairs.
                </div>
              ) : (
                auditLogs.slice(0, 7).map((log) => (
                  <div key={log.id} className="text-xs flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D8B475] shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F6F3EC] text-[11px]">
                          {log.actor}
                        </span>
                        <span className="text-[9px] font-mono text-[#70786E]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E958C] mt-0.5 leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

            <div className="pt-3 border-t border-[#242A24] text-[11px] text-[#8E958C] flex items-center justify-between">
              <span>Weena Loft Accommodations</span>
              <span className="font-mono text-[#D8B475]">4 Floors</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
