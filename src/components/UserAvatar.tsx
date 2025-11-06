"use client";

import React from "react";
import { useTransactionContext } from "@/context/TransactionContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Smile, Ghost, Bot, Cat, Dog, Crown, Zap, LogOut, Settings, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
  const { logout } = useAuth();
  const navigate = useNavigate();

  const AvatarIcon = userProfile?.avatar_style && avatarIcons[userProfile.avatar_style]
    ? avatarIcons[userProfile.avatar_style]
    : User; // Fallback para User se o estilo não for encontrado

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Avatar className="h-9 w-9 border-2 border-primary">
            {/* Se você tiver URLs de imagem para avatares, pode usar AvatarImage */}
            {/* <AvatarImage src={userProfile?.avatar_url || ""} alt="User Avatar" /> */}
            <AvatarFallback className="bg-primary text-primary-foreground">
              <AvatarIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={() => navigate("/app/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/app/subscription-details")}> {/* Aponta para a nova página de detalhes da assinatura */}
          <CreditCard className="mr-2 h-4 w-4" />
          Gerenciar Assinatura GPF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;