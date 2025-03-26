import React from 'react';

interface EarthGlobeProps {
  width?: number | string;
  height?: number | string;
  videoSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}

const EarthGlobe: React.FC<EarthGlobeProps> = ({
  width = '100%',
  height = '100%',
  videoSrc = '/images/3d-animation-of-planet-earth-rotating-in-global-futuristic-cyber-network-with--SBV-324901182-preview.mp4',
  className = '',
  style = {},
}) => {
  return (
    <video
      className={className}
      style={{
        width,
        height,
        objectFit: 'cover',
        ...style,
      }}
      autoPlay
      loop
      muted
      playsInline
    >
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default EarthGlobe;
