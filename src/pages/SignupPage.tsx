"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { Eye, EyeOff, ChevronLeft } from "lucide-react"; // Importar ChevronLeft
import { ThemeToggle } from "@/components/ThemeToggle"; // Importar ThemeToggle
import Logo from "@/components/Logo"; // Importar o componente Logo

const signupFormSchema = z.object({
  first_name: z.string().min(1, "O primeiro nome é obrigatório.").max(50, "O primeiro nome não pode ter mais de 50 caracteres."),
  last_name: z.string().min(1, "O sobrenome é obrigatório.").max(50, "O sobrenome não pode ter mais de 50 caracteres."),
  email: z.string().email("Digite um email válido.").min(1, "O email é obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme sua senha."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

const SignupPage = () => {
  const { signup } = useAuth();
  const { loading, session } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (!loading && session) {
      navigate("/app");
    }
  }, [loading, session, navigate]);

  const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    const success = await signup(values.email, values.password, values.first_name, values.last_name);
    if (success) {
      // A mensagem de sucesso agora é tratada dentro da função signup no AuthContext
      if (plan) {
        navigate(`/payment?plan=${plan}`);
      } else {
        navigate("/app"); // Redireciona para /app se não houver plano, pois o usuário já está logado
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4"> {/* Botão de voltar */}
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-4" />
          <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
          <CardDescription>
            Cadastre-se para começar a gerenciar suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primeiro Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu primeiro nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default SignupPage;