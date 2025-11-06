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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const debtFormSchema = z.object({
  name: z.string().min(1, "O nome da dívida é obrigatório.").max(100, "O nome da dívida não pode ter mais de 100 caracteres."),
  total_amount: z.coerce.number().positive("O valor total deve ser positivo."),
  paid_amount: z.coerce.number().min(0, "O valor pago não pode ser negativo.").optional(),
  installments: z.coerce.number().min(1, "O número de parcelas deve ser no mínimo 1."),
  current_installment: z.coerce.number().min(1, "A parcela atual deve ser no mínimo 1.").optional(),
  due_date: z.date({
    required_error: "A data de vencimento é obrigatória.",
  }),
  status: z.enum(["pending", "paid", "overdue"], {
    required_error: "O status é obrigatório.",
  }).default("pending"),
});

const DebtsPage = () => {
  const { debts, addDebt, updateDebt, deleteDebt } = useTransactionContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingDebt, setEditingDebt] = React.useState<z.infer<typeof debtFormSchema> & { id: string } | null>(null);

  const addForm = useForm<z.infer<typeof debtFormSchema>>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: "",
      total_amount: 0,
      paid_amount: 0,
      installments: 1,
      current_installment: 1,
      due_date: undefined,
      status: "pending",
    },
  });

  const editForm = useForm<z.infer<typeof debtFormSchema>>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: "",
      total_amount: 0,
      paid_amount: 0,
      installments: 1,
      current_installment: 1,
      due_date: undefined,
      status: "pending",
    },
  });

  React.useEffect(() => {
    if (editingDebt) {
      editForm.reset({
        name: editingDebt.name,
        total_amount: editingDebt.total_amount,
        paid_amount: editingDebt.paid_amount,
        installments: editingDebt.installments,
        current_installment: editingDebt.current_installment,
        due_date: new Date(editingDebt.due_date),
        status: editingDebt.status,
      });
    }
  }, [editingDebt, editForm]);

  const handleAddDebt = async (values: z.infer<typeof debtFormSchema>) => {
    await addDebt({
      name: values.name,
      total_amount: values.total_amount,
      paid_amount: values.paid_amount || 0,
      installments: values.installments,
      current_installment: values.current_installment || 1,
      due_date: format(values.due_date, "yyyy-MM-dd"),
      status: values.status,
    });
    addForm.reset();
    setIsAddDialogOpen(false);
  };

  const handleEditDebt = async (values: z.infer<typeof debtFormSchema>) => {
    if (editingDebt) {
      await updateDebt(editingDebt.id, {
        name: values.name,
        total_amount: values.total_amount,
        paid_amount: values.paid_amount,
        installments: values.installments,
        current_installment: values.current_installment,
        due_date: format(values.due_date, "yyyy-MM-dd"),
        status: values.status,
      });
      setIsEditDialogOpen(false);
      setEditingDebt(null);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    await deleteDebt(id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Dívidas e Parcelamentos</h1>
      <p className="text-muted-foreground">Acompanhe suas dívidas, parcelas e prazos de pagamento.</p>

      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Dívida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Dívida</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da sua dívida ou parcelamento.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddDebt)} className="grid gap-4 py-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Dívida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Empréstimo carro, Cartão de crédito" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="paid_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Pago (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="current_installment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcela Atual</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento (Parcela Atual)</FormLabel>
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
                            selected={field.value}
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
                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="overdue">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Salvar Dívida</Button>
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
              <TableHead>Dívida</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.length > 0 ? (
              debts.map((debt) => {
                const remainingAmount = debt.total_amount - debt.paid_amount;
                const isOverdue = new Date(debt.due_date) < new Date() && debt.status === 'pending';
                const statusColor = isOverdue ? "text-red-500" : debt.status === 'paid' ? "text-green-500" : "text-yellow-500";

                return (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.name}</TableCell>
                    <TableCell>{debt.total_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell>{debt.paid_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell>{debt.current_installment}/{debt.installments}</TableCell> {/* CORRIGIDO AQUI */}
                    <TableCell>{format(new Date(debt.due_date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className={statusColor}>{debt.status === 'pending' ? 'Pendente' : debt.status === 'paid' ? 'Pago' : 'Atrasado'}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isEditDialogOpen && editingDebt?.id === debt.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingDebt(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2"
                            onClick={() => setEditingDebt(debt)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Dívida</DialogTitle>
                            <DialogDescription>
                              Altere os detalhes da sua dívida.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(handleEditDebt)} className="grid gap-4 py-4">
                              <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome da Dívida</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="total_amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Total (R$)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="paid_amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Pago (R$)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="installments"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Total de Parcelas</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="current_installment"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Parcela Atual</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="due_date"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Data de Vencimento (Parcela Atual)</FormLabel>
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
                                          selected={field.value}
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
                              <FormField
                                control={editForm.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="overdue">Atrasado</SelectItem>
                                      </SelectContent>
                                    </Select>
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
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a dívida &quot;{debt.name}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDebt(debt.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma dívida encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DebtsPage;