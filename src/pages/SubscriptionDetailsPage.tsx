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
import { CreditCard, CheckCircle, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { format, parseISO, addMonths, addDays } from "date-fns"; // Importar addDays
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PaymentCard {
  id: string;
  cardNumber: string; // Armazenar apenas os últimos 4 dígitos para exibição
  cardName: string;
  expiryDate: string; // MM/AA
}

const paymentCardFormSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido.").max(16, "Número do cartão inválido."),
  cardName: z.string().min(1, "Nome no cartão é obrigatório."),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Data de validade inválida (MM/AA)."),
  cvv: z.string().min(3, "CVV inválido.").max(4, "CVV inválido."),
});

const SubscriptionDetailsPage = () => {
  const { userProfile, updateUserProfile } = useTransactionContext();
  const navigate = useNavigate();

  // Simulação de armazenamento de cartões de pagamento
  const [paymentCards, setPaymentCards] = React.useState<PaymentCard[]>(() => {
    // Inicializa com um cartão fictício se não houver nenhum
    const storedCards = localStorage.getItem("gpf_payment_cards");
    if (storedCards) {
      return JSON.parse(storedCards);
    }
    return [{ id: "default-card", cardNumber: "XXXX XXXX XXXX 1234", cardName: "Usuário Padrão", expiryDate: "12/25" }];
  });

  React.useEffect(() => {
    localStorage.setItem("gpf_payment_cards", JSON.stringify(paymentCards));
  }, [paymentCards]);

  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = React.useState(false);
  const [isEditCardDialogOpen, setIsEditCardDialogOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<PaymentCard | null>(null);

  const addCardForm = useForm<z.infer<typeof paymentCardFormSchema>>({
    resolver: zodResolver(paymentCardFormSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const editCardForm = useForm<z.infer<typeof paymentCardFormSchema>>({
    resolver: zodResolver(paymentCardFormSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  React.useEffect(() => {
    if (editingCard) {
      editCardForm.reset({
        cardNumber: editingCard.cardNumber.replace(/X/g, ''), // Remove X's for actual input
        cardName: editingCard.cardName,
        expiryDate: editingCard.expiryDate,
        cvv: "", // CVV nunca é armazenado, então sempre vazio
      });
    }
  }, [editingCard, editCardForm]);

  const handleCancelSubscription = async () => {
    await updateUserProfile({
      is_premium: false,
    });
    toast.success("Sua assinatura foi cancelada com sucesso. Seu login será suspenso e seus dados serão retidos por 1 mês.");
    navigate("/subscribe");
  };

  const handleAddCard = async (values: z.infer<typeof paymentCardFormSchema>) => {
    toast.loading("Adicionando novo cartão...", { id: "add-card-toast" });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      cardNumber: `XXXX XXXX XXXX ${values.cardNumber.slice(-4)}`, // Salva apenas os últimos 4 dígitos
      cardName: values.cardName,
      expiryDate: values.expiryDate,
    };
    setPaymentCards((prev) => [...prev, newCard]);
    toast.dismiss("add-card-toast");
    toast.success("Cartão adicionado com sucesso!", { icon: <CheckCircle className="h-4 w-4" /> });
    addCardForm.reset();
    setIsAddCardDialogOpen(false);
  };

  const handleEditCard = async (values: z.infer<typeof paymentCardFormSchema>) => {
    if (!editingCard) return;

    toast.loading("Atualizando cartão...", { id: "edit-card-toast" });
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPaymentCards((prev) =>
      prev.map((card) =>
        card.id === editingCard.id
          ? {
              ...card,
              cardNumber: `XXXX XXXX XXXX ${values.cardNumber.slice(-4)}`,
              cardName: values.cardName,
              expiryDate: values.expiryDate,
            }
          : card
      )
    );
    toast.dismiss("edit-card-toast");
    toast.success("Cartão atualizado com sucesso!", { icon: <CheckCircle className="h-4 w-4" /> });
    editCardForm.reset();
    setIsEditCardDialogOpen(false);
    setEditingCard(null);
  };

  const handleDeleteCard = async (id: string) => {
    if (paymentCards.length <= 1) {
      toast.error("Você deve ter pelo menos um cartão cadastrado.");
      return;
    }
    toast.loading("Excluindo cartão...", { id: "delete-card-toast" });
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPaymentCards((prev) => prev.filter((card) => card.id !== id));
    toast.dismiss("delete-card-toast");
    toast.success("Cartão excluído com sucesso!", { icon: <CheckCircle className="h-4 w-4" /> });
  };

  const retentionDate = userProfile?.data_retention_until ? format(parseISO(userProfile.data_retention_until), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Assinatura GPF</h1>
      <p className="text-muted-foreground">
        Gerencie o status da sua assinatura premium do GPF e seus cartões de pagamento.
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
                  Data de Renovação:{" "} {/* Changed text here */}
                  <span className="font-semibold">
                    {format(parseISO(userProfile.subscription_end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  .
                </p>
              )}
              {userProfile.grace_period_start_date && (
                <p className="text-yellow-500">
                  Você está no período de carência. O acesso premium será revogado em{" "}
                  <span className="font-semibold">
                    {format(addDays(parseISO(userProfile.grace_period_start_date), 7), "dd/MM/yyyy", { locale: ptBR })}
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
              <CreditCard className="h-5 w-5" /> Gerenciar Cartões de Pagamento
            </CardTitle>
            <CardDescription>
              Adicione, edite ou remova os cartões de crédito usados para sua assinatura.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Cartão
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                    <DialogDescription>
                      Insira os detalhes do seu novo cartão de pagamento.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addCardForm}>
                    <form onSubmit={addCardForm.handleSubmit(handleAddCard)} className="grid gap-4 py-4">
                      <FormField
                        control={addCardForm.control}
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
                        control={addCardForm.control}
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
                          control={addCardForm.control}
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
                          control={addCardForm.control}
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
                      <DialogFooter>
                        <Button type="submit">Salvar Cartão</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Número (final)</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentCards.length > 0 ? (
                    paymentCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.cardName}</TableCell>
                        <TableCell>{card.cardNumber}</TableCell>
                        <TableCell>{card.expiryDate}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isEditCardDialogOpen && editingCard?.id === card.id} onOpenChange={(open) => {
                            setIsEditCardDialogOpen(open);
                            if (!open) setEditingCard(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mr-2"
                                onClick={() => setEditingCard(card)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Editar Cartão</DialogTitle>
                                <DialogDescription>
                                  Altere os detalhes do seu cartão de pagamento.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editCardForm}>
                                <form onSubmit={editCardForm.handleSubmit(handleEditCard)} className="grid gap-4 py-4">
                                  <FormField
                                    control={editCardForm.control}
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
                                    control={editCardForm.control}
                                    name="cardName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Nome no Cartão</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={editCardForm.control}
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
                                      control={editCardForm.control}
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
                                  <DialogFooter>
                                    <Button type="submit">Salvar Alterações</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                disabled={paymentCards.length <= 1} // Desabilita se for o último cartão
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o cartão &quot;{card.cardNumber}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCard(card.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum cartão cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionDetailsPage;