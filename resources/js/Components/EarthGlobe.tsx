import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Create a more subtle glow texture by reducing opacity values
const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
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
  rotationSpeed = 0.005, // slower rotation for a cleaner look
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

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
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
    camera.position.z = 3;
    camera.position.y = 1.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const earthGroup = new THREE.Group();
    earthRef.current = earthGroup;
    scene.add(earthGroup);

    let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.ShaderMaterial>;

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      '/images/earth_8k.jpg',
      () => {
        const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({
          map: earthTexture,
          transparent: true,
          opacity: 1,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earthMesh);

        // Updated shader for a subtle animated wireframe
        const wireMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(meshColor) },
            time: { value: 0 },
          },
          vertexShader: `
            uniform float time;
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              // Reduced displacement for a cleaner effect
              vec3 transformed = position + normal * sin(time + position.y * 10.0) * 0.05;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            varying vec3 vPosition;
            void main() {
              float intensity = 0.8 - length(vPosition) * 0.3;
              gl_FragColor = vec4(color * intensity, 1.0);
            }
          `,
          transparent: true,
        });

        const wireGeometry = new THREE.SphereGeometry(2.05, 24, 24);
        wireframe = new THREE.LineSegments(
          new THREE.WireframeGeometry(wireGeometry),
          wireMaterial
        );
        wireframe.userData.outline = true;
        earthGroup.add(wireframe);

        // Create a glow material with a more subtle look
        const createGlowMaterial = (color: string) => {
          return new THREE.SpriteMaterial({
            map: createGlowTexture(),
            color: color,
            transparent: true,
            blending: THREE.NormalBlending, // using normal blending for a cleaner appearance
            opacity: 0.2,
          });
        };

        // Optionally reduce or remove glowing vertices for a modern minimalist style
        createShiningVertices(wireGeometry, createGlowMaterial);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const animate = () => {
      timeRef.current += 0.01;

      if (earthRef.current) {
        earthRef.current.rotation.y += rotationSpeed;
      }

      verticesRef.current.forEach((vertex) => {
        if (vertex.active && timeRef.current > vertex.delay) {
          const intensity = Math.sin((timeRef.current - vertex.delay) * vertex.speed) * 0.5 + 0.5;
          if (intensity > 0) {
            (vertex.mesh.material as THREE.SpriteMaterial).opacity = intensity * 0.2;
            vertex.mesh.scale.set(1 + intensity * 0.2, 1 + intensity * 0.2, 1);
          } else {
            vertex.delay = timeRef.current + Math.random() * 10;
            vertex.speed = 0.2 + Math.random() * 0.5;
          }
        }
      });

      if (wireframe && wireframe.material instanceof THREE.ShaderMaterial) {
        wireframe.material.uniforms.time.value = timeRef.current;
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    const createShiningVertices = (
      wireGeometry: THREE.SphereGeometry,
      createGlowMaterial: (color: string) => THREE.SpriteMaterial
    ) => {
      const positionAttribute = wireGeometry.getAttribute('position');
      const vertices = new Set<string>();

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = parseFloat(positionAttribute.getX(i).toFixed(2));
        const y = parseFloat(positionAttribute.getY(i).toFixed(2));
        const z = parseFloat(positionAttribute.getZ(i).toFixed(2));
        vertices.add(`${x},${y},${z}`);
      }

      const totalVertices = Array.from(vertices).length;
      const numVerticesToIlluminate = Math.floor(totalVertices / vertexDensity);

      Array.from(vertices)
        .sort(() => Math.random() - 0.05)
        .slice(0, numVerticesToIlluminate)
        .forEach(vertexStr => {
          const [x, y, z] = vertexStr.split(',').map(parseFloat);
          const position = new THREE.Vector3(x, y, z);

          const vertexMesh = new THREE.Sprite(createGlowMaterial(vertexGlowColor));
          vertexMesh.position.copy(position);
          vertexMesh.scale.set(0.01, 0.01, 0.01);
          earthGroup.add(vertexMesh);

          verticesRef.current.push({
            point: position,
            mesh: vertexMesh,
            speed: 0.2 + Math.random() * 0.5,
            delay: Math.random() * 10,
            active: true,
          });
        });
    };

    animate();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
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
        ...style,
      }}
    />
  );
};

export default EarthGlobe;
