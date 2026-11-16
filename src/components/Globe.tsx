import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowRight, Bookmark, Compass, Pause, Play, RotateCcw } from 'lucide-react';
import { Continent, Destination } from '../types';
import { useRoamly } from '../context/RoamlyContext';
import { formatCurrency } from '../services/storage';
import { SafeImage } from './SafeImage';

interface GlobeProps {
  destinations: Destination[];
  selectedContinent: Continent | 'All';
}

interface ProjectedMarker {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
  visible: boolean;
}

const GLOBE_RADIUS = 1.65;

const CONTINENT_TARGETS: Record<Continent | 'All', { lat: number; lng: number }> = {
  All: { lat: 22, lng: 18 },
  Asia: { lat: 30, lng: 105 },
  Europe: { lat: 48, lng: 14 },
  'North America': { lat: 40, lng: -102 },
  'South America': { lat: -18, lng: -64 },
  Africa: { lat: 4, lng: 20 },
  Oceania: { lat: -26, lng: 142 },
  Antarctica: { lat: -68, lng: -60 },
};

function latLngToVector3(lat: number, lng: number, radius: number, target = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return target.set(x, y, z);
}

/**
 * Generates a high-resolution procedural stylized Earth texture with ocean gradients,
 * latitude/longitude graticules, and recognizable continental polygons (zero external 404s).
 */
function createProceduralEarthTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0B1D2C');
  oceanGrad.addColorStop(0.5, '#123247');
  oceanGrad.addColorStop(1, '#091724');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle coordinate graticule lines
  ctx.strokeStyle = 'rgba(158, 241, 233, 0.10)';
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 1024;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const drawLand = (coords: [number, number][], fill = '#1E645D', stroke = '#4FD1C5') => {
    ctx.beginPath();
    coords.forEach(([lat, lng], idx) => {
      const x = ((lng + 180) / 360) * 1024;
      const y = ((90 - lat) / 180) * 512;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  // North America
  drawLand([
    [70, -162], [71, -135], [68, -95], [62, -75], [52, -56], [44, -66],
    [35, -75], [25, -80], [29, -95], [20, -97], [15, -86], [9, -79],
    [16, -95], [23, -106], [32, -117], [48, -125], [59, -140], [63, -165],
  ]);
  // Greenland
  drawLand([
    [82, -32], [76, -18], [60, -43], [67, -54], [78, -68],
  ], '#26726A');
  // South America
  drawLand([
    [11, -74], [10, -62], [5, -52], [-5, -35], [-22, -40], [-36, -56],
    [-53, -68], [-54, -73], [-40, -73], [-20, -70], [-5, -81], [4, -77],
  ]);
  // Europe
  drawLand([
    [70, 28], [64, 24], [58, 12], [54, 18], [52, 28], [45, 36],
    [40, 26], [38, 22], [40, 16], [43, 8], [37, -8], [43, -9],
    [49, -4], [54, -2], [58, -6], [62, 5], [70, 18],
  ]);
  // Africa
  drawLand([
    [35, -6], [37, 10], [31, 32], [22, 37], [12, 51], [0, 42],
    [-16, 40], [-34, 24], [-34, 18], [-18, 12], [4, 9], [5, -8],
    [15, -17], [28, -12],
  ]);
  // Asia
  drawLand([
    [68, 40], [72, 95], [70, 145], [64, 175], [55, 160], [52, 141],
    [42, 132], [35, 129], [31, 122], [22, 114], [12, 109], [2, 103],
    [10, 98], [21, 91], [15, 80], [8, 77], [22, 69], [25, 58],
    [22, 59], [13, 45], [30, 34], [38, 28], [42, 42], [52, 50],
  ]);
  // Japan & Maritime SE Asia
  drawLand([[44, 145], [38, 141], [32, 131], [35, 136], [41, 140]]);
  drawLand([[-6, 106], [-8, 118], [-7, 114], [-6, 108]]);
  // Australia & New Zealand
  drawLand([
    [-12, 131], [-12, 142], [-24, 153], [-37, 150], [-38, 140],
    [-33, 132], [-34, 115], [-21, 115], [-15, 125],
  ]);
  drawLand([[-35, 173], [-41, 175], [-46, 167], [-43, 171]]);
  // Antarctica
  drawLand([
    [-64, -64], [-70, -40], [-72, 10], [-67, 70], [-66, 140],
    [-74, 170], [-78, -140], [-73, -95],
  ], '#8AD8D1', '#9EF1E9');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function Globe({ destinations, selectedContinent }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDestId, setSelectedDestId] = useState<string>(
    destinations[0]?.id || 'kyoto-japan',
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [projectedMarkers, setProjectedMarkers] = useState<ProjectedMarker[]>([]);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const destinationsRef = useRef(destinations);
  destinationsRef.current = destinations;

  const focusTargetRef = useRef<THREE.Vector3 | null>(null);
  const { isBookmarked, toggleBookmark, profile } = useRoamly();

  const selectedDestination = useMemo(
    () =>
      destinations.find((d) => d.id === selectedDestId) ||
      destinations[0] ||
      null,
    [destinations, selectedDestId],
  );

  // Focus camera smoothly when continent changes
  useEffect(() => {
    const coord = CONTINENT_TARGETS[selectedContinent] || CONTINENT_TARGETS.All;
    const vec = latLngToVector3(coord.lat, coord.lng, 4.35);
    focusTargetRef.current = vec;
  }, [selectedContinent]);

  // Keep selected destination synced when continent filter narrows results
  useEffect(() => {
    if (destinations.length > 0 && !destinations.some((d) => d.id === selectedDestId)) {
      setSelectedDestId(destinations[0].id);
    }
  }, [destinations, selectedDestId]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.6, 1.3, 4.1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 6.2;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.65;
    controls.autoRotate = !isSoftwareGl && autoRotateRef.current;
    controls.autoRotateSpeed = 0.45;

    controls.addEventListener('start', () => {
      focusTargetRef.current = null;
    });

    // Studio warm/cool 3-point lighting
    const hemiLight = new THREE.HemisphereLight('#9EF1E9', '#080C10', 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5EA', 1.6);
    keyLight.position.set(5, 3, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#FF7043', 0.55);
    rimLight.position.set(-4, -2, -4);
    scene.add(rimLight);

    // Earth Sphere
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const earthTexture = createProceduralEarthTexture(maxAniso);
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.12,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // Subtle atmospheric rim halo
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 48, 36);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.62, 0.945, 0.914, 1.0) * intensity * 0.65;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Subtle background starfield
    const starPositions = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      const r = 12 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: '#FCF9F3',
      size: 0.06,
      transparent: true,
      opacity: 0.55,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Clickable 3D pin beacons
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    const pinGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const pinMeshes: THREE.Mesh[] = [];

    destinationsRef.current.slice(0, 18).forEach((dest) => {
      const mat = new THREE.MeshStandardMaterial({
        color: dest.isHiddenGem ? '#9EF1E9' : '#FF7043',
        emissive: dest.isHiddenGem ? '#006A64' : '#FF7043',
        emissiveIntensity: 0.45,
        roughness: 0.3,
      });
      const pin = new THREE.Mesh(pinGeo, mat);
      latLngToVector3(dest.coordinates.lat, dest.coordinates.lng, GLOBE_RADIUS + 0.025, pin.position);
      pin.userData = { destinationId: dest.id };
      markerGroup.add(pin);
      pinMeshes.push(pin);
    });

    // Raycasting on pointer click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(pinMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.destinationId as string;
        if (hitId) {
          setSelectedDestId(hitId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Resize observer
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // Pre-allocated math helpers outside render loop (zero GC)
    const _vec = new THREE.Vector3();
    const _camDir = new THREE.Vector3();
    const _markerDir = new THREE.Vector3();
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastProjectionTime = 0;
    let disposed = false;

    const projectMarkers = () => {
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 420;
      _camDir.copy(camera.position).normalize();

      const featured = destinationsRef.current.slice(0, 12);
      const nextMarkers: ProjectedMarker[] = featured.map((dest) => {
        latLngToVector3(dest.coordinates.lat, dest.coordinates.lng, GLOBE_RADIUS + 0.04, _vec);
        _markerDir.copy(_vec).normalize();
        const facingDot = _markerDir.dot(_camDir);
        _vec.project(camera);
        return {
          id: dest.id,
          name: dest.name,
          country: dest.country,
          x: ((_vec.x + 1) / 2) * w,
          y: ((-_vec.y + 1) / 2) * h,
          visible: facingDot > 0.16 && _vec.z < 1,
        };
      });
      setProjectedMarkers(nextMarkers);
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      controls.autoRotate = !isSoftwareGl && autoRotateRef.current && !focusTargetRef.current;

      if (focusTargetRef.current) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, focusTargetRef.current.x, 4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, focusTargetRef.current.y, 4, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, focusTargetRef.current.z, 4, delta);
        if (camera.position.distanceTo(focusTargetRef.current) < 0.05) {
          focusTargetRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (elapsed - lastProjectionTime > 0.04) {
        lastProjectionTime = elapsed;
        projectMarkers();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    projectMarkers();
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      earthTexture.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      pinGeo.dispose();
      pinMeshes.forEach((m) => (m.material as THREE.Material).dispose());
      renderer.dispose();
    };
  }, []);

  const focusDestinationOnGlobe = (dest: Destination) => {
    setSelectedDestId(dest.id);
    focusTargetRef.current = latLngToVector3(dest.coordinates.lat, dest.coordinates.lng, 4.1);
  };

  return (
    <section
      aria-label="Interactive 3D Earth Discovery Globe"
      className="relative rounded-3xl bg-[#080C10] text-white overflow-hidden border border-[#172B3A]/20 shadow-lg"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* 3D Canvas Viewport */}
        <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] bg-gradient-to-b from-[#0A131C] via-[#080C10] to-[#0D1E2B]">
          {webglUnavailable ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-10 h-10 text-[#9EF1E9] mb-3" />
              <p className="font-display text-lg font-semibold">Interactive Destination Pins</p>
              <p className="mt-1 text-xs text-white/65 max-w-sm">
                Select any destination below to inspect coordinates and open its full guide.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                {destinations.slice(0, 8).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDestId(d.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                      selectedDestId === d.id
                        ? 'bg-[#FF7043] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div ref={containerRef} className="w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] cursor-grab active:cursor-grabbing" />

              {/* Floating Semantic DOM Destination Markers */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {projectedMarkers.map((m) =>
                  m.visible ? (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        const found = destinations.find((d) => d.id === m.id);
                        if (found) focusDestinationOnGlobe(found);
                      }}
                      style={{
                        transform: `translate(${m.x}px, ${m.y}px) translate(-50%, -120%)`,
                      }}
                      className={`pointer-events-auto absolute top-0 left-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer shadow-md ${
                        selectedDestId === m.id
                          ? 'bg-[#FF7043] text-white ring-2 ring-white/80 z-20'
                          : 'bg-[#080C10]/85 text-[#FCF9F3] border border-white/15 hover:bg-[#172B3A] z-10'
                      }`}
                    >
                      {m.name}
                    </button>
                  ) : null,
                )}
              </div>
            </>
          )}

          {/* Top-left subtle globe hint & controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-[#080C10]/75 border border-white/10 text-[11px] text-white/85 pointer-events-auto">
              Drag to rotate · Click any marker
            </div>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                aria-label={autoRotate ? 'Pause globe rotation' : 'Resume globe rotation'}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#080C10]/80 border border-white/15 text-white hover:bg-[#172B3A] transition-colors cursor-pointer"
              >
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  focusTargetRef.current = latLngToVector3(22, 18, 4.35);
                }}
                aria-label="Reset globe view"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#080C10]/80 border border-white/15 text-white hover:bg-[#172B3A] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Destination Spotlight Panel */}
        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-[#101A24] border-t lg:border-t-0 lg:border-l border-white/10">
          {selectedDestination ? (
            <>
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#9EF1E9] mb-2">
                  <span>
                    {selectedDestination.continent} · {selectedDestination.category}
                  </span>
                  <span className="tabular-nums text-white/60">
                    {selectedDestination.coordinates.lat.toFixed(1)}°,{' '}
                    {selectedDestination.coordinates.lng.toFixed(1)}°
                  </span>
                </div>

                <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <SafeImage
                    src={selectedDestination.heroImage}
                    alt={`${selectedDestination.name}, ${selectedDestination.country}`}
                    fallbackTitle={selectedDestination.name}
                    className="w-full h-full"
                  />
                </div>

                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {selectedDestination.name}
                </h2>
                <p className="text-xs text-white/65 mt-0.5">
                  {selectedDestination.city}, {selectedDestination.country}
                </p>
                <p className="mt-2.5 text-sm text-white/80 leading-relaxed line-clamp-3">
                  {selectedDestination.tagline}. {selectedDestination.description}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-white/50">Est. Daily</p>
                    <p className="font-semibold text-[#9EF1E9] tabular-nums mt-0.5">
                      {formatCurrency(selectedDestination.dailyBudgetUsd, profile.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Duration</p>
                    <p className="font-semibold text-white mt-0.5">
                      {selectedDestination.recommendedDuration}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Best Season</p>
                    <p className="font-semibold text-white truncate mt-0.5">
                      {selectedDestination.bestSeason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2.5">
                <Link
                  to={`/destination/${selectedDestination.id}`}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FF7043] text-white text-sm font-semibold hover:bg-[#e85d31] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>Explore {selectedDestination.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    toggleBookmark(selectedDestination.id, selectedDestination.name)
                  }
                  aria-label={
                    isBookmarked(selectedDestination.id)
                      ? 'Remove from wishlist'
                      : 'Save to wishlist'
                  }
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked(selectedDestination.id)
                      ? 'bg-[#9EF1E9] text-[#080C10] border-[#9EF1E9]'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark
                    className={`w-4.5 h-4.5 ${
                      isBookmarked(selectedDestination.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
