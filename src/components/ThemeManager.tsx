"use client";

import React from "react";
import { useTransactionContext } from "@/context/TransactionContext";

const ThemeManager = ({ children }: { children: React.ReactNode }) => {
  const { userProfile } = useTransactionContext();

  React.useEffect(() => {
    if (userProfile) {
      const root = document.documentElement;
      if (userProfile.primary_color_hsl) {
        root.style.setProperty("--primary", userProfile.primary_color_hsl);
        root.style.setProperty("--sidebar-primary", userProfile.primary_color_hsl);
        root.style.setProperty("--ring", userProfile.primary_color_hsl);
        root.style.setProperty("--sidebar-ring", userProfile.primary_color_hsl);
      }
      if (userProfile.background_color_hsl) {
        root.style.setProperty("--background", userProfile.background_color_hsl);
        root.style.setProperty("--card", userProfile.background_color_hsl);
        root.style.setProperty("--popover", userProfile.background_color_hsl);
      }
      // You might want to set other related colors here as well
      // For example, if background changes, muted/accent/border might need adjustment
      // For simplicity, we'll stick to primary and background for now.
    }
  }, [userProfile]);

  return <>{children}</>;
};

export default ThemeManager;