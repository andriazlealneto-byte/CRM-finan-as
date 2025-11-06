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
import { User, Palette, Shirt, LayoutDashboard, Mail, Lock, Eye, EyeOff } from "lucide-react"; // Importar novos ícones
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";

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

const emailChangeFormSchema = z.object({
  email: z.string().email("Digite um email válido.").min(1, "O email é obrigatório."),
  currentPassword: z.string().min(1, "Sua senha atual é necessária para alterar o email."),
});

const passwordChangeFormSchema = z.object({
  currentPassword: z.string().min(1, "Sua senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmNewPassword: z.string().min(6, "Confirme sua nova senha."),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmNewPassword"],
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
  const { user } = useSession(); // Obter o usuário da sessão para o email
  const [showCurrentPasswordEmail, setShowCurrentPasswordEmail] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
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

  const emailForm = useForm<z.infer<typeof emailChangeFormSchema>>({
    resolver: zodResolver(emailChangeFormSchema),
    defaultValues: {
      email: user?.email || "",
      currentPassword: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordChangeFormSchema>>({
    resolver: zodResolver(passwordChangeFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      profileForm.reset({
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
    if (user?.email) {
      emailForm.reset({ email: user.email, currentPassword: "" });
    }
  }, [userProfile, user, profileForm, emailForm]);

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
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

  const onEmailSubmit = async (values: z.infer<typeof emailChangeFormSchema>) => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    // Re-authenticate user with current password before changing email
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: values.currentPassword,
    });

    if (signInError) {
      toast.error("Senha atual incorreta. Não foi possível alterar o e-mail.");
      console.error("Erro de reautenticação:", signInError);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      email: values.email,
    });

    if (error) {
      toast.error("Erro ao alterar e-mail: " + error.message);
      console.error("Erro ao alterar e-mail:", error);
    } else {
      toast.success("E-mail alterado com sucesso! Verifique sua nova caixa de entrada para confirmar.");
      emailForm.reset({ email: values.email, currentPassword: "" }); // Reset form, keep new email
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordChangeFormSchema>) => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    // Re-authenticate user with current password before changing password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: values.currentPassword,
    });

    if (signInError) {
      toast.error("Senha atual incorreta. Não foi possível alterar a senha.");
      console.error("Erro de reautenticação:", signInError);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
      console.error("Erro ao alterar senha:", error);
    } else {
      toast.success("Senha alterada com sucesso!");
      passwordForm.reset();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">Gerencie suas informações pessoais e personalize a aparência do aplicativo.</p>

      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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

          <Button type="submit">Salvar Alterações do Perfil</Button>
        </form>
      </Form>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Alterar E-mail
          </CardTitle>
          <CardDescription>
            Atualize seu endereço de e-mail. Uma confirmação será enviada para o novo e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="novo@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPasswordEmail ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowCurrentPasswordEmail((prev) => !prev)}
                        >
                          {showCurrentPasswordEmail ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Sua senha atual é necessária para confirmar a alteração.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Alterar E-mail
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura com uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                        >
                          {showCurrentPassword ? (
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
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                          {showNewPassword ? (
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
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                          onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        >
                          {showConfirmNewPassword ? (
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
                Alterar Senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;