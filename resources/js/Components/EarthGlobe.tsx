import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Define createGlowTexture at the top level
const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Create radial gradient for star glow
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
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
  rotationSpeed = 0.010,
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
  const verticesRef = useRef<{ point: THREE.Vector3, mesh: THREE.Sprite, speed: number, delay: number, active: boolean }[]>([]);
  const timeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Initial update
    updateDimensions();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize and animate Three.js scene
  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    // Scene with transparent background
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, dimensions.width / dimensions.height, 0.2, 900);
    camera.position.z = 3;
    camera.position.y = 1.5;
    cameraRef.current = camera;

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Earth group
    const earthGroup = new THREE.Group();
    earthRef.current = earthGroup;
    scene.add(earthGroup);

    // Declare wireframe here
    let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.ShaderMaterial>;

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      '/images/earth_8k.jpg',
      () => {
        // Create Earth sphere
        const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({
          map: earthTexture,
          transparent: true,
          opacity: 1,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earthMesh);

        // Create wireframe mesh with shader material
        const wireMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(meshColor) },
            time: { value: 0 }
          },
          vertexShader: `
            uniform float time;
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              vec3 transformed = position + normal * sin(time + position.y * 10.0) * 0.1;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            varying vec3 vPosition;
            void main() {
              float intensity = 1.0 - length(vPosition) * 0.5;
              gl_FragColor = vec4(color * intensity, 1.0);
            }
          `,
          transparent: true
        });

        const wireGeometry = new THREE.SphereGeometry(2.05, 24, 24);
        wireframe = new THREE.LineSegments(
          new THREE.WireframeGeometry(wireGeometry),
          wireMaterial
        );
        wireframe.userData.outline = true;
        earthGroup.add(wireframe);

        const createGlowMaterial = (color: string) => {
          return new THREE.SpriteMaterial({
            map: createGlowTexture(),
            color: color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 1.0
          });
        };

        // Create shining vertices
        createShiningVertices(wireGeometry);
      }
    );

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      timeRef.current += 0.01;

      if (earthRef.current) {
        earthRef.current.rotation.y += rotationSpeed;
      }

      // Update vertex animations
      verticesRef.current.forEach((vertex) => {
        if (vertex.active && timeRef.current > vertex.delay) {
          // Make vertex glow and fade
          const intensity = Math.sin((timeRef.current - vertex.delay) * vertex.speed) * 0.5 + 0.5;
          if (intensity > 0) {
            (vertex.mesh.material as THREE.SpriteMaterial).opacity = intensity;
            vertex.mesh.scale.set(1 + intensity * 0.5, 1 + intensity * 0.5, 1);
          } else {
            // Reset with new random delay
            vertex.delay = timeRef.current + Math.random() * 10;
            vertex.speed = 0.2 + Math.random() * 0.5;
          }
        }
      });

      // Check if wireframe is defined before updating shader time
      if (wireframe && wireframe.material instanceof THREE.ShaderMaterial) {
        wireframe.material.uniforms.time.value = timeRef.current;
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    const createShiningVertices = (wireGeometry: THREE.SphereGeometry) => {
      // Extract vertices from geometry
      const positionAttribute = wireGeometry.getAttribute('position');
      const vertices = new Set<string>();

      // Get unique vertices
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = parseFloat(positionAttribute.getX(i).toFixed(2));
        const y = parseFloat(positionAttribute.getY(i).toFixed(2));
        const z = parseFloat(positionAttribute.getZ(i).toFixed(2));
        vertices.add(`${x},${y},${z}`);
      }

      // Create glowing points at random vertices
      const totalVertices = Array.from(vertices).length;
      const numVerticesToIlluminate = Math.floor(totalVertices / vertexDensity);

      Array.from(vertices)
        .sort(() => Math.random() - 0.05)
        .slice(0, numVerticesToIlluminate)
        .forEach(vertexStr => {
          const [x, y, z] = vertexStr.split(',').map(parseFloat);
          const position = new THREE.Vector3(x, y, z);

          // Create glowing vertex
          const vertexGeometry = new THREE.SphereGeometry(0.05, 1, 1);
          const vertexMaterial = new THREE.SpriteMaterial({
            map: createGlowTexture(),
            color: vertexGlowColor,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
          });

          const vertexMesh = new THREE.Sprite(vertexMaterial);
          vertexMesh.position.copy(position);
          vertexMesh.scale.set(0.01, 0.001, 0.001);
          earthGroup.add(vertexMesh);

          // Store vertex data for animation
          verticesRef.current.push({
            point: position,
            mesh: vertexMesh,
            speed: 0.2 + Math.random() * 0.5,
            delay: Math.random() * 10,
            active: true
          });
        });
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose resources
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();

            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            }
          }
        });
      }
    };
  }, [dimensions, meshColor, vertexGlowColor, vertexDensity, rotationSpeed]);

  // Handle camera aspect ratio update when dimensions change
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
