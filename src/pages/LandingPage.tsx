"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, DollarSign, TrendingUp, Shield, Star, Menu } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "@/context/SessionContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTransactionContext } from "@/context/TransactionContext"; // Import useTransactionContext
import AnimatedBlob from "@/components/AnimatedBlob"; // Importar o novo componente
import Logo from "@/components/Logo"; // Importar o componente Logo

const LandingPage = () => {
  const { session, loading } = useSession();
  const { userProfile } = useTransactionContext(); // Get userProfile
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSubscriptionClick = (plan: 'monthly' | 'annual') => {
    if (session) {
      navigate(`/payment?plan=${plan}`);
    } else {
      navigate(`/signup?plan=${plan}`);
    }
  };

  const features = [
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      title: "Controle de Transações",
      description: "Registre suas receitas e despesas de forma fácil e intuitiva.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Metas Financeiras",
      description: "Defina e acompanhe suas metas de economia e liberdade financeira.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Gerenciamento de Dívidas",
      description: "Mantenha suas dívidas e parcelamentos sob controle.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Orçamentos Personalizados",
      description: "Crie orçamentos para categorias específicas e evite gastos excessivos.",
    },
    {
      icon: <Menu className="h-6 w-6 text-primary" />,
      title: "Assinaturas e Recorrências",
      description: "Gerencie todos os seus serviços de assinatura em um só lugar.",
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Reflexão Mensal",
      description: "Receba insights sobre seus hábitos financeiros e planeje o futuro.",
    },
  ];

  const testimonials = [
    {
      name: "Ana Paula S.",
      rating: 5,
      feedback: "O GPF mudou a forma como vejo minhas finanças. É muito fácil de usar e os insights são incríveis!",
    },
    {
      name: "Carlos Eduardo M.",
      rating: 5,
      feedback: "Finalmente um aplicativo que me ajuda a entender para onde meu dinheiro está indo. Recomendo!",
    },
    {
      name: "Mariana L.",
      rating: 4,
      feedback: "Adorei a funcionalidade de metas. Estou muito mais perto de alcançar minha liberdade financeira.",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn("h-4 w-4", i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600")}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild><Link to="#features">Recursos</Link></Button>
            <Button variant="ghost" asChild><Link to="#pricing">Preços</Link></Button>
            <Button variant="ghost" asChild><Link to="#testimonials">Depoimentos</Link></Button>
            <ThemeToggle />
            {loading ? ( // Show loading state for auth
              <Button variant="ghost" disabled>Carregando...</Button>
            ) : session ? (
              userProfile?.is_premium ? (
                <Button asChild className="rounded-xl"><Link to="/app">Ir para o App</Link></Button>
              ) : (
                // Logged in but not premium, offer to subscribe
                <Button asChild className="rounded-xl"><Link to="/subscribe">Assinar Agora</Link></Button>
              )
            ) : (
              // Not logged in, offer login or signup/subscribe
              <>
                <Button asChild variant="ghost" className="rounded-xl"><Link to="/login">Login</Link></Button>
                <Button asChild className="rounded-xl"><Link to="/signup">Assinar Agora</Link></Button> {/* Changed to signup */}
              </>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 pt-8">
                  <Button variant="ghost" asChild onClick={() => setIsMobileMenuOpen(false)}><Link to="#features">Recursos</Link></Button>
                  <Button variant="ghost" asChild onClick={() => setIsMobileMenuOpen(false)}><Link to="#pricing">Preços</Link></Button>
                  <Button variant="ghost" asChild onClick={() => setIsMobileMenuOpen(false)}><Link to="#testimonials">Depoimentos</Link></Button>
                  <div className="pt-4">
                    {loading ? (
                      <Button className="w-full rounded-xl" disabled>Carregando...</Button>
                    ) : session ? (
                      userProfile?.is_premium ? (
                        <Button asChild className="w-full rounded-xl"><Link to="/app">Ir para o App</Link></Button>
                      ) : (
                        <Button asChild className="w-full rounded-xl"><Link to="/subscribe">Assinar Agora</Link></Button>
                      )
                    ) : (
                      <>
                        <Button asChild variant="ghost" className="w-full rounded-xl" onClick={() => setIsMobileMenuOpen(false)}><Link to="/login">Login</Link></Button>
                        <Button asChild className="w-full rounded-xl" onClick={() => setIsMobileMenuOpen(false)}><Link to="/signup">Assinar Agora</Link></Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-64px)] flex items-center justify-center text-center bg-background p-8">
        <AnimatedBlob />
        <div className="max-w-4xl space-y-8 relative z-10">
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight text-foreground">
            Assuma o Controle das Suas Finanças Pessoais
          </h1>
          <p className="text-2xl opacity-90 max-w-3xl mx-auto text-foreground">
            O GPF é a sua ferramenta completa para gerenciar receitas, despesas, metas e dívidas. Comece hoje a construir um futuro financeiro sólido!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-xl bg-white text-primary hover:bg-gray-100" onClick={() => handleSubscriptionClick('monthly')}>
              Começar Agora (Mensal)
            </Button>
            <Button size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSubscriptionClick('annual')}>
              Economize 20% (Anual)
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-16 text-center space-y-12">
        <h2 className="text-4xl font-bold">Recursos que Você Vai Amar</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Simplifique sua vida financeira com ferramentas poderosas e intuitivas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 space-y-4">
              {feature.icon}
              <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              <CardContent className="text-muted-foreground p-0">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-16 text-center space-y-12 bg-muted/20">
        <h2 className="text-4xl font-bold">Planos de Assinatura</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano que melhor se adapta às suas necessidades e comece a transformar suas finanças.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="flex flex-col p-8 space-y-6 border-2 border-primary">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl font-bold">Plano Mensal</CardTitle>
              <p className="text-5xl font-extrabold text-primary">R$39,90<span className="text-lg text-muted-foreground">/mês</span></p>
              <CardDescription>Ideal para quem busca flexibilidade.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-0 text-left">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Acesso a todos os recursos</li>
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Suporte prioritário</li>
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Cancelamento a qualquer momento</li>
              </ul>
            </CardContent>
            <Button size="lg" className="w-full rounded-xl" onClick={() => handleSubscriptionClick('monthly')}>
              Assinar Plano Mensal
            </Button>
          </Card>

          <Card className="flex flex-col p-8 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl font-bold">Plano Anual</CardTitle>
              <p className="text-5xl font-extrabold text-primary">R$383,04<span className="text-lg text-muted-foreground">/ano</span></p>
              <p className="text-sm text-green-500 font-semibold">Economize 20%!</p>
              <CardDescription>O melhor custo-benefício para o controle total.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-0 text-left">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Tudo do plano mensal</li>
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> 20% de desconto</li>
                <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Estabilidade e planejamento a longo prazo</li>
              </ul>
            </CardContent>
            <Button size="lg" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSubscriptionClick('annual')}>
              Assinar Plano Anual
            </Button>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container py-16 text-center space-y-12">
        <h2 className="text-4xl font-bold">O que Nossos Usuários Dizem</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Veja como o GPF está ajudando pessoas reais a alcançarem seus objetivos financeiros.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 space-y-4 text-left">
              <div className="flex items-center gap-1">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.feedback}"</p>
              <p className="font-semibold">- {testimonial.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center bg-background">
        <div className="max-w-3xl mx-auto p-12 bg-primary text-white space-y-6 rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%] shadow-lg">
          <h2 className="text-4xl font-bold">Pronto para Transformar Suas Finanças?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que estão no controle de sua vida financeira com o GPF.
          </p>
          <Button size="lg" className="w-full sm:w-auto rounded-xl bg-white text-primary hover:bg-gray-100" onClick={() => handleSubscriptionClick('monthly')}>
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GPF. Todos os direitos reservados.</p>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default LandingPage;