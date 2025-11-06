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
import { format, parseISO } from "date-fns"; // Importar parseISO
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const goalFormSchema = z.object({
  name: z.string().min(1, "O nome da meta é obrigatório.").max(100, "O nome da meta não pode ter mais de 100 caracteres."),
  target_amount: z.coerce.number().positive("O valor alvo deve ser positivo."),
  current_amount: z.coerce.number().min(0, "O valor atual não pode ser negativo.").optional(),
  due_date: z.date({
    required_error: "A data limite é obrigatória.",
  }),
});

const GoalsPage = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useTransactionContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<z.infer<typeof goalFormSchema> & { id: string } | null>(null);

  const addForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      target_amount: 0,
      current_amount: 0,
      due_date: undefined,
    },
  });

  const editForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      target_amount: 0,
      current_amount: 0,
      due_date: undefined,
    },
  });

  React.useEffect(() => {
    if (editingGoal) {
      editForm.reset({
        name: editingGoal.name,
        target_amount: editingGoal.target_amount,
        current_amount: editingGoal.current_amount,
        due_date: parseISO(editingGoal.due_date), // Usar parseISO
      });
    }
  }, [editingGoal, editForm]);

  const handleAddGoal = async (values: z.infer<typeof goalFormSchema>) => {
    await addGoal({
      name: values.name,
      target_amount: values.target_amount,
      current_amount: values.current_amount || 0,
      due_date: format(values.due_date, "yyyy-MM-dd"),
    });
    addForm.reset();
    setIsAddDialogOpen(false);
  };

  const handleEditGoal = async (values: z.infer<typeof goalFormSchema>) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        name: values.name,
        target_amount: values.target_amount,
        current_amount: values.current_amount,
        due_date: format(values.due_date, "yyyy-MM-dd"),
      });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Metas Financeiras</h1>
      <p className="text-muted-foreground">Crie e acompanhe suas metas de economia e investimento.</p>

      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Meta</DialogTitle>
              <DialogDescription>
                Defina sua nova meta financeira.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddGoal)} className="grid gap-4 py-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Meta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Comprar carro, Reserva de emergência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Alvo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="current_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Atual (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
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
                      <FormLabel>Data Limite</FormLabel>
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
                <DialogFooter>
                  <Button type="submit">Salvar Meta</Button>
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
              <TableHead>Meta</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Valor Alvo</TableHead>
              <TableHead className="text-right">Valor Atual</TableHead>
              <TableHead className="text-right">Data Limite</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const isCompleted = goal.current_amount >= goal.target_amount;
                const isOverdue = parseISO(goal.due_date) < new Date() && !isCompleted; // Usar parseISO

                return (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">{goal.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-[100px]" />
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      {isOverdue && <span className="text-xs text-red-500">Atrasada!</span>}
                      {isCompleted && <span className="text-xs text-green-500">Concluída!</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {goal.target_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="text-right">
                      {goal.current_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="text-right">
                      {format(parseISO(goal.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isEditDialogOpen && editingGoal?.id === goal.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingGoal(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Meta</DialogTitle>
                            <DialogDescription>
                              Altere os detalhes da sua meta.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(handleEditGoal)} className="grid gap-4 py-4">
                              <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome da Meta</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="target_amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Alvo (R$)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="current_amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Atual (R$)</FormLabel>
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
                                    <FormLabel>Data Limite</FormLabel>
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
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a meta &quot;{goal.name}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma meta financeira encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GoalsPage;