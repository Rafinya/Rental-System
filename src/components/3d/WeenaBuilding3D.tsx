import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Unit } from '../../types';

const FLOOR_HEIGHT = 1.5;
const EXPLODE_GAP = 1.6;

const FLOOR_LABELS: Record<number, string> = {
  1: 'Ground Floor — Bedsitters',
  2: 'First Floor — One-bedroom',
  3: 'Second Floor — Two-bedroom',
  4: 'Third Floor — Three-bedroom',
};

const STATUS_COLORS: Record<string, string> = {
  occupied: '#6B8F71',
  vacant: '#B8B0A4',
  maintenance: '#C9A25D',
};

function unitSize(type: string): [number, number, number] {
  const t = type.toLowerCase();
  if (t.includes('studio') || t.includes('bedsitter')) return [0.85, 0.45, 0.75];
  if (t.includes('1-bedroom') || t.includes('one-bedroom')) return [1.05, 0.45, 0.85];
  if (t.includes('2-bedroom') || t.includes('two-bedroom')) return [1.3, 0.45, 0.95];
  if (t.includes('3-bedroom') || t.includes('three-bedroom')) return [1.55, 0.45, 1.05];
  if (t.includes('executive')) return [1.5, 0.45, 1.0];
  return [1.0, 0.45, 0.85];
}

interface UnitMeshProps {
  unit: Unit;
  position: [number, number, number];
  selected: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  hovered: boolean;
}

