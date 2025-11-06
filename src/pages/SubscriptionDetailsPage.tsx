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
import { CreditCard, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { format, parseISO, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const paymentCardFormSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido.").max(16, "Número do cartão inválido."),
  cardName: z.string().min(1, "Nome no cartão é obrigatório."),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Data de validade inválida (MM/AA)."),
  cvv: z.string().min(3, "CVV inválido.").max(4, "CVV inválido."),
});

const SubscriptionDetailsPage: React.FC = () => {
  const { userProfile, updateUserProfile } = useTransactionContext();
  const navigate = useNavigate();

  const paymentCardForm = useForm<z.infer<typeof paymentCardFormSchema>>({
    resolver: zodResolver(paymentCardFormSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const handleCancelSubscription = async () => {
    await updateUserProfile({
      is_premium: false,
      // subscription_type e subscription_end_date serão definidos como null no TransactionContext
      // data_retention_until será definido no TransactionContext
    });
    toast.success("Sua assinatura foi cancelada com sucesso. Seu login será suspenso e seus dados serão retidos por 1 mês.");
    navigate("/subscribe"); // Redireciona para a página de assinatura necessária
  };

  const handleUpdatePaymentCard = async (values: z.infer<typeof paymentCardFormSchema>) => {
    toast.loading("Atualizando dados do cartão...", { id: "update-card-toast" });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    // In a real application, you would send these details to a payment gateway.
    // For this simulation, we just show a success message.
    toast.dismiss("update-card-toast");
    toast.success("Dados do cartão atualizados com sucesso!", {
      icon: <CheckCircle className="h-4 w-4" />,
    });
    paymentCardForm.reset(); // Clear form after successful update
  };

  const retentionDate = userProfile?.data_retention_until ? format(parseISO(userProfile.data_retention_until), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Assinatura GPF</h1>
      <p className="text-muted-foreground">
        Gerencie o status da sua assinatura premium do GPF e atualize seus dados de pagamento.
      </p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Status da Assinatura
          </CardTitle>
          <CardDescription>
            Informações sobre sua assinatura premium do GPF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {userProfile?.is_premium ? (
            <>
              <p>
                Você está no plano{" "}
                <span className="font-semibold">
                  {userProfile.subscription_type === "monthly" ? "Mensal" : "Anual"}
                </span>
                .
              </p>
              {userProfile.subscription_end_date && (
                <p>
                  Sua assinatura é válida até{" "}
                  <span className="font-semibold">
                    {format(parseISO(userProfile.subscription_end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  .
                </p>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">
                    Cancelar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao cancelar, seu login será suspenso imediatamente. Seus dados serão retidos por 1 mês a partir de hoje. Se você reativar a assinatura dentro desse período, terá acesso total aos seus dados novamente. Após {retentionDate}, todos os seus dados serão permanentemente excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não, Manter Assinatura</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription}>
                      Sim, Cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <p>Você não possui uma assinatura ativa do GPF Premium.</p>
              <Button className="mt-4" onClick={() => navigate("/subscribe")}>
                Assinar Agora
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {userProfile?.is_premium && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Alterar Cartão de Pagamento
            </CardTitle>
            <CardDescription>
              Atualize as informações do seu cartão de crédito para a assinatura do GPF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...paymentCardForm}>
              <form onSubmit={paymentCardForm.handleSubmit(handleUpdatePaymentCard)} className="space-y-4">
                <FormField
                  control={paymentCardForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Cartão</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXX XXXX XXXX XXXX" {...field} maxLength={16} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentCardForm.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome no Cartão</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={paymentCardForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade (MM/AA)</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/AA" {...field} maxLength={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentCardForm.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX" {...field} maxLength={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Atualizar Cartão
                </Button>
              </form>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionDetailsPage;