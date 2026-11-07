import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LandParcel } from './land';
import {
  Compass,
  Layers,
  Eye,
  Sun,
  Maximize2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface Land3DSceneProps {
  parcel: LandParcel;
}

export const Land3DScene: React.FC<Land3DSceneProps> = ({ parcel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [elevationExaggeration, setElevationExaggeration] = useState(1.5);
  const [showContours, setShowContours] = useState(true);
  const [showFarmStructures, setShowFarmStructures] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'golden'>('noon');
  const [viewPreset, setViewPreset] = useState<'orbit' | 'top' | 'field'>('orbit');

  const controlsRef = useRef<OrbitControls | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const farmGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce7e1);
    scene.fog = new THREE.FogExp2(0xdce7e1, 0.008);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(40, 32, 50);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment reflection using RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 10;
    controls.maxDistance = 140;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xebf4ff, 0x516450, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff6e3, 1.8);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Procedural Terrain Texture with agricultural soil patterns
    const createTerrainTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Base soil gradient (chernozem / rich loamy soil of KBR)
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#36402e');
      grad.addColorStop(0.5, '#424f38');
      grad.addColorStop(1, '#2f3827');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Procedural field furrows / row patterns
      ctx.strokeStyle = 'rgba(78, 92, 65, 0.25)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 512; i += 16) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Contour elevation lines
      ctx.strokeStyle = 'rgba(215, 230, 195, 0.4)';
      ctx.lineWidth = 1.5;
      for (let r = 40; r < 360; r += 50) {
        ctx.beginPath();
        ctx.arc(256, 256, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      return texture;
    };

    // Terrain Geometry: Digital Elevation Model (DEM)
    const gridSize = 64;
    const terrainGeo = new THREE.PlaneGeometry(60, 60, gridSize, gridSize);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    // Slope calculation according to parcel relief type
    const slopeMultiplier =
      parcel.utilities.reliefType === 'Горно-долинный'
        ? 0.18
        : parcel.utilities.reliefType === 'Предгорный (3-8°)'
        ? 0.12
        : parcel.utilities.reliefType === 'Слабопокатый (1-3°)'
        ? 0.05
        : 0.02;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Natural gentle mountain terrain undulation + terrace
      const elevation =
        (Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3 +
          Math.sin(x * 0.03 + z * 0.04) * 5 +
          (x + z) * slopeMultiplier) *
        elevationExaggeration;
      pos.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: createTerrainTexture(),
      roughness: 0.85,
      metalness: 0.1,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = !isSoftwareGl;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Cadastral Boundary Line (High-visibility surveyor boundary)
    const boundaryPoints = [
      new THREE.Vector3(-26, 0.3, -26),
      new THREE.Vector3(26, 0.3, -26),
      new THREE.Vector3(26, 0.3, 26),
      new THREE.Vector3(-26, 0.3, 26),
      new THREE.Vector3(-26, 0.3, -26),
    ];
    // Project points to terrain height
    const getTerrainHeight = (x: number, z: number) => {
      return (
        (Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3 +
          Math.sin(x * 0.03 + z * 0.04) * 5 +
          (x + z) * slopeMultiplier) *
        elevationExaggeration
      );
    };

    boundaryPoints.forEach((p) => {
      p.y = getTerrainHeight(p.x, p.z) + 0.35;
    });

    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({
      color: 0x00e676,
      linewidth: 3,
    });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    scene.add(boundaryLine);

    // ==========================================
    // Composite Procedural Farm Structures Group
    // ==========================================
    const farmGroup = new THREE.Group();

    // 1. Boundary Surveyor Boundary Stones (4 corners) - 3-part composite model
    boundaryPoints.slice(0, 4).forEach((pt) => {
      const markerGroup = new THREE.Group();
      // Part 1: Concrete survey monolith
      const stoneGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0xbdbdbd,
        roughness: 0.9,
        metalness: 0.05,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.y = 0.6;
      stone.castShadow = !isSoftwareGl;
      markerGroup.add(stone);

      // Part 2: Official Cadastral Marker Pin (Bronze/Brass)
      const pinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.9,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = 1.3;
      markerGroup.add(pin);

      // Part 3: Red-White Surveyor Pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xff1744,
        roughness: 0.5,
        metalness: 0.2,
      });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.0;
      markerGroup.add(pole);

      markerGroup.position.set(pt.x, pt.y, pt.z);
      farmGroup.add(markerGroup);
    });

    // 2. High-Tech Greenhouse Complex (Composite 6-part procedural model)
    const createGreenhouse = (x: number, z: number) => {
      const gh = new THREE.Group();
      const gy = getTerrainHeight(x, z);

      // Part 1: Concrete perimeter footing
      const baseGeo = new THREE.BoxGeometry(14, 0.6, 7);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x9e9e9e,
        roughness: 0.85,
        metalness: 0.1,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.3;
      base.receiveShadow = !isSoftwareGl;
      gh.add(base);

      // Part 2: Galvanized Steel Truss Frame
      const frameGeo = new THREE.BoxGeometry(13.6, 3.2, 6.6);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x546e7a,
        roughness: 0.3,
        metalness: 0.85,
        wireframe: true,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = 1.9;
      gh.add(frame);

      // Part 3: Translucent Polycarbonate Glass Walls
      const glassGeo = new THREE.BoxGeometry(13.5, 3.0, 6.5);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f7fa,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.55,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 1.9;
      gh.add(glass);

      // Part 4: Arched Gable Polycarbonate Roof
      const roofGeo = new THREE.CylinderGeometry(3.6, 3.6, 13.5, 16, 1, false, 0, Math.PI);
      roofGeo.rotateZ(Math.PI / 2);
      const roof = new THREE.Mesh(roofGeo, glassMat);
      roof.position.y = 3.4;
      gh.add(roof);

      // Part 5: Roof ridge vent ventilator
      const ventGeo = new THREE.BoxGeometry(13.0, 0.4, 0.8);
      const ventMat = new THREE.MeshStandardMaterial({
        color: 0x37474f,
        roughness: 0.4,
        metalness: 0.8,
      });
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.y = 5.3;
      gh.add(vent);

      // Part 6: Entrance doorway with ramp
      const doorGeo = new THREE.BoxGeometry(1.6, 2.4, 0.2);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x263238,
        roughness: 0.5,
        metalness: 0.7,
      });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.5, 3.3);
      gh.add(door);

      gh.position.set(x, gy, z);
      return gh;
    };

    farmGroup.add(createGreenhouse(-14, 8));

    // 3. Apple Orchard Trellis Rows (Instanced procedural trees & wires)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x4e3629,
      roughness: 0.9,
      metalness: 0.05,
    });

    const foliageGeo = new THREE.SphereGeometry(1.2, 10, 8);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.7,
      metalness: 0.05,
    });

    // Apple fruits (small accents)
    const fruitGeo = new THREE.SphereGeometry(0.2, 6, 6);
    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xd50000,
      roughness: 0.3,
      metalness: 0.1,
    });

    const trellisPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6);
    const trellisPostMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.8,
    });

    for (let row = 0; row < 5; row++) {
      const rz = -18 + row * 4.5;
      // Trellis support posts at ends
      [-18, 0, 18].forEach((rx) => {
        const ry = getTerrainHeight(rx, rz);
        const post = new THREE.Mesh(trellisPostGeo, trellisPostMat);
        post.position.set(rx, ry + 1.7, rz);
        post.castShadow = !isSoftwareGl;
        farmGroup.add(post);
      });

      // Trees along row
      for (let tx = -16; tx <= 16; tx += 3.2) {
        const treeGroup = new THREE.Group();
        const ty = getTerrainHeight(tx, rz);

        const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
        trunk.position.y = 1.1;
        trunk.castShadow = !isSoftwareGl;
        treeGroup.add(trunk);

        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 2.4;
        foliage.scale.set(0.9 + Math.random() * 0.2, 1.2, 0.8);
        foliage.castShadow = !isSoftwareGl;
        treeGroup.add(foliage);

        // Apples
        const fruit = new THREE.Mesh(fruitGeo, fruitMat);
        fruit.position.set(0.6, 2.2, 0.5);
        treeGroup.add(fruit);

        treeGroup.position.set(tx, ty, rz);
        farmGroup.add(treeGroup);
      }
    }

    // 4. Irrigation Pump Station & Water Tank (Composite 5-part procedural model)
    const pumpGroup = new THREE.Group();
    const px = 15;
    const pz = 12;
    const py = getTerrainHeight(px, pz);

    // Part 1: Cylindrical corrugated water reservoir tank
    const tankGeo = new THREE.CylinderGeometry(2.8, 2.8, 4.2, 24);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0288d1,
      roughness: 0.35,
      metalness: 0.7,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 2.1;
    tank.castShadow = !isSoftwareGl;
    pumpGroup.add(tank);

    // Part 2: Conical tank roof
    const tankRoofGeo = new THREE.ConeGeometry(3.1, 1.0, 24);
    const tankRoofMat = new THREE.MeshStandardMaterial({
      color: 0x01579b,
      roughness: 0.4,
      metalness: 0.6,
    });
    const tankRoof = new THREE.Mesh(tankRoofGeo, tankRoofMat);
    tankRoof.position.y = 4.7;
    pumpGroup.add(tankRoof);

    // Part 3: Automated pump housing shed
    const shedGeo = new THREE.BoxGeometry(2.4, 2.0, 2.0);
    const shedMat = new THREE.MeshStandardMaterial({
      color: 0xeceff1,
      roughness: 0.5,
      metalness: 0.3,
    });
    const shed = new THREE.Mesh(shedGeo, shedMat);
    shed.position.set(3.2, 1.0, 0);
    shed.castShadow = !isSoftwareGl;
    pumpGroup.add(shed);

    // Part 4: Connecting manifold pipes & pressure valve
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      roughness: 0.2,
      metalness: 0.9,
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(1.6, 0.8, 0);
    pumpGroup.add(pipe);

    // Part 5: Solar power panel powering the pump
    const solarGeo = new THREE.BoxGeometry(2.5, 0.1, 1.5);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1a237e,
      roughness: 0.15,
      metalness: 0.9,
    });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.rotation.x = 0.4;
    solar.position.set(3.2, 2.4, 0);
    pumpGroup.add(solar);

    pumpGroup.position.set(px, py, pz);
    farmGroup.add(pumpGroup);

    scene.add(farmGroup);
    farmGroupRef.current = farmGroup;

    // Render Request helper (On-demand rendering with software-GL guard)
    let renderBusy = false;
    let renderDirty = false;
    let frameId = 0;

    const requestRender = () => {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        renderBusy = false;
        if (renderDirty) requestRender();
      });
    };
    requestRenderRef.current = requestRender;

    controls.addEventListener('change', requestRender);

    // Initial render
    requestRender();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [parcel]);

  // Handle Dynamic Visual Properties
  useEffect(() => {
    if (farmGroupRef.current) {
      farmGroupRef.current.visible = showFarmStructures;
    }
    if (terrainMeshRef.current) {
      terrainMeshRef.current.visible = showContours || true;
    }
    if (dirLightRef.current && hemiLightRef.current) {
      if (timeOfDay === 'morning') {
        dirLightRef.current.position.set(-45, 30, -35);
        dirLightRef.current.color.setHex(0xffe0b2);
        dirLightRef.current.intensity = 1.6;
        hemiLightRef.current.color.setHex(0xffecb3);
      } else if (timeOfDay === 'noon') {
        dirLightRef.current.position.set(20, 55, 20);
        dirLightRef.current.color.setHex(0xfff8e1);
        dirLightRef.current.intensity = 2.0;
        hemiLightRef.current.color.setHex(0xebf4ff);
      } else {
        // Golden hour / sunset over Caucasus
        dirLightRef.current.position.set(45, 18, 40);
        dirLightRef.current.color.setHex(0xff8a65);
        dirLightRef.current.intensity = 1.9;
        hemiLightRef.current.color.setHex(0xffccbc);
      }
    }
    requestRenderRef.current?.();
  }, [showFarmStructures, showContours, timeOfDay]);

  // Handle Camera View Presets
  const handleViewPreset = (preset: 'orbit' | 'top' | 'field') => {
    setViewPreset(preset);
    const controls = controlsRef.current;
    if (!controls) return;

    if (preset === 'top') {
      controls.object.position.set(0, 75, 0);
      controls.target.set(0, 0, 0);
    } else if (preset === 'field') {
      controls.object.position.set(0, 6, 28);
      controls.target.set(0, 2, 0);
    } else {
      controls.object.position.set(40, 32, 50);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    requestRenderRef.current?.();
  };

  return (
    <div className="relative w-full h-[480px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge with Elevation & Cadastral Info */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 shadow-md z-10 pointer-events-none">
        <Compass className="w-4 h-4 text-emerald-400" />
        <div>
          <span className="font-semibold text-emerald-300">
            {parcel.cadastralNumber}
          </span>
          <span className="mx-1.5 text-slate-500">•</span>
          <span className="text-slate-300">
            H: {parcel.utilities.elevationMeters} м БС • {parcel.utilities.reliefType}
          </span>
        </div>
      </div>

      {/* Quick View Camera Presets (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700 p-1 rounded-lg z-10">
        <button
          onClick={() => handleViewPreset('orbit')}
          className={`px-2 py-1 text-xs rounded font-medium transition ${
            viewPreset === 'orbit'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Перспективный 3D обзор"
        >
          3D
        </button>
        <button
          onClick={() => handleViewPreset('top')}
          className={`px-2 py-1 text-xs rounded font-medium transition ${
            viewPreset === 'top'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Вид сверху (План территории)"
        >
          План
        </button>
        <button
          onClick={() => handleViewPreset('field')}
          className={`px-2 py-1 text-xs rounded font-medium transition ${
            viewPreset === 'field'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="С уровня земли (Взгляд фермера)"
        >
          Поле
        </button>
      </div>

      {/* Unified Bottom Control Dock (Compliant with Three.js Skill layout) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[760px] bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl transition-all duration-300 z-20 ${
          isDockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab Button */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="w-full h-7 flex items-center justify-center space-x-1.5 text-[11px] font-medium text-slate-400 hover:text-emerald-400 border-b border-slate-800 transition bg-slate-800/40 rounded-t-xl"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Панель 3D-моделирования (Развернуть)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Свернуть панель</span>
            </>
          )}
        </button>

        {/* Controls Content */}
        <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-200">
          {/* 1. Agro Objects & Layers */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Объекты хозяйства</span>
            </span>
            <div className="flex flex-col space-y-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFarmStructures}
                  onChange={(e) => setShowFarmStructures(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>Сады, теплицы, насосная</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => setShowContours(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>Горизонтали рельефа</span>
              </label>
            </div>
          </div>

          {/* 2. Solar Lighting Angle (KBR Mountain Sun) */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Инсоляция & Тени</span>
            </span>
            <div className="flex items-center space-x-1">
              {(['morning', 'noon', 'golden'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeOfDay(mode)}
                  className={`flex-1 py-1 px-1.5 text-[11px] rounded transition ${
                    timeOfDay === mode
                      ? 'bg-amber-600 text-white font-medium'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mode === 'morning' ? 'Утро' : mode === 'noon' ? 'Полдень' : 'Закат'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Cadastral Boundary Info */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Границы & Площадь
            </span>
            <div className="text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>Площадь:</span>
                <span className="font-semibold text-emerald-400">
                  {parcel.areaHa} га
                </span>
              </div>
              <div className="flex justify-between">
                <span>Уклон поля:</span>
                <span>{parcel.utilities.reliefType}</span>
              </div>
              <div className="flex justify-between">
                <span>Периметр:</span>
                <span>
                  ~{Math.round(4 * Math.sqrt(parcel.areaHa * 10000))} м
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
