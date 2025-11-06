"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useTransactionContext } from "@/context/TransactionContext";
import { toast } from "sonner";
import { User, Palette, Shirt, LayoutDashboard } from "lucide-react"; // Importar novos ícones
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const profileFormSchema = z.object({
  first_name: z.string().min(1, "O primeiro nome é obrigatório.").max(50, "O primeiro nome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
  last_name: z.string().min(1, "O sobrenome é obrigatório.").max(50, "O sobrenome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
  avatar_style: z.string().optional().or(z.literal("")),
  show_budgets: z.boolean().optional(),
  show_goals: z.boolean().optional(),
  show_debts: z.boolean().optional(),
  show_subscriptions: z.boolean().optional(),
  show_monthly_review: z.boolean().optional(),
});

const avatarOptions = [
  { value: "User", label: "Usuário Padrão" },
  { value: "Smile", label: "Sorriso" },
  { value: "Ghost", label: "Fantasma" },
  { value: "Bot", label: "Robô" },
  { value: "Cat", label: "Gato" },
  { value: "Dog", label: "Cachorro" },
  { value: "Crown", label: "Coroa" },
  { value: "Zap", label: "Raio" },
];

const ProfilePage = () => {
  const { userProfile, updateUserProfile } = useTransactionContext();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
      avatar_style: userProfile?.avatar_style || "User",
      show_budgets: userProfile?.show_budgets ?? true,
      show_goals: userProfile?.show_goals ?? true,
      show_debts: userProfile?.show_debts ?? true,
      show_subscriptions: userProfile?.show_subscriptions ?? true,
      show_monthly_review: userProfile?.show_monthly_review ?? true,
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        avatar_style: userProfile.avatar_style || "User",
        show_budgets: userProfile.show_budgets,
        show_goals: userProfile.show_goals,
        show_debts: userProfile.show_debts,
        show_subscriptions: userProfile.show_subscriptions,
        show_monthly_review: userProfile.show_monthly_review,
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    await updateUserProfile({
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      avatar_style: values.avatar_style || null,
      show_budgets: values.show_budgets,
      show_goals: values.show_goals,
      show_debts: values.show_debts,
      show_subscriptions: values.show_subscriptions,
      show_monthly_review: values.show_monthly_review,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">Gerencie suas informações pessoais e personalize a aparência do aplicativo.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Informações do Usuário
              </CardTitle>
              <CardDescription>
                Atualize seu nome e sobrenome.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" /> Personalização de Avatar
              </CardTitle>
              <CardDescription>
                Escolha um estilo de avatar para aparecer no canto superior direito.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="avatar_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo do Avatar</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estilo de avatar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {avatarOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Visibilidade do Menu Lateral
              </CardTitle>
              <CardDescription>
                Selecione quais opções você deseja ver no menu de navegação lateral e no painel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="show_budgets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mostrar Orçamentos
                      </FormLabel>
                      <FormDescription>
                        Exibe a seção de Orçamentos no menu e no painel.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_goals"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mostrar Metas
                      </FormLabel>
                      <FormDescription>
                        Exibe a seção de Metas no menu e no painel.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_debts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mostrar Dívidas
                      </FormLabel>
                      <FormDescription>
                        Exibe a seção de Dívidas no menu e no painel.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_subscriptions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mostrar Assinaturas
                      </FormLabel>
                      <FormDescription>
                        Exibe a seção de Assinaturas no menu e no painel.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_monthly_review"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mostrar Reflexão Mensal
                      </FormLabel>
                      <FormDescription>
                        Exibe a seção de Reflexão Mensal no menu e no painel.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit">Salvar Alterações</Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;