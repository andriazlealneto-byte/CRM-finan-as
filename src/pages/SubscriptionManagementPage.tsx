"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const subscriptionFormSchema = z.object({
  name: z.string().min(1, "O nome da assinatura é obrigatório.").max(100, "O nome não pode ter mais de 100 caracteres."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  next_due_date: z.date().optional().nullable(),
});

const SubscriptionManagementPage = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, userProfile, updateUserProfile } = useTransactionContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingSubscription, setEditingSubscription] = React.useState<z.infer<typeof subscriptionFormSchema> & { id: string } | null>(null);
  const navigate = useNavigate();

  const addForm = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      next_due_date: undefined,
    },
  });

  const editForm = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      next_due_date: undefined,
    },
  });

  React.useEffect(() => {
    if (editingSubscription) {
      editForm.reset({
        name: editingSubscription.name,
        amount: editingSubscription.amount,
        next_due_date: editingSubscription.next_due_date ? parseISO(editingSubscription.next_due_date) : undefined,
      });
    }
  }, [editingSubscription, editForm]);

  const handleAddSubscription = async (values: z.infer<typeof subscriptionFormSchema>) => {
    await addSubscription({
      name: values.name,
      amount: values.amount,
      next_due_date: values.next_due_date ? format(values.next_due_date, "yyyy-MM-dd") : null,
    });
    addForm.reset();
    setIsAddDialogOpen(false);
  };

  const handleEditSubscription = async (values: z.infer<typeof subscriptionFormSchema>) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, {
        name: values.name,
        amount: values.amount,
        next_due_date: values.next_due_date ? format(values.next_due_date, "yyyy-MM-dd") : null,
      });
      setIsEditDialogOpen(false);
      setEditingSubscription(null);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    await deleteSubscription(id);
  };

  const handleCancelSubscription = async () => {
    await updateUserProfile({
      is_premium: false,
      subscription_type: null,
      subscription_end_date: null,
    });
    toast.success("Sua assinatura foi cancelada com sucesso.");
    navigate("/subscribe");
  };

  const totalMonthlySubscriptions = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  if (!userProfile?.show_subscriptions) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Assinaturas Desativadas</h1>
        <p className="text-muted-foreground">
          Esta seção está desativada nas suas configurações de perfil.
          Ative-a na página de Perfil para gerenciar suas assinaturas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Assinaturas</h1>
      <p className="text-muted-foreground">Liste suas assinaturas e veja o gasto total mensal.</p>

      <Card>
        <CardHeader>
          <CardTitle>Status da Sua Assinatura GPF</CardTitle>
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
                      Ao cancelar, você perderá o acesso aos recursos premium do GPF após a data de vencimento da sua assinatura.
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

      <Card>
        <CardHeader>
          <CardTitle>Gasto Total Mensal com Outras Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalMonthlySubscriptions.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-sm text-muted-foreground">
            Este é o valor total que você gasta por mês com todas as suas assinaturas externas.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Assinatura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Assinatura</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da sua assinatura.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddSubscription)} className="grid gap-4 py-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Assinatura</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Netflix, Spotify" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mensal (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="29.90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="next_due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Próxima Data de Vencimento (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Salvar Assinatura</Button>
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
              <TableHead>Assinatura</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Próximo Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>
                    {sub.next_due_date ? format(parseISO(sub.next_due_date), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditDialogOpen && editingSubscription?.id === sub.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) setEditingSubscription(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mr-2"
                          onClick={() => setEditingSubscription(sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Assinatura</DialogTitle>
                          <DialogDescription>
                            Altere os detalhes da sua assinatura.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...editForm}>
                          <form onSubmit={editForm.handleSubmit(handleEditSubscription)} className="grid gap-4 py-4">
                            <FormField
                              control={editForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome da Assinatura</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor Mensal (R$)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editForm.control}
                              name="next_due_date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Próxima Data de Vencimento (Opcional)</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value || undefined}
                                        onSelect={field.onChange}
                                        initialFocus
                                        locale={ptBR}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a assinatura &quot;{sub.name}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSubscription(sub.id)}>
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
                  Nenhuma assinatura encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionManagementPage;