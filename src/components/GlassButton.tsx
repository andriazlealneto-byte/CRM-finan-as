"use client";

import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GlassButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        "backdrop-blur-sm bg-opacity-50", // Apply blur and transparency
        className
      )}
      {...props}
    />
  )
);
GlassButton.displayName = "GlassButton";

export default GlassButton;