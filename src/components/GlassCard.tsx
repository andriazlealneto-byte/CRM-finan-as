"use client";

import React from "react";
import { Card, CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "bg-background/50 backdrop-blur-md border border-foreground/20 shadow-lg",
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";

export default GlassCard;