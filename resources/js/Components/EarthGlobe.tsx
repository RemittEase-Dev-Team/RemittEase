import React from 'react';

interface EarthVideoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const EarthVideo: React.FC<EarthVideoProps> = ({
  width = '100%',
  height = '100%',
  className = '',
  style = {},
}) => {
  return (
    <div 
      className={className}
      style={{
        width,
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
    >
      <video 
        width="100%" 
        height="100%" 
        autoPlay 
        loop 
        muted 
        playsInline
        style={{ 
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      >
        <source 
          src="/images/3d-animation-of-planet-earth-rotating-in-global-futuristic-cyber-network-with--SBV-324901182-preview.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default EarthVideo;
