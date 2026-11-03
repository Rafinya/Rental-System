/**
 * Weena Loft Accommodations - Real Building Showcase
 *
 * A simple, animated photograph of a real apartment building in Nairobi.
 * No interior drill-down: floor selection only filters the overview metrics.
 */
import React, { useEffect, useState } from 'react';

interface RealBuildingSceneProps {
  selectedFloor?: number | null;
  onSelectFloor?: (floor: number | null) => void;
  className?: string;
}

const FLOOR_LABELS: Record<number, string> = {
  1: 'Ground Floor',
  2: '1st Floor',
  3: '2nd Floor',
  4: '3rd Floor (Top)',
};

export const RealBuildingScene: React.FC<RealBuildingSceneProps> = ({
  selectedFloor,
  onSelectFloor,
  className = '',
}) => {
  const [active, setActive] = useState<number | null>(selectedFloor ?? null);

  useEffect(() => {
    setActive(selectedFloor ?? null);
  }, [selectedFloor]);

  const handleFloorClick = (floor: number) => {
    const next = active === floor ? null : floor;
    setActive(next);
    onSelectFloor?.(next);
  };

  return (
    <div className={`relative w-full h-full min-h-[340px] sm:min-h-[400px] rounded-2xl overflow-hidden ${className}`}>
      <style>{`
        @keyframes wl-kenburns {
          0% { transform: scale(1.05) translate(0%, 0%); }
          50% { transform: scale(1.12) translate(-1%, -0.5%); }
          100% { transform: scale(1.08) translate(1%, 0.5%); }
        }
        .wl-kenburns { animation: wl-kenburns 28s ease-in-out infinite alternate; will-change: transform; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/assets/building/building-exterior.jpg"
          alt="Weena Loft Accommodations — Nairobi, Kenya"
          className="w-full h-full object-cover wl-kenburns"
          loading="eager"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0B]/80 via-[#0B0E0B]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E0B]/35 via-transparent to-transparent pointer-events-none" />

      {/* Floor selector rail */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {[4, 3, 2, 1].map((floor) => {
          const isActive = active === floor;
          return (
            <button
              key={floor}
              onClick={() => handleFloorClick(floor)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${
                isActive
                  ? 'bg-[#D4A962] text-[#141714] border-[#D4A962] shadow-lg'
                  : 'bg-[#141714]/70 text-[#F6F3EC] border-[#2A312A] hover:border-[#D8B475]/60 hover:bg-[#141714]/90'
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">0{floor}</span>
              <span className="hidden sm:inline">{FLOOR_LABELS[floor]}</span>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 z-20 max-w-[70%]">
        <span className="text-[10px] font-mono tracking-widest text-[#D8B475] uppercase font-semibold block">
          WEENA LOFT · NAIROBI, KENYA
        </span>
        <p className="text-sm sm:text-base font-serif text-[#F6F3EC] mt-1 leading-tight">
          A real home, beautifully managed.
        </p>
      </div>

      <div className="absolute top-3 right-3 z-20">
        <span className="text-xs font-mono font-bold text-[#D8B475] bg-[#141714]/80 px-2.5 py-1 rounded-lg border border-[#242A24]">
          01 <span className="text-[#8E958C]">/ 04</span>
        </span>
      </div>
    </div>
  );
};

export default RealBuildingScene;
