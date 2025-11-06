"use client";

import React from "react";
import { useTransactionContext } from "@/context/TransactionContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Smile, Ghost, Bot, Cat, Dog, Crown, Zap } from "lucide-react";

// Mapeamento de estilos de avatar para componentes de ícone
const avatarIcons: { [key: string]: React.ElementType } = {
  User: User,
  Smile: Smile,
  Ghost: Ghost,
  Bot: Bot,
  Cat: Cat,
  Dog: Dog,
  Crown: Crown,
  Zap: Zap,
  // Adicione mais opções conforme desejar
};

const UserAvatar = () => {
  const { userProfile } = useTransactionContext();

  const AvatarIcon = userProfile?.avatar_style && avatarIcons[userProfile.avatar_style]
    ? avatarIcons[userProfile.avatar_style]
    : User; // Fallback para User se o estilo não for encontrado

  return (
    <Avatar className="h-9 w-9 border-2 border-primary">
      {/* Se você tiver URLs de imagem para avatares, pode usar AvatarImage */}
      {/* <AvatarImage src={userProfile?.avatar_url || ""} alt="User Avatar" /> */}
      <AvatarFallback className="bg-primary text-primary-foreground">
        <AvatarIcon className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;