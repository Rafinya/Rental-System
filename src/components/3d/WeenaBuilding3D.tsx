import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows, RoundedBox } from '@react-three/drei';
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
  if (t.includes('studio') || t.includes('bedsitter')) return [0.9, 0.4, 0.8];
  if (t.includes('1-bedroom') || t.includes('one-bedroom')) return [1.1, 0.4, 0.9];
  if (t.includes('2-bedroom') || t.includes('two-bedroom')) return [1.35, 0.4, 1.0];
  if (t.includes('3-bedroom') || t.includes('three-bedroom')) return [1.6, 0.4, 1.1];
  if (t.includes('executive')) return [1.5, 0.4, 1.0];
  return [1.0, 0.4, 0.9];
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
  const groupRef = useRef<THREE.Group>(null);
  const size = unitSize(unit.type);
  const color = STATUS_COLORS[unit.status] ?? '#B8B0A4';

  useFrame(() => {
    if (!groupRef.current) return;
    const target = selected ? 1.08 : hovered ? 1.05 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18);
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox
        args={size}
        radius={0.06}
        smoothness={4}
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
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.15}
          transparent
          opacity={dimmed ? 0.25 : 1.0}
          emissive={selected ? color : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </RoundedBox>
      {/* Unit number plate */}
      <mesh position={[0, size[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.7, size[2] * 0.5]} />
        <meshBasicMaterial color="#F6F3EC" transparent opacity={0.9} />
      </mesh>
      {(hovered || selected) && (
        <Html position={[0, size[1] / 2 + 0.25, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded-md bg-[#141714]/90 border border-[#D8B475]/60 text-[10px] text-[#F6F3EC] font-mono whitespace-nowrap shadow-lg">
            <span className="text-[#D8B475] font-bold">#{unit.unitNumber}</span>
            <span className="ml-1.5 opacity-80">{unit.type}</span>
          </div>
        </Html>
      )}
    </group>
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

  useEffect(() => {
    if (!buildingRef.current) return;
    buildingRef.current.scale.set(0.001, 0.001, 0.001);
    gsap.to(buildingRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.4,
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
      const targetY = explodeY - (isolated ? 0.2 : 0);
      g.position.y += (targetY - g.position.y) * 0.12;
      const targetScale = isolated ? 0.95 : 1.0;
      g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      g.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.transparent !== undefined) {
            const targetOpacity = isolated ? 0.3 : 1.0;
            mat.opacity += (targetOpacity - mat.opacity) * 0.12;
            mat.transparent = true;
          }
        }
      });
    });
  });

  const buildingWidth = 6.4;
  const buildingDepth = 4.2;

  return (
    <group ref={buildingRef}>
      {/* Ground podium */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[buildingWidth + 1.2, 0.35, buildingDepth + 1.2]} />
        <meshStandardMaterial color="#D9D2C5" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Entrance steps */}
      <mesh position={[0, -0.12, buildingDepth / 2 + 0.7]} receiveShadow>
        <boxGeometry args={[2.4, 0.18, 0.8]} />
        <meshStandardMaterial color="#CFC7BA" roughness={0.8} metalness={0.05} />
      </mesh>

      {([1, 2, 3, 4] as number[]).map((floorNum) => {
        const floorUnits = units.filter((u) => u.floor === floorNum);
        const filteredUnits =
          statusFilter === 'all' ? floorUnits : floorUnits.filter((u) => u.status === statusFilter);
        const visibleSet = new Set(filteredUnits.map((u) => u.id));

        const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(floorUnits.length, 1))));
        const spacingX = 1.2;
        const spacingZ = 1.0;
        const positioned = floorUnits.map((u, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = (col - (cols - 1) / 2) * spacingX;
          const z = (row - (Math.ceil(floorUnits.length / cols) - 1) / 2) * spacingZ;
          return { unit: u, position: [x, 0.3, z] as [number, number, number] };
        });

        const slabWidth = Math.max(4.8, cols * spacingX + 1.6);
        const slabDepth = Math.max(3.4, Math.ceil(floorUnits.length / cols) * spacingZ + 1.4);

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
              <boxGeometry args={[slabWidth, 0.16, slabDepth]} />
              <meshStandardMaterial color="#EAE4D8" roughness={0.6} metalness={0.08} />
            </mesh>
            {/* Slab underside */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[slabWidth - 0.1, 0.05, slabDepth - 0.1]} />
              <meshStandardMaterial color="#D6CEC0" roughness={0.8} metalness={0.05} />
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
            <Html position={[0, 1.1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
              <div className="px-2.5 py-1 rounded-lg bg-[#141714]/85 border border-[#D8B475]/60 text-[10px] font-mono text-[#D8B475] whitespace-nowrap shadow">
                {FLOOR_LABELS[floorNum]}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Building envelope (walls + windows) - only when not exploded */}
      {!exploded && (
        <group>
          {/* Side walls */}
          <mesh position={[-3.3, 3.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 6.2, 4.4]} />
            <meshStandardMaterial color="#C9C1B4" roughness={0.75} metalness={0.05} />
          </mesh>
          <mesh position={[3.3, 3.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 6.2, 4.4]} />
            <meshStandardMaterial color="#C9C1B4" roughness={0.75} metalness={0.05} />
          </mesh>
          {/* Front glass curtain wall */}
          <mesh position={[0, 3.0, 2.2]} castShadow receiveShadow>
            <boxGeometry args={[6.4, 6.2, 0.08]} />
            <meshStandardMaterial color="#DCE6E4" roughness={0.1} metalness={0.3} transparent opacity={0.35} />
          </mesh>
          {/* Back wall */}
          <mesh position={[0, 3.0, -2.2]} castShadow receiveShadow>
            <boxGeometry args={[6.4, 6.2, 0.12]} />
            <meshStandardMaterial color="#C9C1B4" roughness={0.75} metalness={0.05} />
          </mesh>
          {/* Window grid on front */}
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 4 }).map((_, row) => (
              <mesh
                key={`w-${col}-${row}`}
                position={[-2.4 + col * 1.6, 0.9 + row * 1.5, 2.22]}
              >
                <boxGeometry args={[1.0, 0.9, 0.02]} />
                <meshStandardMaterial color="#A8C4D4" roughness={0.05} metalness={0.4} transparent opacity={0.6} />
              </mesh>
            ))
          )}
          {/* Balconies */}
          {Array.from({ length: 4 }).map((_, row) => (
            <mesh key={`bal-${row}`} position={[1.8, 0.9 + row * 1.5 - 0.1, 2.6]} castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.1, 0.7]} />
              <meshStandardMaterial color="#EAE4D8" roughness={0.6} metalness={0.08} />
            </mesh>
          ))}
        </group>
      )}

      {/* Roof */}
      <mesh position={[0, 4 * FLOOR_HEIGHT + 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 0.2, 4.6]} />
        <meshStandardMaterial color="#C69248" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Roof parapet */}
      <mesh position={[0, 4 * FLOOR_HEIGHT + 0.35, 0]}>
        <boxGeometry args={[6.6, 0.4, 4.6]} />
        <meshStandardMaterial color="#C9C1B4" roughness={0.75} metalness={0.05} transparent opacity={0.4} />
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
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className={`relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-[#1F241F] ${className}`}>
      <Canvas
        shadows
        camera={{ position: [8.5, 6.0, 8.5], fov: 40, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1F241F']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 12, 8]} intensity={1.1} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-6, 8, -5]} intensity={0.4} />
        <pointLight position={[0, 4, 0]} intensity={0.5} color="#D8B475" />
        <pointLight position={[0, 8, 0]} intensity={0.3} color="#F6F3EC" />

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
          <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={14} blur={2.4} far={5} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={20}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 2.5, 0]}
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
            const floorY = selectedFloor ? (selectedFloor - 1) * 1.5 + 0.5 : 2.5;
            controls.object.position.set(0, selectedFloor ? 10 : 13, 0.01);
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
