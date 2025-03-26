import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
};

interface EarthGlobeProps {
  width?: number | string;
  height?: number | string;
  gradientBackground?: string;
  rotationSpeed?: number;
  meshColor?: string;
  vertexGlowColor?: string;
  vertexDensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const EarthGlobe: React.FC<EarthGlobeProps> = ({
  width = '100%',
  height = '100%',
  gradientBackground = 'linear-gradient(to bottom, rgba(0, 115, 255, 0), rgba(247, 220, 111, 0))',
  rotationSpeed = 0.005,
  meshColor = '#DAA520',
  vertexGlowColor = '#ffffff',
  vertexDensity = 2,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Memoize glow texture to prevent recreation
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, dimensions.width / dimensions.height, 0.2, 900);
    camera.position.set(0, 1.5, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const earthGroup = new THREE.Group();
    earthRef.current = earthGroup;
    scene.add(earthGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/earth_8k.jpg',
      (earthTexture) => {
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
        const earthMaterial = new THREE.MeshBasicMaterial({
          map: earthTexture,
          transparent: true,
          opacity: 1,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earthMesh);

        const wireGeometry = new THREE.WireframeGeometry(earthGeometry);
        const wireMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(meshColor),
          transparent: true,
          opacity: 0.3
        });
        const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
        earthGroup.add(wireframe);

        // Simplified vertex creation
        const positions = earthGeometry.getAttribute('position');
        const vertices: THREE.Sprite[] = [];

        for (let i = 0; i < positions.count; i += vertexDensity) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);

          const vertexMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: vertexGlowColor,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
          });

          const vertexMesh = new THREE.Sprite(vertexMaterial);
          vertexMesh.position.set(x, y, z).normalize().multiplyScalar(2.1);
          vertexMesh.scale.set(0.05, 0.05, 0.05);
          earthGroup.add(vertexMesh);
          vertices.push(vertexMesh);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        let time = 0;
        const animate = () => {
          time += 0.01;
          
          if (earthGroup) {
            earthGroup.rotation.y += rotationSpeed;
          }

          // Animate vertices
          vertices.forEach((vertex, index) => {
            const scale = Math.sin(time * (1 + index * 0.1)) * 0.5 + 1;
            vertex.scale.set(0.05 * scale, 0.05 * scale, 0.05 * scale);
            vertex.material.opacity = Math.abs(Math.sin(time * (1 + index * 0.1))) * 0.5;
          });

          renderer.render(scene, camera);
          frameIdRef.current = requestAnimationFrame(animate);
        };

        animate();
      }
    );

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [dimensions, meshColor, vertexGlowColor, vertexDensity, rotationSpeed, glowTexture]);

  useEffect(() => {
    if (!cameraRef.current || !rendererRef.current || dimensions.width === 0) return;

    cameraRef.current.aspect = dimensions.width / dimensions.height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(dimensions.width, dimensions.height);
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        background: gradientBackground,
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
    />
  );
};

export default EarthGlobe;
