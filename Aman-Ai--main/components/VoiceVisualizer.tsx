import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  audioData: Uint8Array;
  isUserSpeaking: boolean;
  isAIThinking: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioData, isUserSpeaking, isAIThinking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thinkingPhase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Get theme colors from CSS variables for dynamic theme support
    const computedStyle = getComputedStyle(document.body);
    const primaryColor = `rgb(${computedStyle.getPropertyValue('--color-primary-500').trim()})`;
    const secondaryColor = `rgb(${computedStyle.getPropertyValue('--color-secondary-500').trim()})`;

    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    handleResize(); // Set initial size

    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      
      if (isAIThinking) {
        // AI thinking animation
        thinkingPhase.current += 0.05;
        const radius = Math.min(width, height) / 3;
        const numOrbs = 5;
        for(let i=0; i<numOrbs; i++) {
            const angle = (i/numOrbs) * Math.PI * 2 + thinkingPhase.current;
            const x = width / 2 + Math.cos(angle) * radius;
            const y = height / 2 + Math.sin(angle) * radius;
            const orbRadius = 4 + 2 * Math.sin(thinkingPhase.current * 2 + i);
            context.beginPath();
            context.arc(x, y, orbRadius, 0, Math.PI * 2);
            context.fillStyle = primaryColor;
            context.fill();
        }

      } else {
        // User speaking waveform
        const sliceWidth = width * 1.0 / audioData.length;
        let x = 0;

        context.lineWidth = 2;
        context.strokeStyle = secondaryColor;
        context.beginPath();
        
        for (let i = 0; i < audioData.length; i++) {
          const v = (audioData[i] - 128) / 128.0; // Normalize to -1 to 1
          const y = v * (height / 2) * (isUserSpeaking ? 1 : 0.1) + (height / 2);

          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
          x += sliceWidth;
        }
        
        context.lineTo(width, height / 2);
        context.stroke();
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

  }, [audioData, isUserSpeaking, isAIThinking]);

  return <canvas ref={canvasRef} className="w-full h-[80px]" />;
};

export default VoiceVisualizer;