/**
 * Weena Loft Accommodations - Property Intelligence & Operational Reports
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  DoorOpen, 
  Users, 
  Wrench, 
  DollarSign 
} from 'lucide-react';
import { Unit, Tenant, Repair, Floor } from '../../types';

interface ReportsViewProps {
  units: Unit[];
  tenants: Tenant[];
  repairs: Repair[];
  floors: Floor[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  units,
  tenants,
  repairs,
  floors,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'inventory' | 'occupancy' | 'tenants' | 'maintenance' | 'financial'
  >('inventory');

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const vacantUnits = units.filter((u) => u.status === 'vacant').length;
  const maintenanceUnits = units.filter((u) => u.status === 'maintenance').length;

  const currentRentRollKes = units
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + (u.rentKes || 0), 0);
  const potentialRentRollKes = units.reduce((sum, u) => sum + (u.rentKes || 0), 0);
  const vacantLossKes = potentialRentRollKes - currentRentRollKes;

  const totalEstimatedMaintCost = repairs.reduce((sum, r) => sum + (r.estimatedCostKes || 0), 0);
  const totalActualMaintCost = repairs.reduce((sum, r) => sum + (r.actualCostKes || 0), 0);

  const exportCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUnitsCSV = () => {
    const headers = ['Unit Number', 'Floor', 'Type', 'Status', 'Rent (KES)', 'Deposit (KES)', 'Size (sqm)', 'Tenant'];
    const rows = units.map((u) => {
      const t = tenants.find((item) => item.id === u.tenantId);
      return [
        u.unitNumber,
        String(u.floor),
        u.type,
        u.status,
        String(u.rentKes),
        String(u.depositKes || u.rentKes),
        String(u.sizeSqm || ''),
        t ? t.fullName : 'Vacant',
      ];
    });
    exportCSV('weena-loft-inventory', [headers, ...rows]);
  };

  const handleExportTenantsCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Assigned Unit', 'Floor', 'Status', 'Start Date', 'Departure Date'];
    const rows = tenants.map((t) => {
      const u = units.find((item) => item.id === t.assignedUnitId);
      return [
        t.fullName,
        t.phone,
        t.email || '',
        u ? `Unit ${u.unitNumber}` : 'None',
        u ? String(u.floor) : '',
        t.status,
        t.tenancyStartDate,
        t.departureDate || '',
      ];
    });
    exportCSV('weena-loft-residents', [headers, ...rows]);
  };

  const handleExportRepairsCSV = () => {
    const headers = ['Ticket #', 'Unit', 'Floor', 'Title', 'Category', 'Impact', 'Status', 'Worker', 'Est Cost', 'Actual Cost'];
    const rows = repairs.map((r) => [
      r.ticketNumber,
      r.unitNumber,
      String(r.floor),
      r.title,
      r.category,
      r.impact,
      r.status,
      r.assignedWorker || '',
      String(r.estimatedCostKes || 0),
      String(r.actualCostKes || 0),
    ]);
    exportCSV('weena-loft-maintenance', [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Tabs */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D8B475]" />
              <h2 className="text-2xl font-serif font-bold text-[#F6F3EC]">
                Intelligence & Reports
              </h2>
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              Export reports to CSV / Excel or generate a print summary for Weena Loft.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] hover:bg-[#252A25] shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-[#8E958C]" />
              <span>Print View</span>
            </button>
            <button
              onClick={() => {
                if (activeReportTab === 'inventory') handleExportUnitsCSV();
                else if (activeReportTab === 'tenants') handleExportTenantsCSV();
                else handleExportRepairsCSV();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1F241F]">
          {[
            { id: 'inventory', label: 'Unit Inventory' },
            { id: 'occupancy', label: 'Floor Occupancy' },
            { id: 'tenants', label: 'Residents Roster' },
            { id: 'maintenance', label: 'Maintenance Log' },
            { id: 'financial', label: 'Financial Roll' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeReportTab === tab.id
                  ? 'bg-[#D4A962] text-[#141714] shadow-sm'
                  : 'bg-[#1C201C] text-[#8E958C] hover:text-[#F6F3EC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24]">
          <span className="text-[10px] uppercase font-mono text-[#8E958C] block">Collected Rent Roll</span>
          <span className="text-xl font-bold font-serif text-[#D8B475] mt-1 block">
            KES {currentRentRollKes.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8E958C]">From {occupiedUnits} occupied units</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24]">
          <span className="text-[10px] uppercase font-mono text-[#8E958C] block">Potential Maximum</span>
          <span className="text-xl font-bold font-serif text-[#F6F3EC] mt-1 block">
            KES {potentialRentRollKes.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8E958C]">100% capacity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24]">
          <span className="text-[10px] uppercase font-mono text-[#8E958C] block">Vacancy Opportunity</span>
          <span className="text-xl font-bold font-serif text-[#F87171] mt-1 block">
            KES {vacantLossKes.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8E958C]">{vacantUnits} vacant units</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151815] border border-[#242A24]">
          <span className="text-[10px] uppercase font-mono text-[#8E958C] block">Actual Repair Costs</span>
          <span className="text-xl font-bold font-serif text-[#F6F3EC] mt-1 block">
            KES {totalActualMaintCost.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8E958C]">Logged to date</span>
        </div>
      </div>

      {/* 3. Tabulated Reports */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm">
        {activeReportTab === 'inventory' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">Complete Unit Inventory</h3>
            {units.length === 0 ? (
              <p className="text-xs text-[#8E958C] italic">No units registered yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#242A24]">
                <table className="w-full text-left text-xs text-[#F6F3EC]">
                  <thead className="bg-[#181B18] text-[#8E958C] font-mono text-[10px] uppercase border-b border-[#242A24]">
                    <tr>
                      <th className="p-3">Unit #</th>
                      <th className="p-3">Floor</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Rent (KES)</th>
                      <th className="p-3">Deposit (KES)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F241F]">
                    {units.map((u) => (
                      <tr key={u.id} className="hover:bg-[#1C201C]">
                        <td className="p-3 font-bold font-serif">#{u.unitNumber}</td>
                        <td className="p-3 font-mono text-[#8E958C]">Floor {u.floor}</td>
                        <td className="p-3">{u.type}</td>
                        <td className="p-3 font-mono font-bold text-[#D8B475]">KES {u.rentKes.toLocaleString()}</td>
                        <td className="p-3 font-mono">KES {(u.depositKes || u.rentKes).toLocaleString()}</td>
                        <td className="p-3 capitalize">{u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeReportTab === 'occupancy' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">Occupancy by Floor (Four Floors)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {floors.map((fl) => {
                const fUnits = units.filter((u) => u.floor === fl.floorNumber);
                const fOcc = fUnits.filter((u) => u.status === 'occupied').length;
                const fRate = fUnits.length > 0 ? Math.round((fOcc / fUnits.length) * 100) : 0;

                return (
                  <div key={fl.floorNumber} className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#F6F3EC] text-base">{fl.name}</span>
                      <span className="font-mono text-xs text-[#D8B475] font-bold">{fRate}% Occupancy</span>
                    </div>
                    <div className="w-full bg-[#1C201C] h-2 rounded-full overflow-hidden border border-[#242A24]">
                      <div className="bg-[#D4A962] h-full rounded-full" style={{ width: `${fRate}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#8E958C]">
                      <span>{fOcc} Occupied / {fUnits.length} Total</span>
                      <span>{fUnits.filter((u) => u.status === 'vacant').length} Vacant</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeReportTab === 'tenants' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">Residents & Tenancy Log</h3>
            {tenants.length === 0 ? (
              <p className="text-xs text-[#8E958C] italic">No resident records found.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#242A24]">
                <table className="w-full text-left text-xs text-[#F6F3EC]">
                  <thead className="bg-[#181B18] text-[#8E958C] font-mono text-[10px] uppercase border-b border-[#242A24]">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F241F]">
                    {tenants.map((t) => {
                      const u = units.find((item) => item.id === t.assignedUnitId);
                      return (
                        <tr key={t.id} className="hover:bg-[#1C201C]">
                          <td className="p-3 font-semibold">{t.fullName}</td>
                          <td className="p-3 text-[#8E958C]">{t.phone}</td>
                          <td className="p-3 font-mono text-[#D8B475]">{u ? `Unit #${u.unitNumber}` : '—'}</td>
                          <td className="p-3 text-[#8E958C] font-mono">{t.tenancyStartDate}</td>
                          <td className="p-3 capitalize">{t.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeReportTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">Maintenance & Repair Ledger</h3>
            {repairs.length === 0 ? (
              <p className="text-xs text-[#8E958C] italic">No repairs logged.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#242A24]">
                <table className="w-full text-left text-xs text-[#F6F3EC]">
                  <thead className="bg-[#181B18] text-[#8E958C] font-mono text-[10px] uppercase border-b border-[#242A24]">
                    <tr>
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Impact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actual Cost (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F241F]">
                    {repairs.map((r) => (
                      <tr key={r.id} className="hover:bg-[#1C201C]">
                        <td className="p-3 font-mono font-bold text-[#D8B475]">{r.ticketNumber}</td>
                        <td className="p-3">Unit #{r.unitNumber}</td>
                        <td className="p-3 font-semibold">{r.title}</td>
                        <td className="p-3">{r.impact}</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3 font-mono font-bold text-[#F6F3EC]">
                          KES {(r.actualCostKes || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeReportTab === 'financial' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">Monthly Financial Rent Roll Breakdown</h3>
            <div className="p-5 rounded-2xl bg-[#181B18] border border-[#242A24] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242A24]">
                <span className="text-xs font-semibold text-[#8E958C]">Gross Potential Rent Roll (100%):</span>
                <span className="font-mono text-base font-bold text-[#F6F3EC]">
                  KES {potentialRentRollKes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#242A24]">
                <span className="text-xs font-semibold text-[#8E958C]">Actual Occupied Collection:</span>
                <span className="font-mono text-base font-bold text-[#D8B475]">
                  KES {currentRentRollKes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8E958C]">Estimated Maintenance Outlay:</span>
                <span className="font-mono text-base font-bold text-[#F87171]">
                  - KES {totalActualMaintCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
