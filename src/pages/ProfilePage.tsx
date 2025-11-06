"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTransactionContext } from "@/context/TransactionContext";
import { toast } from "sonner";
import { User } from "lucide-react";

const profileFormSchema = z.object({
  first_name: z.string().min(1, "O primeiro nome é obrigatório.").max(50, "O primeiro nome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
  last_name: z.string().min(1, "O sobrenome é obrigatório.").max(50, "O sobrenome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
});

const ProfilePage = () => {
  const { userProfile, updateUserProfile } = useTransactionContext();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    await updateUserProfile({
      first_name: values.first_name || null,
      last_name: values.last_name || null,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Informações do Usuário
          </CardTitle>
          <CardDescription>
            Atualize seu nome e sobrenome.
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
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;