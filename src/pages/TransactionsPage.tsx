"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, CalendarIcon, Trash2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext"; // Import useTransactionContext
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  isFixed?: boolean;
}

interface FutureExpense {
  id: string;
  dueDate: string;
  description: string;
  amount: number;
  category: string;
}

const transactionFormSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."), // Alterado para z.coerce.number()
  type: z.enum(["income", "expense"], {
    required_error: "O tipo é obrigatório.",
  }),
  category: z.string().min(1, "A categoria é obrigatória."),
  isFixed: z.boolean().default(false), // Novo campo para gasto fixo
});

const futureExpenseFormSchema = z.object({
  dueDates: z.array(z.date()).min(1, "Selecione pelo menos uma data de vencimento."), // Alterado para array de datas
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."), // Alterado para z.coerce.number()
  category: z.string().min(1, "A categoria é obrigatória."),
});

const TransactionsPage = () => {
  const { transactions, addTransaction, deleteTransaction, futureExpenses, addFutureExpense, deleteFutureExpense } = useTransactionContext();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = React.useState(false);
  const [isAddFutureExpenseDialogOpen, setIsAddFutureExpenseDialogOpen] = React.useState(false);
  const [selectedFilterDate, setSelectedFilterDate] = React.useState<Date | undefined>(undefined);

  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "", // Alterado para string vazia
      type: "expense",
      category: "",
      date: new Date(),
      isFixed: false,
    },
  });

  const futureExpenseForm = useForm<z.infer<typeof futureExpenseFormSchema>>({
    resolver: zodResolver(futureExpenseFormSchema),
    defaultValues: {
      description: "",
      amount: "", // Alterado para string vazia
      category: "",
      dueDates: [], // Inicializa como array vazio
    },
  });

  const handleAddTransaction = (values: z.infer<typeof transactionFormSchema>) => {
    addTransaction({
      date: format(values.date, "yyyy-MM-dd"),
      description: values.description,
      amount: values.type === "expense" ? -values.amount : values.amount,
      type: values.type,
      category: values.category,
      isFixed: values.isFixed,
    });
    toast.success("Transação adicionada com sucesso!");
    transactionForm.reset();
    setIsAddTransactionDialogOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success("Transação excluída com sucesso!");
  };

  const handleAddFutureExpense = (values: z.infer<typeof futureExpenseFormSchema>) => {
    values.dueDates.forEach(date => {
      addFutureExpense({
        dueDate: format(date, "yyyy-MM-dd"),
        description: values.description,
        amount: values.amount,
        category: values.category,
      });
    });
    toast.success("Gasto(s) futuro(s) adicionado(s) com sucesso!");
    futureExpenseForm.reset();
    setIsAddFutureExpenseDialogOpen(false);
  };

  const handleDeleteFutureExpense = (id: string) => {
    deleteFutureExpense(id);
    toast.success("Gasto futuro excluído com sucesso!");
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    const transactionDate = new Date(transaction.date);
    const matchesDate = selectedFilterDate
      ? transactionDate.toDateString() === selectedFilterDate.toDateString()
      : true;

    return matchesSearch && matchesDate;
  });

  const filteredFutureExpenses = futureExpenses.filter(expense => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());

    const expenseDate = new Date(expense.dueDate);
    const matchesDate = selectedFilterDate
      ? expenseDate.toDateString() === selectedFilterDate.toDateString()
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transações e Gastos Futuros</h1>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações ou gastos futuros..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !selectedFilterDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedFilterDate ? (
                  format(selectedFilterDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Filtrar por data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedFilterDate}
                onSelect={setSelectedFilterDate}
                initialFocus
                locale={ptBR}
              />
              {selectedFilterDate && (
                <div className="p-2">
                  <Button variant="ghost" onClick={() => setSelectedFilterDate(undefined)} className="w-full">
                    Limpar filtro
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da sua transação.
                </DialogDescription>
              </DialogHeader>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(handleAddTransaction)} className="grid gap-4 py-4">
                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
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
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Salário, Aluguel, Compras" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} /> {/* Removido parseFloat do onChange */}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="income" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Receita
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="expense" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Despesa
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Alimentação, Transporte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="isFixed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Gasto Fixo
                          </FormLabel>
                          <FormDescription>
                            Marque se esta for uma despesa recorrente (ex: aluguel, mensalidade).
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Salvar Transação</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddFutureExpenseDialogOpen} onOpenChange={setIsAddFutureExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Adicionar Gasto Futuro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Gasto Futuro</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do seu gasto futuro e selecione as datas de vencimento.
                </DialogDescription>
              </DialogHeader>
              <Form {...futureExpenseForm}>
                <form onSubmit={futureExpenseForm.handleSubmit(handleAddFutureExpense)} className="grid gap-4 py-4">
                  <FormField
                    control={futureExpenseForm.control}
                    name="dueDates"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Datas de Vencimento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value || field.value.length === 0 && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value && field.value.length > 0 ? (
                                  `${field.value.length} data(s) selecionada(s)`
                                ) : (
                                  <span>Escolha as datas</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="multiple" // Alterado para seleção múltipla
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
                    control={futureExpenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aluguel, Conta de Luz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={futureExpenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} /> {/* Removido parseFloat do onChange */}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={futureExpenseForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Moradia, Contas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Salvar Gasto(s) Futuro(s)</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Transações Recentes</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{transaction.description} {transaction.isFixed && <span className="text-xs text-muted-foreground">(Fixo)</span>}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Gastos Futuros</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data de Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFutureExpenses.length > 0 ? (
              filteredFutureExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.dueDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right text-red-600">
                    - {expense.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFutureExpense(expense.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum gasto futuro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsPage;