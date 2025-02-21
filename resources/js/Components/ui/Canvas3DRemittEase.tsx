import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Canvas3DRemittEase: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Earth Geometry and Material
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/images/earth.png'); // Replace with your Earth texture
    const material = new THREE.MeshPhongMaterial({ map: earthTexture });
    const earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    // Shining Dots
    const dotGeometry = new THREE.BufferGeometry();
    const dotMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dots);

    // Randomize Dot Positions
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
      const vertex = new THREE.Vector3();
      vertex.x = (Math.random() - 0.5) * 10;
      vertex.y = (Math.random() - 0.5) * 10;
      vertex.z = (Math.random() - 0.5) * 10;
      vertices.push(vertex.x, vertex.y, vertex.z);
    }
    dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Camera Position
    camera.position.z = 15;

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate Earth
      earthMesh.rotation.y += 0.005;

      // Randomly Shine Dots
      const positions = dotGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        if (Math.random() < 0.01) {
          positions[i] += (Math.random() - 0.5) * 0.1;
          positions[i + 1] += (Math.random() - 0.5) * 0.1;
          positions[i + 2] += (Math.random() - 0.5) * 0.1;
        }
      }
      dotGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);


  return (
    <canvas
      id="earth"
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        touchAction: 'manipulation',
      }}
    />
  );
};

export default Canvas3DRemittEase;
