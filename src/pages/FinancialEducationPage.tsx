"use client";

import React from "react";
import YouTube from "react-youtube";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const youtubeVideos = [
  {
    id: "dQw4w9WgXcQ", // Exemplo: Rick Astley - Never Gonna Give You Up (substitua por vídeos reais)
    title: "Como Sair do Vermelho: Guia Completo",
    description: "Aprenda estratégias eficazes para quitar suas dívidas e organizar suas finanças.",
  },
  {
    id: "sY_K_X-210Q", // Outro exemplo
    title: "Investindo para Iniciantes: Primeiros Passos",
    description: "Um guia simples para começar a investir com segurança e inteligência.",
  },
  {
    id: "l_NYCQg4g0g", // Mais um exemplo
    title: "Planejamento Financeiro Pessoal: Crie seu Orçamento",
    description: "Descubra como criar um orçamento que realmente funciona para você.",
  },
];

const FinancialEducationPage = () => {
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Academia Financeira</h1>
      <p className="text-muted-foreground">Aprenda a gerenciar suas finanças com nossos vídeos educativos.</p>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {youtubeVideos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
              <CardDescription>{video.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}> {/* 16:9 Aspect Ratio */}
                <YouTube
                  videoId={video.id}
                  opts={{ ...opts, width: "100%", height: "100%" }}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinancialEducationPage;