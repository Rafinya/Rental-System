/**
 * Weena Loft Accommodations - Real Building Showcase
 *
 * Replaces the synthetic 3D scene with a real photograph of a Kenyan
 * residential building. The façade slowly pans/zooms (Ken Burns) and each
 * floor is clickable, zooming into a representative interior layout.
 */
import React, { useEffect, useState } from 'react';
import { ArrowLeft, BedDouble, Bath, Maximize2, Sparkles } from 'lucide-react';

interface FloorExample {
  type: string;
  image: string;
  note: string;
  features: string[];
}

interface RealBuildingSceneProps {
  selectedFloor?: number | null;
  onSelectFloor?: (floor: number | null) => void;
  onManageFloor?: (floor: number) => void;
  className?: string;
}

const FLOOR_LABELS: Record<number, string> = {
  1: 'Ground Floor',
  2: '1st Floor',
  3: '2nd Floor',
  4: '3rd Floor (Top)',
};

const FLOOR_EXAMPLES: Record<number, FloorExample[]> = {
  1: [
    {
      type: 'Bedsitter',
      image: '/assets/building/bedsitter.jpg',
      note: 'Compact single-room living with an open kitchenette and private bath.',
      features: ['Studio layout', 'Kitchenette', 'Private bathroom', 'Natural light'],
    },
  ],
  2: [
    {
      type: '1-Bedroom',
      image: '/assets/building/one-bedroom.jpg',
      note: 'Separate bedroom with a bright living and dining space.',
      features: ['1 Bedroom', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
    {
      type: '2-Bedroom',
      image: '/assets/building/two-bedroom.jpg',
      note: 'Spacious two-bedroom plan ideal for small families.',
      features: ['2 Bedrooms', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
  ],
  3: [
    {
      type: '1-Bedroom',
      image: '/assets/building/one-bedroom.jpg',
      note: 'Separate bedroom with a bright living and dining space.',
      features: ['1 Bedroom', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
    {
      type: '2-Bedroom',
      image: '/assets/building/two-bedroom.jpg',
      note: 'Spacious two-bedroom plan ideal for small families.',
      features: ['2 Bedrooms', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
  ],
  4: [
    {
      type: '1-Bedroom',
      image: '/assets/building/one-bedroom.jpg',
      note: 'Separate bedroom with a bright living and dining space.',
      features: ['1 Bedroom', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
    {
      type: '2-Bedroom',
      image: '/assets/building/two-bedroom.jpg',
      note: 'Spacious two-bedroom plan ideal for small families.',
      features: ['2 Bedrooms', 'Living & dining', 'Fitted kitchen', 'Bathroom'],
    },
  ],
};

export const RealBuildingScene: React.FC<RealBuildingSceneProps> = ({
  selectedFloor,
  onSelectFloor,
  onManageFloor,
  className = '',
}) => {
  const [active, setActive] = useState<number | null>(selectedFloor ?? null);
  const [zoomed, setZoomed] = useState<number | null>(null);

  useEffect(() => {
    setActive(selectedFloor ?? null);
  }, [selectedFloor]);

  const handleFloorClick = (floor: number) => {
    setActive(floor);
    onSelectFloor?.(floor);
    setZoomed(floor);
  };

  const handleReset = () => {
    setActive(null);
    onSelectFloor?.(null);
    setZoomed(null);
  };

  if (zoomed) {
    const examples = FLOOR_EXAMPLES[zoomed] ?? [];
    return (
      <div className={`relative w-full h-full min-h-[340px] sm:min-h-[400px] rounded-2xl overflow-hidden ${className}`}>
        <style>{`
          @keyframes wl-fade-in { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
          .wl-fade-in { animation: wl-fade-in 0.45s ease-out both; }
        `}</style>
        <div className="absolute inset-0 bg-[#0B0E0B]" />
        <div className="relative z-10 h-full flex flex-col p-5 sm:p-6 gap-4 wl-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D8B475] uppercase font-semibold block">
                FLOOR 0{zoomed} · EXAMPLE LAYOUT
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F6F3EC] mt-1">
                {FLOOR_LABELS[zoomed]}
              </h3>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs text-[#F6F3EC] hover:border-[#D8B475]/60 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to building
            </button>
          </div>

          <div className={`grid gap-4 flex-1 ${examples.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border border-[#242A24] bg-[#151815] flex flex-col"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={ex.image}
                    alt={`${ex.type} example`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0B]/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#D4A962] text-[#141714] text-[11px] font-bold">
                    {ex.type}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <p className="text-xs text-[#A9B2A6] leading-relaxed">{ex.note}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ex.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C201C] border border-[#2A312A] text-[#D8B475]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-[#8E958C]">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {ex.type}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> 1 Bath</span>
                    <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> Example only</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {onManageFloor && (
            <div className="flex justify-end">
              <button
                onClick={() => onManageFloor(zoomed)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] hover:bg-[#E2BA72] text-[#141714] text-xs font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Manage Floor 0{zoomed}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[340px] sm:min-h-[400px] rounded-2xl overflow-hidden ${className}`}>
      <style>{`
        @keyframes wl-kenburns {
          0% { transform: scale(1.06) translate(0%, 0%); }
          50% { transform: scale(1.14) translate(-1.2%, -0.6%); }
          100% { transform: scale(1.1) translate(1%, 0.8%); }
        }
        .wl-kenburns { animation: wl-kenburns 26s ease-in-out infinite alternate; will-change: transform; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/assets/building/building-exterior.jpg"
          alt="Weena Loft Accommodations — Nairobi, Kenya"
          className="w-full h-full object-cover wl-kenburns"
          loading="eager"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0B]/85 via-[#0B0E0B]/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E0B]/40 via-transparent to-transparent pointer-events-none" />

      {/* Floor selector rail */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {[4, 3, 2, 1].map((floor) => {
          const isActive = active === floor;
          return (
            <button
              key={floor}
              onClick={() => handleFloorClick(floor)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${
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

      {/* Caption */}
      <div className="absolute bottom-4 left-4 z-20 max-w-[70%]">
        <span className="text-[10px] font-mono tracking-widest text-[#D8B475] uppercase font-semibold block">
          WEENA LOFT · NAIROBI, KENYA
        </span>
        <p className="text-sm sm:text-base font-serif text-[#F6F3EC] mt-1 leading-tight">
          A real home, beautifully managed.
        </p>
        <p className="text-[11px] text-[#A9B2A6] mt-1">
          Click any floor to explore a representative layout.
        </p>
      </div>

      {/* Top counter */}
      <div className="absolute top-3 right-3 z-20">
        <span className="text-xs font-mono font-bold text-[#D8B475] bg-[#141714]/80 px-2.5 py-1 rounded-lg border border-[#242A24]">
          01 <span className="text-[#8E958C]">/ 04</span>
        </span>
      </div>
    </div>
  );
};

export default RealBuildingScene;
