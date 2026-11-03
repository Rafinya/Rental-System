import React, { useState } from 'react';
import { Building2, Layers, DoorOpen, ArrowRight } from 'lucide-react';
import { Unit, Tenant, Floor } from '../../types';
import { WeenaBuilding3D } from '../3d/WeenaBuilding3D';

interface Props {
  units: Unit[];
  tenants: Tenant[];
  floors: Floor[];
  onNavigateTab: (tab: string, targetId?: string) => void;
}

const FLOOR_NAMES: Record<number, string> = {
  1: 'Ground Floor — Bedsitters',
  2: 'First Floor — One-bedroom',
  3: 'Second Floor — Two-bedroom',
  4: 'Third Floor — Three-bedroom',
};

export const BuildingExplorerView: React.FC<Props> = ({ units, tenants, floors, onNavigateTab }) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');

  const floorUnits = selectedFloor !== null ? units.filter((u) => u.floor === selectedFloor) : units;
  const selectedUnit = selectedUnitId ? units.find((u) => u.id === selectedUnitId) : null;
  const selectedTenant = selectedUnit?.tenantId ? tenants.find((t) => t.id === selectedUnit.tenantId) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#8E958C] uppercase font-semibold block">
            WEENA LOFT / BUILDING EXPLORER
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F6F3EC] tracking-tight mt-1">
            Explore your building in 3D
          </h1>
          <p className="text-xs text-[#9EA59B] mt-1 max-w-xl">
            Rotate, zoom and pan the model. Select a floor or an apartment to inspect its details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'occupied', 'vacant', 'maintenance'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono uppercase tracking-wider font-semibold transition-all ${
                statusFilter === f
                  ? 'bg-[#D4A962] text-[#141714] border-[#D4A962]'
                  : 'bg-[#151815] text-[#8E958C] border-[#242A24] hover:text-[#F6F3EC] hover:border-[#D8B475]/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: floor selector */}
        <div className="lg:col-span-2 space-y-2">
          <div className="p-3 rounded-2xl bg-[#151815] border border-[#242A24] space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#8E958C] uppercase font-semibold block">
              FLOORS
            </span>
            {[4, 3, 2, 1].map((fl) => {
              const flUnits = units.filter((u) => u.floor === fl);
              const isSelected = selectedFloor === fl;
              return (
                <button
                  key={fl}
                  onClick={() => {
                    setSelectedFloor(isSelected ? null : fl);
                    setSelectedUnitId(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#1A1F1A] border-[#D8B475] shadow-lg ring-1 ring-[#D8B475]'
                      : 'bg-[#1C201C] border-[#2A312A] hover:border-[#D8B475]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#D8B475] font-bold">Floor 0{fl}</span>
                    <span className="text-[10px] font-mono text-[#8E958C]">{flUnits.length} units</span>
                  </div>
                  <p className="text-[11px] text-[#F6F3EC] mt-1 truncate">{FLOOR_NAMES[fl]}</p>
                </button>
              );
            })}
            <button
              onClick={() => {
                setSelectedFloor(null);
                setSelectedUnitId(null);
              }}
              className="w-full p-2.5 rounded-xl border text-[11px] font-semibold bg-[#1C201C] border-[#2A312A] text-[#8E958C] hover:text-[#F6F3EC] hover:border-[#D8B475]/50 transition-all"
            >
              Show All Floors
            </button>
          </div>

          {/* Legend */}
          <div className="p-3 rounded-2xl bg-[#151815] border border-[#242A24] space-y-1.5 text-[10px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#6B8F71]" /> Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#B8B0A4]" /> Vacant</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#C9A25D]" /> Maintenance</span>
          </div>
        </div>

        {/* Center: 3D */}
        <div className="lg:col-span-7 min-h-[420px]">
          <WeenaBuilding3D
            units={units}
            selectedFloor={selectedFloor}
            onSelectFloor={(f) => {
              setSelectedFloor(f);
              setSelectedUnitId(null);
            }}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            statusFilter={statusFilter}
            className="w-full h-full"
          />
        </div>

        {/* Right: details */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24] space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D8B475]" />
              <h3 className="font-serif text-base font-bold text-[#F6F3EC]">
                {selectedFloor ? FLOOR_NAMES[selectedFloor] : 'All Floors'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#1C201C] border border-[#2A312A]">
                <span className="text-[#8E958C] block">Units</span>
                <span className="text-[#F6F3EC] font-bold text-lg">{floorUnits.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C201C] border border-[#2A312A]">
                <span className="text-[#8E958C] block">Occupied</span>
                <span className="text-[#4ADE80] font-bold text-lg">{floorUnits.filter((u) => u.status === 'occupied').length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C201C] border border-[#2A312A]">
                <span className="text-[#8E958C] block">Vacant</span>
                <span className="text-[#F6F3EC] font-bold text-lg">{floorUnits.filter((u) => u.status === 'vacant').length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C201C] border border-[#2A312A]">
                <span className="text-[#8E958C] block">Maintenance</span>
                <span className="text-[#D8B475] font-bold text-lg">{floorUnits.filter((u) => u.status === 'maintenance').length}</span>
              </div>
            </div>
          </div>

          {selectedUnit && (
            <div className="p-4 rounded-2xl bg-[#151815] border border-[#D8B475]/40 space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#D8B475] uppercase font-semibold block">
                SELECTED UNIT
              </span>
              <h4 className="text-lg font-serif font-bold text-[#F6F3EC]">Unit #{selectedUnit.unitNumber}</h4>
              <p className="text-xs text-[#8E958C]">
                {selectedUnit.type} · Floor 0{selectedUnit.floor} · {selectedUnit.status}
              </p>
              <p className="text-xs text-[#8E958C]">
                Tenant: {selectedTenant ? selectedTenant.fullName : 'Vacant'}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onNavigateTab('units', selectedUnit.id)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#D4A962] hover:bg-[#E2BA72] text-[#141714] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  Manage unit <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedUnitId(null)}
                  className="px-3 py-2 rounded-xl bg-[#1C201C] text-[#8E958C] hover:text-[#F6F3EC] text-xs font-semibold transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24] space-y-2">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-[#D8B475]" />
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC]">
                Units on {selectedFloor ? `Floor 0${selectedFloor}` : 'All Floors'} ({floorUnits.length})
              </h4>
            </div>
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {floorUnits.length === 0 ? (
                <p className="text-xs text-[#8E958C] italic">No units registered yet.</p>
              ) : (
                floorUnits.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      selectedUnitId === u.id
                        ? 'bg-[#1A1F1A] border-[#D8B475]'
                        : 'bg-[#1C201C] border-[#2A312A] hover:border-[#D8B475]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F6F3EC]">#{u.unitNumber}</span>
                      <span className="text-[10px] font-mono text-[#8E958C]">{u.type}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono ${
                        u.status === 'occupied'
                          ? 'text-[#4ADE80]'
                          : u.status === 'maintenance'
                          ? 'text-[#D8B475]'
                          : 'text-[#8E958C]'
                      }`}
                    >
                      {u.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingExplorerView;
