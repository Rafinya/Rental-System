/**
 * Weena Loft Apartment - 3D Architectural Apartment Building Model
 * Styled in Caramel White luxury palette with Studio PBR lighting.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  Building2, 
  Layers, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Maximize2
} from 'lucide-react';

interface BuildingSceneProps {
  selectedFloor: number | null; // null for whole building, or 1, 2, 3, 4
  onSelectFloor?: (floor: number | null) => void;
  className?: string;
  isCompact?: boolean;
}

const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 4.5, 0);

export const BuildingScene: React.FC<BuildingSceneProps> = ({
  selectedFloor,
  onSelectFloor,
  className = '',
  isCompact = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [explodedMode, setExplodedMode] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<'golden' | 'night' | 'day'>('golden');
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeFloorInternal, setActiveFloorInternal] = useState<number | null>(selectedFloor);

  useEffect(() => {
    setActiveFloorInternal(selectedFloor);
  }, [selectedFloor]);

  const sceneContextRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    floorGroups: THREE.Group[];
    floorHighlightMeshes: THREE.Mesh[];
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    groundPlane: THREE.Mesh;
    orbLights: THREE.PointLight[];
    activeFloor: number | null;
    exploded: boolean;
    autoRotate: boolean;
    isSoftwareGl: boolean;
  } | null>(null);

  useEffect(() => {
    if (sceneContextRef.current) {
      sceneContextRef.current.activeFloor = activeFloorInternal;
    }
  }, [activeFloorInternal]);

  useEffect(() => {
    if (sceneContextRef.current) {
      sceneContextRef.current.exploded = explodedMode;
    }
  }, [explodedMode]);

  useEffect(() => {
    if (sceneContextRef.current) {
      sceneContextRef.current.autoRotate = autoRotate;
      sceneContextRef.current.controls.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    const { keyLight, hemiLight, scene } = ctx;

    if (lightingPreset === 'golden') {
      keyLight.color.setHex(0xFFE8D1);
      keyLight.intensity = 2.6;
      hemiLight.color.setHex(0xE5DFC9);
      hemiLight.groundColor.setHex(0x1F241F);
      hemiLight.intensity = 1.4;
      if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x1F241F);
    } else if (lightingPreset === 'night') {
      keyLight.color.setHex(0x65809E);
      keyLight.intensity = 1.3;
      hemiLight.color.setHex(0x404E5B);
      hemiLight.groundColor.setHex(0x0C0E0D);
      hemiLight.intensity = 0.8;
      if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x0C0E0D);
    } else {
      keyLight.color.setHex(0xFFFFFF);
      keyLight.intensity = 2.4;
      hemiLight.color.setHex(0xFFFAF2);
      hemiLight.groundColor.setHex(0x1F241F);
      hemiLight.intensity = 1.4;
      if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x1F241F);
    }
  }, [lightingPreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1F241F); // Dark olive container background
    scene.fog = new THREE.FogExp2(0x1F241F, 0.018);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(16, 12, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4.5, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 6;
    controls.maxDistance = 38;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;

    controls.addEventListener('start', () => {
      setAutoRotate(false);
    });

    const hemiLight = new THREE.HemisphereLight(0xF6EADB, 0xD8CBB9, 1.2);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFE8D1, 2.4);
    keyLight.position.set(14, 22, 12);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 5;
      keyLight.shadow.camera.far = 45;
      const d = 14;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xD8C6AD, 1.0);
    rimLight.position.set(-14, 10, -12);
    scene.add(rimLight);

    // Warm Light Stone Ground Plaza
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xF2EAE0,
      roughness: 0.85,
      metalness: 0.08,
    });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    groundPlane.receiveShadow = !isSoftwareGl;
    scene.add(groundPlane);

    // Soft Contact shadow radial decal
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(128, 128, 20, 128, 128, 120);
      grad.addColorStop(0, 'rgba(10, 15, 10, 0.6)');
      grad.addColorStop(0.5, 'rgba(15, 20, 15, 0.3)');
      grad.addColorStop(1, 'rgba(31, 36, 31, 0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.02, 0);
    scene.add(contactShadow);

    const gridHelper = new THREE.GridHelper(30, 30, 0xD4C4B0, 0xE7DCce);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Caramel White Architectural Materials
    const warmStoneMat = new THREE.MeshStandardMaterial({
      color: 0xEEE5D8,
      roughness: 0.7,
      metalness: 0.1,
    });

    const warmSlabMat = new THREE.MeshStandardMaterial({
      color: 0xF5EDE2,
      roughness: 0.55,
      metalness: 0.15,
    });

    const caramelGoldMat = new THREE.MeshStandardMaterial({
      color: 0xC69248, // Rich caramel gold
      roughness: 0.28,
      metalness: 0.85,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xE8F0EE,
      roughness: 0.08,
      metalness: 0.18,
      transparent: true,
      opacity: 0.65,
    });

    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: 0xFFF3E0,
      emissive: 0xE8B868,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.08,
    });

    const orbGlowMat = new THREE.MeshStandardMaterial({
      color: 0xFFFDF8,
      emissive: 0xF2B958,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.1,
    });

    const buildingRoot = new THREE.Group();
    scene.add(buildingRoot);

    const floorGroups: THREE.Group[] = [];
    const floorHighlightMeshes: THREE.Mesh[] = [];
    const orbLights: THREE.PointLight[] = [];

    const floorHeight = 2.4;
    const baseWidth = 8.6;
    const baseDepth = 6.8;

    // Ground Podium Platform & Entrance Walk
    const podiumGeo = new THREE.BoxGeometry(11.2, 0.35, 9.4);
    const podiumMesh = new THREE.Mesh(podiumGeo, warmStoneMat);
    podiumMesh.position.set(0, 0.175, 0);
    podiumMesh.receiveShadow = !isSoftwareGl;
    podiumMesh.castShadow = !isSoftwareGl;
    buildingRoot.add(podiumMesh);

    // Entrance Spherical Orbs (as in reference image)
    const orbGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const orbPositions = [
      [-4.6, 0.6, 3.8],
      [4.6, 0.6, 3.8],
      [-4.2, 0.6, -3.8],
    ];
    orbPositions.forEach((pos) => {
      const orb = new THREE.Mesh(orbGeo, orbGlowMat);
      orb.position.set(pos[0], pos[1], pos[2]);
      buildingRoot.add(orb);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.35, 16), caramelGoldMat);
      stem.position.set(pos[0], pos[1] - 0.25, pos[2]);
      buildingRoot.add(stem);

      const pLight = new THREE.PointLight(0xF2B958, 1.2, 5);
      pLight.position.set(pos[0], pos[1] + 0.1, pos[2]);
      scene.add(pLight);
      orbLights.push(pLight);
    });

    // Central Structural Elevator Core
    const coreGeo = new THREE.BoxGeometry(2.4, 11.5, 2.4);
    const coreMesh = new THREE.Mesh(coreGeo, warmStoneMat);
    coreMesh.position.set(-2.8, 5.75, -1.8);
    coreMesh.castShadow = !isSoftwareGl;
    coreMesh.receiveShadow = !isSoftwareGl;
    buildingRoot.add(coreMesh);

    // Caramel gold vertical fins on core
    for (let f = 0; f < 5; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 11.2, 0.15), caramelGoldMat);
      fin.position.set(-2.8 + (f - 2) * 0.45, 5.75, -0.55);
      buildingRoot.add(fin);
    }

    // Four distinct floors creation
    for (let i = 1; i <= 4; i++) {
      const floorGroup = new THREE.Group();
      floorGroup.userData = { floorNumber: i, defaultY: (i - 1) * floorHeight + 0.35 };
      floorGroup.position.y = (i - 1) * floorHeight + 0.35;

      const fWidth = i % 2 === 0 ? baseWidth * 1.05 : baseWidth;
      const fDepth = baseDepth;

      // 1. Structural Floor Slab with beveled terrace cantilever
      const slabGeo = new THREE.BoxGeometry(fWidth, 0.28, fDepth);
      const slabMesh = new THREE.Mesh(slabGeo, warmSlabMat);
      slabMesh.position.set(0, 0.14, 0);
      slabMesh.castShadow = !isSoftwareGl;
      slabMesh.receiveShadow = !isSoftwareGl;
      floorGroup.add(slabMesh);

      // 2. Interior Core
      const interiorGeo = new THREE.BoxGeometry(fWidth - 0.9, floorHeight - 0.5, fDepth - 0.9);
      const interiorMesh = new THREE.Mesh(interiorGeo, interiorGlowMat);
      interiorMesh.position.set(0, floorHeight / 2, 0);
      floorGroup.add(interiorMesh);

      // 3. Panoramic Ribbon Glass Curtain Wall
      const glassGeo = new THREE.BoxGeometry(fWidth - 0.2, floorHeight - 0.32, fDepth - 0.2);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, floorHeight / 2, 0);
      floorGroup.add(glassMesh);

      // 4. Balcony Cantilever
      const balconyWidth = fWidth * 0.45;
      const balconyGeo = new THREE.BoxGeometry(balconyWidth, 0.16, 1.2);
      const balconyMesh = new THREE.Mesh(balconyGeo, warmStoneMat);
      balconyMesh.position.set(i % 2 === 0 ? 1.4 : -1.4, 0.1, fDepth / 2 + 0.45);
      balconyMesh.castShadow = !isSoftwareGl;
      floorGroup.add(balconyMesh);

      // Balcony Glass Railing
      const railingGeo = new THREE.BoxGeometry(balconyWidth, 0.7, 0.05);
      const railingMesh = new THREE.Mesh(railingGeo, glassMat);
      railingMesh.position.set(balconyMesh.position.x, 0.45, fDepth / 2 + 1.0);
      floorGroup.add(railingMesh);

      // Balcony Caramel Gold Top Rail
      const topRailGeo = new THREE.BoxGeometry(balconyWidth + 0.05, 0.06, 0.08);
      const topRailMesh = new THREE.Mesh(topRailGeo, caramelGoldMat);
      topRailMesh.position.set(balconyMesh.position.x, 0.82, fDepth / 2 + 1.0);
      floorGroup.add(topRailMesh);

      // Vertical Caramel Gold Brise-Soleil Louvers
      const louverCount = 4;
      for (let l = 0; l < louverCount; l++) {
        const louver = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, floorHeight - 0.35, 0.35),
          caramelGoldMat
        );
        const louverX = -fWidth / 2 + 0.6 + l * 0.45;
        louver.position.set(louverX, floorHeight / 2, fDepth / 2 + 0.05);
        floorGroup.add(louver);
      }

      // Ceiling Slab
      const ceilingSlab = new THREE.Mesh(new THREE.BoxGeometry(fWidth, 0.2, fDepth), warmSlabMat);
      ceilingSlab.position.set(0, floorHeight - 0.1, 0);
      floorGroup.add(ceilingSlab);

      // Floor Number Indicator Plate
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = 128;
      plateCanvas.height = 128;
      const pctx = plateCanvas.getContext('2d');
      if (pctx) {
        pctx.fillStyle = '#FFFFFF';
        pctx.fillRect(0, 0, 128, 128);
        pctx.strokeStyle = '#C69248';
        pctx.lineWidth = 6;
        pctx.strokeRect(6, 6, 116, 116);
        pctx.fillStyle = '#B87B2E';
        pctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
        pctx.textAlign = 'center';
        pctx.textBaseline = 'middle';
        pctx.fillText(`0${i}`, 64, 64);
      }
      const plateTex = new THREE.CanvasTexture(plateCanvas);
      plateTex.colorSpace = THREE.SRGBColorSpace;
      const plateMat = new THREE.MeshBasicMaterial({ map: plateTex, transparent: true });
      const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), plateMat);
      plateMesh.position.set(fWidth / 2 + 0.02, floorHeight / 2, 0.8);
      plateMesh.rotation.y = Math.PI / 2;
      floorGroup.add(plateMesh);

      // Floor Highlight Wireframe
      const highlightGeo = new THREE.BoxGeometry(fWidth + 0.35, floorHeight + 0.1, fDepth + 0.35);
      const highlightMat = new THREE.MeshBasicMaterial({
        color: 0xC69248,
        wireframe: true,
        transparent: true,
        opacity: 0,
      });
      const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
      highlightMesh.position.set(0, floorHeight / 2, 0);
      floorGroup.add(highlightMesh);
      floorHighlightMeshes.push(highlightMesh);

      buildingRoot.add(floorGroup);
      floorGroups.push(floorGroup);
    }

    sceneContextRef.current = {
      renderer,
      scene,
      camera,
      controls,
      floorGroups,
      floorHighlightMeshes,
      keyLight,
      hemiLight,
      groundPlane,
      orbLights,
      activeFloor: activeFloorInternal,
      exploded: explodedMode,
      autoRotate,
      isSoftwareGl,
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingRoot.children, true);

      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur && cur.parent !== buildingRoot) {
          cur = cur.parent;
        }
        if (cur && cur.userData && cur.userData.floorNumber) {
          const clickedFloor = cur.userData.floorNumber;
          setActiveFloorInternal(clickedFloor);
          if (onSelectFloor) onSelectFloor(clickedFloor);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const ctx = sceneContextRef.current;
      if (ctx) {
        controls.update();

        const targetSeparation = ctx.exploded ? 1.6 : 0;
        ctx.floorGroups.forEach((fg, idx) => {
          const defaultY = fg.userData.defaultY;
          const targetY = defaultY + idx * targetSeparation;
          fg.position.y = THREE.MathUtils.damp(fg.position.y, targetY, 4.0, dt);

          const isSelected = ctx.activeFloor === idx + 1;
          const highlightMesh = ctx.floorHighlightMeshes[idx];
          if (highlightMesh) {
            const targetOpacity = isSelected ? 0.9 : 0;
            const mat = highlightMesh.material as THREE.MeshBasicMaterial;
            mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 6.0, dt);
          }
        });

        if (ctx.activeFloor !== null) {
          const targetFloorY = (ctx.activeFloor - 1) * floorHeight + 1.8;
          _targetLookAt.set(0, targetFloorY, 0);
        } else {
          _targetLookAt.set(0, 4.5, 0);
        }

        _currentLookAt.lerp(_targetLookAt, 0.05);
        controls.target.copy(_currentLookAt);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneContextRef.current = null;
    };
  }, []);

  const handleSelectFloor = (floorNum: number | null) => {
    setActiveFloorInternal(floorNum);
    if (onSelectFloor) onSelectFloor(floorNum);
  };

  const handleResetCamera = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    handleSelectFloor(null);
    ctx.camera.position.set(16, 12, 18);
    ctx.controls.target.set(0, 4.5, 0);
    setAutoRotate(true);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-[#262C26] bg-[#1F241F] shadow-sm ${className}`}>
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: isCompact ? '320px' : '460px' }}
      />

      {/* Top Left: Architectural Spec & Live Level Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141714]/90 border border-[#242A24] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#D8B475]" />
          <span className="text-xs uppercase tracking-widest text-[#F6F3EC] font-semibold">
            {activeFloorInternal ? `Floor 0${activeFloorInternal} Focus` : 'Weena Loft — 4 Floors'}
          </span>
        </div>
        <span className="text-[11px] text-[#8E958C] pl-1 font-mono">
          Drag to orbit • Scroll to zoom • Click floor to inspect
        </span>
      </div>

      {/* Top Right: Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Auto Rotation"
          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            autoRotate
              ? 'bg-[#D4A962] border-[#D4A962] text-[#141714] font-semibold shadow-sm'
              : 'bg-[#141714]/90 border-[#242A24] text-[#8E958C] hover:text-[#F6F3EC]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Orbit</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset View"
          className="p-1.5 rounded-lg border border-[#242A24] bg-[#141714]/90 text-[#8E958C] hover:text-[#F6F3EC] shadow-sm transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Collapsible Viewport-First Bottom Control Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[820px] pointer-events-auto">
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141714]/90 border border-[#242A24] text-[11px] font-medium text-[#8E958C] hover:text-[#F6F3EC] shadow-sm transition-all"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#D8B475]" /> Show 3D Controls
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-[#D8B475]" /> Minimal View
              </>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-[#141714]/95 border border-[#242A24] shadow-xl">
            {/* Floor Selectors */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#8E958C] font-semibold mr-1 hidden md:inline">
                Floors:
              </span>
              <button
                onClick={() => handleSelectFloor(null)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  activeFloorInternal === null
                    ? 'bg-[#D4A962] text-[#141714] font-semibold shadow-sm'
                    : 'bg-[#1C201C] text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  onClick={() => handleSelectFloor(f)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    activeFloorInternal === f
                      ? 'bg-[#D4A962] text-[#141714] font-semibold shadow-sm'
                      : 'bg-[#1C201C] text-[#8E958C] hover:text-[#F6F3EC]'
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>

            {/* Exploded View & Lighting Atmosphere */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExplodedMode(!explodedMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                  explodedMode
                    ? 'bg-[#D4A962] border-[#D4A962] text-[#141714] font-semibold'
                    : 'bg-[#1C201C] border-[#2A312A] text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
                title="Separate architectural floor slabs"
              >
                <Layers className="w-3.5 h-3.5 text-[#D8B475]" />
                <span>{explodedMode ? 'Stack Floors' : 'Exploded View'}</span>
              </button>

              <div className="flex items-center p-0.5 rounded-md bg-[#1C201C] border border-[#2A312A]">
                <button
                  onClick={() => setLightingPreset('golden')}
                  title="Golden Hour Light"
                  className={`p-1.5 rounded transition-all ${
                    lightingPreset === 'golden' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLightingPreset('night')}
                  title="Nocturnal Interior Warmth"
                  className={`p-1.5 rounded transition-all ${
                    lightingPreset === 'night' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLightingPreset('day')}
                  title="Architectural Daylight"
                  className={`p-1.5 rounded transition-all ${
                    lightingPreset === 'day' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
