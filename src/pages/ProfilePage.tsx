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
import { User, Palette, Shirt } from "lucide-react"; // Importar novos ícones
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Função auxiliar para converter HEX para HSL
function hexToHsl(hex: string) {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return null; // Retorna null para hex inválido
  }

  let r = 0, g = 0, b = 0;
  // handle 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

// Função auxiliar para converter HSL para HEX (para exibir no input)
function hslToHex(hsl: string | null) {
  if (!hsl) return "";
  const parts = hsl.match(/(\d+)\s(\d+)%\s(\d+)%/);
  if (!parts) return "";

  let h = parseInt(parts[1]);
  let s = parseInt(parts[2]) / 100;
  let l = parseInt(parts[3]) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Return HEX string
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}


const profileFormSchema = z.object({
  first_name: z.string().min(1, "O primeiro nome é obrigatório.").max(50, "O primeiro nome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
  last_name: z.string().min(1, "O sobrenome é obrigatório.").max(50, "O sobrenome não pode ter mais de 50 caracteres.").optional().or(z.literal("")),
  primary_color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato de cor HEX inválido.").optional().or(z.literal("")),
  background_color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato de cor HEX inválido.").optional().or(z.literal("")),
  avatar_style: z.string().optional().or(z.literal("")),
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
      primary_color_hex: hslToHex(userProfile?.primary_color_hsl || '250 80% 60%'),
      background_color_hex: hslToHex(userProfile?.background_color_hsl || '220 10% 10%'),
      avatar_style: userProfile?.avatar_style || "User",
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        primary_color_hex: hslToHex(userProfile.primary_color_hsl || '250 80% 60%'),
        background_color_hex: hslToHex(userProfile.background_color_hsl || '220 10% 10%'),
        avatar_style: userProfile.avatar_style || "User",
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    const primaryHsl = values.primary_color_hex ? hexToHsl(values.primary_color_hex) : null;
    const backgroundHsl = values.background_color_hex ? hexToHsl(values.background_color_hex) : null;

    await updateUserProfile({
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      primary_color_hsl: primaryHsl,
      background_color_hsl: backgroundHsl,
      avatar_style: values.avatar_style || null,
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
            <CardContent>
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
                <Palette className="h-5 w-5" /> Personalização de Tema
              </CardTitle>
              <CardDescription>
                Escolha as cores principais do aplicativo. Use códigos HEX (ex: #FF0000).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="primary_color_hex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="#8884d8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="background_color_hex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor de Fundo</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="#222222" {...field} />
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

          <Button type="submit">Salvar Alterações</Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;