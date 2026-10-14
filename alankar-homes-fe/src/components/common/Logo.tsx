import React, { useState } from 'react';
import logoImg from '../../assets/alankar-logo.png';

interface LogoProps {
  size?: 'sm' | 'lg';
}

const SIZES = {
  sm: { box: 'w-11 h-11', glow: 'hidden', fallback: 'text-xl' },
  lg: { box: 'w-28 h-28 md:w-36 md:h-36', glow: 'block', fallback: 'text-5xl' },
};

// The round emblem already has its own gold ring, so it's shown as-is
export const Logo: React.FC<LogoProps> = ({ size = 'lg' }) => {
  const [failed, setFailed] = useState(false);
  const s = SIZES[size];

  return (
    <div className={`relative shrink-0 ${s.box}`}>
      {/* Soft gold glow behind the large logo */}
      <div className={`${s.glow} absolute -inset-4 rounded-full bg-[#caa060]/15 blur-2xl`} />

      {failed ? (
        <div className="relative w-full h-full rounded-full bg-[#0c3d40] border-2 border-[#caa060] flex items-center justify-center">
          <span className={`font-serif text-[#ecc588] ${s.fallback}`}>A</span>
        </div>
      ) : (
        <img
          src={logoImg}
          alt="Alankar Homes"
          onError={() => setFailed(true)}
          className="relative w-full h-full rounded-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
        />
      )}
    </div>
  );
};
