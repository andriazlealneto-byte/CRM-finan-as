"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Banknote } from 'lucide-react'; // Ícone sugerido para finanças e confiança
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: string;
}

const Logo = ({ className, iconClassName, textClassName, href = "/" }: LogoProps) => {
  return (
    <Link to={href} className={cn("flex items-center space-x-2", className)}>
      <Banknote className={cn("h-6 w-6 text-primary", iconClassName)} />
      <span className={cn("text-2xl font-bold text-primary", textClassName)}>GPF</span>
    </Link>
  );
};

export default Logo;