"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Crown } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ThemeToggle } from "@/components/ThemeToggle";

const SubscriptionRequiredPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Crown className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Assinatura Necessária</CardTitle>
          <CardDescription className="text-lg">
            Para continuar usando o GPF, por favor, assine um de nossos planos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Desbloqueie todos os recursos de gestão financeira pessoal com uma assinatura premium.
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild size="lg" className="w-full">
              <Link to="/?plan=monthly">Assinar Plano Mensal (R$39,90/mês)</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link to="/?plan=annual">Assinar Plano Anual (20% de desconto)</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Já tem uma conta premium? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
          </p>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default SubscriptionRequiredPage;