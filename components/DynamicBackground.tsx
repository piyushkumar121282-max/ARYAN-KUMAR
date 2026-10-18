import React, { useEffect, useRef } from 'react';

interface DynamicBackgroundProps {
  planTier: string;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Normal, subtle uniform dark embers
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2),
      size: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.4 + 0.1,
      color: '#f59e0b',
      life: Math.random() * 200,
      maxLife: 200
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (p.life > p.maxLife) {
          p.x = Math.random() * width;
          p.y = height;
          p.life = 0;
        }

        const currentAlpha = p.alpha * Math.sin((p.life / p.maxLife) * Math.PI);
        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050505]">
      {/* Normal Subtle Ambient Glow (No different neon colors) */}
      <div className="fixed bottom-0 right-1/4 w-[800px] h-[400px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-amber-500/3 blur-[160px] rounded-full pointer-events-none"></div>
      
      {/* Subtle normal stardust canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
};

export default DynamicBackground;
