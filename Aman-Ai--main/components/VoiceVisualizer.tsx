import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  audioData: Uint8Array;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioData, isUserSpeaking, isAISpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Color definitions
    // Human: Warm, Energetic (Amber/Orange/Pink)
    const humanColors = ['rgba(245, 158, 11, 0.8)', 'rgba(236, 72, 153, 0.6)'];
    // AI: Cool, Stable (Teal/Emerald/Blue)
    const aiColors = ['rgba(20, 184, 166, 0.8)', 'rgba(59, 130, 246, 0.6)'];
    // Idle: Calm, Deep (Slate/Blue)
    const idleColors = ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.2)'];

    let currentPhase = 0; // 0 = idle, 1 = user, 2 = ai

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      
      timeRef.current += 0.008; 
      const t = timeRef.current;

      // Determine State & Intensity
      let intensity = 0;
      if (audioData.length > 0) {
        const sum = audioData.reduce((a, b) => a + Math.abs(b - 128), 0);
        intensity = Math.min(sum / (audioData.length * 30), 1.5);
      }

      // Target Phase Transition
      let targetPhase = 0;
      if (isUserSpeaking) targetPhase = 1;
      else if (isAISpeaking) targetPhase = 2;

      // Smooth transition between phases (simple lerp for visualization logic)
      const transitionSpeed = 0.05;
      currentPhase = currentPhase + (targetPhase - currentPhase) * transitionSpeed;

      // Interpolate Colors based on currentPhase
      // This is a simplified blend approach
      let color1, color2;
      
      if (currentPhase < 0.5) {
        // Blending Idle -> User
        color1 = idleColors[0];
        color2 = idleColors[1];
      } else if (currentPhase < 1.5) {
        // Mostly User
        color1 = humanColors[0];
        color2 = humanColors[1];
      } else {
        // Mostly AI
        color1 = aiColors[0];
        color2 = aiColors[1];
      }

      // Wave Parameters
      const layers = 3;
      
      for (let i = 0; i < layers; i++) {
        ctx.beginPath();
        
        const layerOffset = i * 2;
        const speed = (i + 1) * 0.5 + (intensity * 2);
        const amplitude = (height * 0.15) + (intensity * height * 0.2);
        const yOffset = height / 2 + (Math.sin(t * 0.5 + i) * 20);

        // Gradient for this layer
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, i % 2 === 0 ? color1 : color2);
        gradient.addColorStop(1, i % 2 === 0 ? color2 : color1);
        ctx.fillStyle = gradient;

        // Draw Sine Wave
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 5) {
          const y = yOffset + 
            Math.sin(x * 0.005 + t * speed + layerOffset) * amplitude +
            Math.sin(x * 0.01 + t * speed * 0.5) * (amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.globalAlpha = 0.6 - (i * 0.15);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [audioData, isUserSpeaking, isAISpeaking]);

  return (
    <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-base-50/20 dark:bg-base-900/20 border border-base-200 dark:border-base-700 shadow-inner backdrop-blur-sm">
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default VoiceVisualizer;