const UnitMesh: React.FC<UnitMeshProps> = ({ unit, position, selected, dimmed, onSelect, onHover, hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = unitSize(unit.type);
  const color = STATUS_COLORS[unit.status] ?? '#B8B0A4';

  useFrame(() => {
    if (!meshRef.current) return;
    const target = selected ? 1.1 : hovered ? 1.06 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(unit.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(unit.id);
      }}
      onPointerOut={() => onHover(null)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        metalness={0.12}
        transparent
        opacity={dimmed ? 0.25 : 1.0}
        emissive={selected ? color : '#000000'}
        emissiveIntensity={selected ? 0.35 : 0}
      />
      {(hovered || selected) && (
        <Html position={[0, size[1] / 2 + 0.22, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded-md bg-[#141714]/90 border border-[#D8B475]/60 text-[10px] text-[#F6F3EC] font-mono whitespace-nowrap shadow-lg">
            <span className="text-[#D8B475] font-bold">#{unit.unitNumber}</span>
            <span className="ml-1.5 opacity-80">{unit.type}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
};

interface BuildingProps {
  units: Unit[];
  selectedFloor: number | null;
  selectedUnitId: string | null;
  exploded: boolean;
  statusFilter: 'all' | 'occupied' | 'vacant' | 'maintenance';
  onSelectFloor: (floor: number | null) => void;
  onSelectUnit: (id: string | null) => void;
  hoveredUnitId: string | null;
  onHoverUnit: (id: string | null) => void;
}

const Building: React.FC<BuildingProps> = ({
  units,
  selectedFloor,
  selectedUnitId,
  exploded,
  statusFilter,
  onSelectFloor,
  onSelectUnit,
  hoveredUnitId,
  onHoverUnit,
}) => {
  const floorRefs = useRef<(THREE.Group | null)[]>([]);
  const buildingRef = useRef<THREE.Group>(null);

  // GSAP reveal on mount
  useEffect(() => {
    if (!buildingRef.current) return;
    buildingRef.current.scale.set(0.001, 0.001, 0.001);
    gsap.to(buildingRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.3,
      ease: 'power3.out',
    });
    return () => {
      const scale = buildingRef.current?.scale;
      if (scale) gsap.killTweensOf(scale);
    };
  }, []);

  useFrame(() => {
    floorRefs.current.forEach((g, idx) => {
      if (!g) return;
      const floorNum = idx + 1;
      const baseY = (floorNum - 1) * FLOOR_HEIGHT;
      const explodeY = baseY + (exploded ? (floorNum - 1) * EXPLODE_GAP : 0);
      const isolated = selectedFloor !== null && selectedFloor !== floorNum;
      const targetY = explodeY - (isolated ? 0.15 : 0);
      g.position.y += (targetY - g.position.y) * 0.12;
      const targetScale = isolated ? 0.96 : 1.0;
      g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      // dim materials
      g.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.transparent !== undefined) {
            const targetOpacity = isolated ? 0.28 : 1.0;
            mat.opacity += (targetOpacity - mat.opacity) * 0.12;
            mat.transparent = true;
          }
        }
      });
    });
  });

  return (
    <group ref={buildingRef}>
      {([1, 2, 3, 4] as number[]).map((floorNum) => {
        const floorUnits = units.filter((u) => u.floor === floorNum);
        const filteredUnits =
          statusFilter === 'all' ? floorUnits : floorUnits.filter((u) => u.status === statusFilter);
        const visibleSet = new Set(filteredUnits.map((u) => u.id));

        // layout
        const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(floorUnits.length, 1))));
        const spacingX = 1.15;
        const spacingZ = 0.95;
        const positioned = floorUnits.map((u, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = (col - (cols - 1) / 2) * spacingX;
          const z = (row - (Math.ceil(floorUnits.length / cols) - 1) / 2) * spacingZ;
          return { unit: u, position: [x, 0.32, z] as [number, number, number] };
        });

        const slabWidth = Math.max(4.6, cols * spacingX + 1.4);
        const slabDepth = Math.max(3.2, Math.ceil(floorUnits.length / cols) * spacingZ + 1.2);

        return (
          <group
            key={floorNum}
            ref={(g) => {
              floorRefs.current[floorNum - 1] = g;
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectFloor(floorNum);
            }}
          >
            {/* Floor slab */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[slabWidth, 0.18, slabDepth]} />
              <meshStandardMaterial color="#E8E2D8" roughness={0.7} metalness={0.05} />
            </mesh>
            {/* Slab edge */}
            <mesh position={[0, -0.02, 0]}>
              <boxGeometry args={[slabWidth + 0.06, 0.22, slabDepth + 0.06]} />
              <meshStandardMaterial color="#CFC7BA" roughness={0.8} metalness={0.05} transparent opacity={0.55} />
            </mesh>

            {/* Units */}
            {positioned.map(({ unit, position }) => (
              <UnitMesh
                key={unit.id}
                unit={unit}
                position={position}
                selected={selectedUnitId === unit.id}
                dimmed={statusFilter !== 'all' && !visibleSet.has(unit.id)}
                onSelect={onSelectUnit}
                onHover={onHoverUnit}
                hovered={hoveredUnitId === unit.id}
              />
            ))}

            {/* Floor label */}
            <Html position={[0, 1.05, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
              <div className="px-2.5 py-1 rounded-lg bg-[#141714]/85 border border-[#2A312A] text-[10px] font-mono text-[#D8B475] whitespace-nowrap shadow">
                {FLOOR_LABELS[floorNum]}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Ground podium */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.3, 4.6]} />
        <meshStandardMaterial color="#D9D2C5" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Roof cap */}
      <mesh position={[0, 4 * FLOOR_HEIGHT + 0.12, 0]}>
        <boxGeometry args={[5.2, 0.12, 3.6]} />
        <meshStandardMaterial color="#C69248" roughness={0.35} metalness={0.6} />
      </mesh>
    </group>
  );
};

interface WeenaBuilding3DProps {
  units: Unit[];
  selectedFloor: number | null;
  onSelectFloor: (floor: number | null) => void;
  selectedUnitId: string | null;
  onSelectUnit: (id: string | null) => void;
  statusFilter?: 'all' | 'occupied' | 'vacant' | 'maintenance';
  className?: string;
}

export const WeenaBuilding3D: React.FC<WeenaBuilding3DProps> = ({
  units,
  selectedFloor,
  onSelectFloor,
  selectedUnitId,
  onSelectUnit,
  statusFilter = 'all',
  className = '',
}) => {
  const [exploded, setExploded] = useState(false);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-[#1F241F] ${className}`}>
      <Canvas
        shadows
        camera={{ position: [7.5, 5.5, 7.5], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1F241F']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 6]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 6, -4]} intensity={0.35} />
        <pointLight position={[0, 4, 0]} intensity={0.4} color="#D8B475" />

        <Suspense fallback={null}>
          <Building
            units={units}
            selectedFloor={selectedFloor}
            selectedUnitId={selectedUnitId}
            exploded={exploded}
            statusFilter={statusFilter}
            onSelectFloor={onSelectFloor}
            onSelectUnit={onSelectUnit}
            hoveredUnitId={hoveredUnitId}
            onHoverUnit={setHoveredUnitId}
          />
          <ContactShadows position={[0, -0.55, 0]} opacity={0.45} scale={12} blur={2.2} far={4} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 2.0, 0]}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <button
          onClick={() => setExploded((v) => !v)}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md transition-all ${
            exploded
              ? 'bg-[#D4A962] text-[#141714] border-[#D4A962]'
              : 'bg-[#141714]/75 text-[#F6F3EC] border-[#2A312A] hover:border-[#D8B475]/60'
          }`}
        >
          {exploded ? 'Assemble Floors' : 'Explode Floors'}
        </button>
        <button
          onClick={resetCamera}
          className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md bg-[#141714]/75 text-[#F6F3EC] border-[#2A312A] hover:border-[#D8B475]/60 transition-all"
        >
          Reset Camera
        </button>
        <button
          onClick={() => {
            const controls = controlsRef.current;
            if (!controls) return;
            const floorY = selectedFloor ? (selectedFloor - 1) * 1.5 + 0.5 : 2.0;
            controls.object.position.set(0, selectedFloor ? 9 : 12, 0.01);
            controls.target.set(0, floorY, 0);
            controls.update();
          }}
          className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md bg-[#141714]/75 text-[#F6F3EC] border-[#2A312A] hover:border-[#D8B475]/60 transition-all"
        >
          Top View
        </button>
        {selectedFloor !== null && (
          <button
            onClick={() => onSelectFloor(null)}
            className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md bg-[#141714]/75 text-[#F6F3EC] border-[#2A312A] hover:border-[#D8B475]/60 transition-all"
          >
            Show All Floors
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 px-3 py-2 rounded-xl bg-[#141714]/75 border border-[#2A312A] backdrop-blur-md text-[10px] font-mono">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#6B8F71]" /> Occupied</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#B8B0A4]" /> Vacant</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#C9A25D]" /> Maintenance</span>
      </div>

      {/* Counter */}
      <div className="absolute top-3 right-3 z-20">
        <span className="text-xs font-mono font-bold text-[#D8B475] bg-[#141714]/80 px-2.5 py-1 rounded-lg border border-[#242A24]">
          01 <span className="text-[#8E958C]">/ 04</span>
        </span>
      </div>

      <div className="absolute bottom-3 right-3 z-20 text-[10px] font-mono text-[#8E958C] uppercase tracking-wider">
        Drag to rotate · Scroll to zoom · Right-drag to pan
      </div>
    </div>
  );
};

export default WeenaBuilding3D;
