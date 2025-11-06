"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";
import { CreditCard, CheckCircle } from "lucide-react";
import { useTransactionContext } from "@/context/TransactionContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const paymentFormSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido.").max(16, "Número do cartão inválido."),
  cardName: z.string().min(1, "Nome no cartão é obrigatório."),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Data de validade inválida (MM/AA)."),
  cvv: z.string().min(3, "CVV inválido.").max(4, "CVV inválido."),
});

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const { updateUserProfile } = useTransactionContext();

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof paymentFormSchema>) => {
    // Simulate payment processing
    toast.loading("Processando pagamento...", { id: "payment-toast" });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    const subscriptionType = plan === "annual" ? "annual" : "monthly";
    const endDate = new Date();
    if (subscriptionType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await updateUserProfile({
      is_premium: true,
      subscription_type: subscriptionType,
      subscription_end_date: endDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      grace_period_start_date: null, // Clear grace period on successful payment
    });

    toast.dismiss("payment-toast");
    toast.success("Pagamento realizado com sucesso! Bem-vindo ao GPF Premium.", {
      icon: <CheckCircle className="h-4 w-4" />,
    });
    navigate("/app");
  };

  const planDetails = plan === "annual"
    ? { name: "Plano Anual", price: "R$383,04/ano (20% de desconto)" }
    : { name: "Plano Mensal", price: "R$39,90/mês" };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Finalizar Assinatura</CardTitle>
          <CardDescription>
            Você selecionou o {planDetails.name}. O valor total é {planDetails.price}.
            Por favor, insira seus dados de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                Confirmar Pagamento
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default PaymentPage;