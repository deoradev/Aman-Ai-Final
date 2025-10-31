import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  audioData: Uint8Array;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioData, isUserSpeaking, isAISpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationPhase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    const computedStyle = getComputedStyle(document.body);
    const primaryColor = `rgb(${computedStyle.getPropertyValue('--color-primary-500').trim()})`;
    const secondaryColor = `rgb(${computedStyle.getPropertyValue('--color-secondary-500').trim()})`;

    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    handleResize();

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      animationPhase.current += 0.03;

      if (isAISpeaking) {
        // AI Speaking Animation: Pulsing sine waves
        const phase = animationPhase.current * 1.5;
        const centerY = height / 2;
        const amplitude = height / 3;
        const frequency = 4;

        context.lineWidth = 3;
        const colors = [primaryColor, secondaryColor];

        for (let j = 0; j < colors.length; j++) {
            context.strokeStyle = `rgba(${j === 0 ? computedStyle.getPropertyValue('--color-primary-500').trim() : computedStyle.getPropertyValue('--color-secondary-500').trim()}, 0.7)`;
            context.beginPath();
            for (let i = 0; i < width; i++) {
                const angle = (i / width) * Math.PI * 2 * frequency;
                const yOffset = Math.sin(angle + phase + j * Math.PI) * (amplitude * 0.6) +
                              Math.sin((angle * 0.5) + phase * 0.5 + j) * (amplitude * 0.4);
                const y = centerY + yOffset;
                if (i === 0) context.moveTo(i, y);
                else context.lineTo(i, y);
            }
            context.stroke();
        }

      } else if (isUserSpeaking) {
        // User Speaking Animation: Dynamic waveform
        const sliceWidth = width * 1.0 / audioData.length;
        let x = 0;

        context.lineWidth = 3;
        context.strokeStyle = secondaryColor;
        context.beginPath();

        const amplification = 1.8;

        for (let i = 0; i < audioData.length; i++) {
          const v = (audioData[i] - 128) / 128.0;
          const y = v * (height / 2) * amplification + (height / 2);

          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
          
          x += sliceWidth;
        }
        
        context.lineTo(width, height / 2);
        context.stroke();

      } else {
        // Idle / Thinking Animation: Rotating orbs
        const phase = animationPhase.current;
        const radius = Math.min(width, height) / 4;
        const numOrbs = 5;
        for(let i=0; i<numOrbs; i++) {
            const angle = (i/numOrbs) * Math.PI * 2 + phase;
            const x = width / 2 + Math.cos(angle) * radius;
            const y = height / 2 + Math.sin(angle) * radius;
            const orbRadius = 4 + 2 * Math.sin(phase * 2 + i);
            context.beginPath();
            context.arc(x, y, orbRadius, 0, Math.PI * 2);
            context.fillStyle = primaryColor;
            context.fill();
        }
      }
    };
    
    let animationFrameId: number;
    const render = () => {
        draw();
        animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
        window.cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
    }

  }, [audioData, isUserSpeaking, isAISpeaking]);

  return <canvas ref={canvasRef} className="w-full h-[80px]" />;
};

export default VoiceVisualizer;