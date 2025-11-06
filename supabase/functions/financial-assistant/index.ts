import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify the user's JWT token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized: Missing Authorization header', {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return new Response('Unauthorized: Invalid user session', {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { transactions, budgets, goals } = await req.json();

    // --- Placeholder para a integração com a IA ---
    // Aqui você integraria seu modelo de IA (ex: OpenAI, Google Gemini).
    // Você precisaria:
    // 1. Importar a SDK do seu modelo de IA (ex: `import OpenAI from 'https://esm.sh/openai';`)
    // 2. Obter sua chave de API de um segredo do Supabase (ex: `const openaiApiKey = Deno.env.get('OPENAI_API_KEY');`)
    // 3. Construir um prompt com os dados do usuário (transactions, budgets, goals).
    // 4. Chamar a API do modelo de IA.

    // Exemplo de prompt (você adaptaria isso para o seu modelo de IA):
    const prompt = `
      Analise os seguintes dados financeiros do usuário e forneça dicas personalizadas e previsões:

      Transações: ${JSON.stringify(transactions)}
      Orçamentos: ${JSON.stringify(budgets)}
      Metas: ${JSON.stringify(goals)}

      Com base nesses dados, gere:
      - 2-3 dicas financeiras acionáveis (ex: "Se você cortar X% em Y, economiza R$Z/mês.").
      - 1-2 previsões (ex: "Em N meses, você pode atingir sua meta de reserva.").
      - Um resumo geral da saúde financeira do usuário.

      Formate a resposta como um objeto JSON com as chaves "dicas", "previsoes" e "resumo".
    `;

    // Simulação de resposta da IA (substitua isso pela chamada real à API da IA)
    const aiResponse = {
      dicas: [
        "Se você cortar 10% nos gastos com 'Lazer' este mês, poderá economizar R$120.",
        "Considere revisar suas despesas fixas, há potencial para economizar R$50/mês na categoria 'Assinaturas'.",
      ],
      previsoes: [
        "Com o ritmo atual, você pode atingir sua meta de 'Reserva de Emergência' em 6 meses.",
        "Se você aumentar sua economia em R$100/mês, pode alcançar sua meta de 'Viagem' 2 meses antes.",
      ],
      resumo: "Sua saúde financeira está em um bom caminho, mas há oportunidades para otimizar gastos em categorias discricionárias e acelerar suas metas.",
    };

    // --- Fim do Placeholder ---

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na função Edge:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});