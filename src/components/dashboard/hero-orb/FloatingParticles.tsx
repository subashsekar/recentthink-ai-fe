'use client';

import { useMemo } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: 20 }, (_, id) => ({
    id,
    left: 8 + Math.random() * 84,
    top: 8 + Math.random() * 84,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 4,
  }));
}

export function FloatingParticles() {
  const particles = useMemo(() => createParticles(), []);

  return (
    <>
      <style>{`
        @keyframes hero-particle-float {
          0% {
            transform: translateY(0) translateZ(0);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-36px) translateZ(0);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((particle) => (
        <span
          key={particle.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full will-change-transform"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: '#FF7A4D',
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 122, 77, 0.6)`,
            animation: `hero-particle-float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );
}
