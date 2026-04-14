import React from 'react';
import logoUrl from '../assets/Logo.png';

const TTLogo = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <img src={logoUrl} alt="Tunisie Telecom" className={className} />
  );
};

export default TTLogo;
