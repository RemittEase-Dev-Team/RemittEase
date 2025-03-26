import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

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
  gradientBackground = 'linear-gradient(to bottom, rgba(0, 0, 50, 1), rgba(0, 0, 100, 1))',
  rotationSpeed = 0.005,
  meshColor = '0x00ffff',
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(meshColor), 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(wireframe);

    const glowGeometry = new THREE.IcosahedronGeometry(1.1, 10);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(meshColor),
      transparent: true,
      opacity: 0.2
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    camera.position.z = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      wireframe.rotation.y += rotationSpeed;
      glowMesh.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [rotationSpeed, meshColor]);

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
