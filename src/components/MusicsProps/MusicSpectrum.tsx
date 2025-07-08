import React, { useRef} from 'react';

interface MusicSpectrumProps {
  progress: number;
  onSeek?: (progress: number) => void;
  disabled?: boolean;
}

const MusicSpectrum: React.FC<MusicSpectrumProps> = ({ 
  progress, 
  onSeek, 
  disabled = false 
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || disabled) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const newProgress = ((e.clientX - rect.left) / rect.width) * 100;
    if (onSeek) {
      onSeek(Math.max(0, Math.min(newProgress, 100))); // clamp between 0 and 100
    }
  };

  return (
    <div
      ref={progressBarRef}
      onMouseDown={handleDrag}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleDrag(e); // Only drag while mouse is held
      }}
      style={{
        position: 'relative',
        height: '10px',
        backgroundColor: '#444',
        borderRadius: '5px',
        margin: '20px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#ffc107',
          borderRadius: '5px 0 0 5px',
          transition: 'width 0.1s linear',
        }}
      ></div>
      {!disabled && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            backgroundColor: 'white',
            border: '2px solid #ffc107',
            borderRadius: '50%',
            boxShadow: '0 0 4px #ffc107',
          }}
        ></div>
      )}
    </div>
  );
};

export default MusicSpectrum;
