"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const AnimatedBlob = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute top-[10%] left-[-20%] w-[800px] h-[800px] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] opacity-60 z-0",
        "bg-gradient-to-br from-primary via-primary-gradient-end to-primary",
        "bg-[length:400%_400%] animate-blob-gradient-shift",
        "transform -rotate-30", // Para a diagonal
        "filter blur-[80px]", // Efeito de desfoque para o 'liquid glass'
        className
      )}
      style={{
        // Para garantir que o blur não afete elementos fora do blob, embora filter já faça isso.
        // backdrop-filter seria para elementos *atrás* do blob, mas aqui o blob é o fundo.
        // A opacidade e o blur já dão o efeito desejado.
      }}
    ></div>
  );
};

export default AnimatedBlob;