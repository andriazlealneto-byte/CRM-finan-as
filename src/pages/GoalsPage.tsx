"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, CalendarIcon, TrendingUp, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, differenceInMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

// Função para calcular o valor futuro de uma série de pagamentos (anuidade)
const calculateFutureValue = (
  currentInvestments: number,
  monthlyContribution: number,
  annualReturnRate: number,
  months: number
) => {
  const monthlyRate = annualReturnRate / 100 / 12;
  let futureValue = currentInvestments;

  if (monthlyRate === 0) {
    futureValue += monthlyContribution * months;
  } else {
    futureValue = currentInvestments * Math.pow(1 + monthlyRate, months) +
                  monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }
  return futureValue;
};

const goalFormSchema = z.object({
  name: z.string().min(1, "O nome da meta é obrigatório.").max(100, "O nome da meta não pode ter mais de 100 caracteres."),
  target_amount: z.coerce.number().positive("O valor alvo deve ser positivo.").optional(),
  current_amount: z.coerce.number().min(0, "O valor atual não pode ser negativo.").optional(),
  due_date: z.date({
    required_error: "A data limite é obrigatória.",
  }),
  is_financial_freedom_goal: z.boolean().default(false).optional(),
  target_monthly_income: z.coerce.number().min(0, "A renda mensal alvo deve ser positiva.").optional().nullable(),
  current_investments: z.coerce.number().min(0, "O valor investido atual não pode ser negativo.").optional().nullable(),
  annual_return_rate: z.coerce.number().min(0, "A taxa de retorno anual deve ser positiva.").max(100, "A taxa de retorno anual não pode ser maior que 100%.").optional().nullable(),
  monthly_contribution: z.coerce.number().min(0, "A contribuição mensal não pode ser negativa.").optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.is_financial_freedom_goal) {
    if (!data.target_monthly_income || data.target_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A renda mensal alvo é obrigatória para metas de liberdade financeira.",
        path: ["target_monthly_income"],
      });
    }
    if (data.current_investments === null || data.current_investments === undefined || data.current_investments < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor investido atual é obrigatório para metas de liberdade financeira.",
        path: ["current_investments"],
      });
    }
    if (!data.annual_return_rate || data.annual_return_rate <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A taxa de retorno anual é obrigatória para metas de liberdade financeira.",
        path: ["annual_return_rate"],
      });
    }
    if (data.monthly_contribution === null || data.monthly_contribution === undefined || data.monthly_contribution < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A contribuição mensal é obrigatória para metas de liberdade financeira.",
        path: ["monthly_contribution"],
      });
    }
    // For financial freedom goals, target_amount is calculated, not directly set
    // But we need a placeholder for the schema, so we'll ensure it's not used directly.
  } else {
    if (!data.target_amount || data.target_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor alvo é obrigatório para metas normais.",
        path: ["target_amount"],
      });
    }
  }
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
      is_financial_freedom_goal: false,
      target_monthly_income: null,
      current_investments: null,
      annual_return_rate: null,
      monthly_contribution: null,
    },
  });

  const editForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      target_amount: 0,
      current_amount: 0,
      due_date: undefined,
      is_financial_freedom_goal: false,
      target_monthly_income: null,
      current_investments: null,
      annual_return_rate: null,
      monthly_contribution: null,
    },
  });

  React.useEffect(() => {
    if (editingGoal) {
      editForm.reset({
        name: editingGoal.name,
        target_amount: editingGoal.target_amount || 0,
        current_amount: editingGoal.current_amount || 0,
        due_date: parseISO(editingGoal.due_date),
        is_financial_freedom_goal: editingGoal.is_financial_freedom_goal || false,
        target_monthly_income: editingGoal.target_monthly_income || null,
        current_investments: editingGoal.current_investments || null,
        annual_return_rate: editingGoal.annual_return_rate || null,
        monthly_contribution: editingGoal.monthly_contribution || null,
      });
    }
  }, [editingGoal, editForm]);

  const handleAddGoal = async (values: z.infer<typeof goalFormSchema>) => {
    await addGoal({
      name: values.name,
      target_amount: values.is_financial_freedom_goal ? 0 : values.target_amount || 0, // Target amount is not directly set for FF goals
      current_amount: values.current_amount || 0,
      due_date: format(values.due_date, "yyyy-MM-dd"),
      is_financial_freedom_goal: values.is_financial_freedom_goal,
      target_monthly_income: values.target_monthly_income,
      current_investments: values.current_investments,
      annual_return_rate: values.annual_return_rate,
      monthly_contribution: values.monthly_contribution,
    });
    addForm.reset();
    setIsAddDialogOpen(false);
  };

  const handleEditGoal = async (values: z.infer<typeof goalFormSchema>) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        name: values.name,
        target_amount: values.is_financial_freedom_goal ? 0 : values.target_amount || 0,
        current_amount: values.current_amount,
        due_date: format(values.due_date, "yyyy-MM-dd"),
        is_financial_freedom_goal: values.is_financial_freedom_goal,
        target_monthly_income: values.target_monthly_income,
        current_investments: values.current_investments,
        annual_return_rate: values.annual_return_rate,
        monthly_contribution: values.monthly_contribution,
      });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
  };

  const renderFinancialFreedomDetails = (goal: z.infer<typeof goalFormSchema> & { id: string }) => {
    if (!goal.is_financial_freedom_goal || !goal.target_monthly_income || !goal.annual_return_rate) {
      return null;
    }

    const targetCapital = (goal.target_monthly_income * 12) / (goal.annual_return_rate / 100);
    const monthsRemaining = differenceInMonths(parseISO(goal.due_date), new Date());
    const currentInvestments = goal.current_investments || 0;
    const monthlyContribution = goal.monthly_contribution || 0;
    const annualReturnRate = goal.annual_return_rate || 0;

    let projectedFutureValue = 0;
    if (monthsRemaining > 0) {
      projectedFutureValue = calculateFutureValue(currentInvestments, monthlyContribution, annualReturnRate, monthsRemaining);
    } else {
      projectedFutureValue = currentInvestments; // If due date is past or today, just use current investments
    }

    const progress = (projectedFutureValue / targetCapital) * 100;
    const isAchieved = projectedFutureValue >= targetCapital;

    return (
      <div className="mt-2 text-sm text-muted-foreground space-y-1">
        <p>Capital Alvo: {targetCapital.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p>Investimento Atual: {currentInvestments.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p>Contribuição Mensal: {monthlyContribution.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p>Retorno Anual: {annualReturnRate}%</p>
        <p>Valor Projetado: {projectedFutureValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <div className="flex items-center gap-2">
          <Progress value={Math.min(100, progress)} className="w-[100px]" />
          <span className="text-sm text-muted-foreground">
            {progress.toFixed(0)}%
          </span>
        </div>
        {isAchieved && <span className="text-xs text-green-500">Meta de Liberdade Financeira Atingida!</span>}
        {!isAchieved && monthsRemaining <= 0 && <span className="text-xs text-red-500">Data limite atingida, meta não alcançada.</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Metas Financeiras</h1>
      <p className="text-muted-foreground">Crie e acompanhe suas metas de economia e investimento, incluindo a liberdade financeira.</p>

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
                <FormField
                  control={addForm.control}
                  name="is_financial_freedom_goal"
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
                          Meta de Liberdade Financeira?
                        </FormLabel>
                        <FormDescription>
                          Marque se esta meta for para atingir a liberdade financeira.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!addForm.watch("is_financial_freedom_goal") ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <FormField
                      control={addForm.control}
                      name="target_monthly_income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renda Mensal Alvo (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3000.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="current_investments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investimento Atual (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10000.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="annual_return_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Retorno Anual (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="monthly_contribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribuição Mensal (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
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
                const isFinancialFreedom = goal.is_financial_freedom_goal;
                const progress = isFinancialFreedom && goal.target_monthly_income && goal.annual_return_rate
                  ? ((calculateFutureValue(goal.current_investments || 0, goal.monthly_contribution || 0, goal.annual_return_rate, differenceInMonths(parseISO(goal.due_date), new Date())) / ((goal.target_monthly_income * 12) / (goal.annual_return_rate / 100))) * 100)
                  : (goal.current_amount && goal.target_amount ? (goal.current_amount / goal.target_amount) * 100 : 0);
                
                const isCompleted = isFinancialFreedom 
                  ? (goal.target_monthly_income && goal.annual_return_rate && calculateFutureValue(goal.current_investments || 0, goal.monthly_contribution || 0, goal.annual_return_rate, differenceInMonths(parseISO(goal.due_date), new Date())) >= ((goal.target_monthly_income * 12) / (goal.annual_return_rate / 100)))
                  : (goal.current_amount && goal.target_amount && goal.current_amount >= goal.target_amount);
                
                const isOverdue = parseISO(goal.due_date) < new Date() && !isCompleted;

                return (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">
                      {goal.name}
                      {isFinancialFreedom && <span className="ml-2 text-xs text-primary">(Liberdade Financeira)</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, progress)} className="w-[100px]" />
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      {isOverdue && <span className="text-xs text-red-500">Atrasada!</span>}
                      {isCompleted && <span className="text-xs text-green-500">Concluída!</span>}
                      {isFinancialFreedom && renderFinancialFreedomDetails(goal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isFinancialFreedom && goal.target_monthly_income && goal.annual_return_rate
                        ? ((goal.target_monthly_income * 12) / (goal.annual_return_rate / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : (goal.target_amount?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "N/A")}
                    </TableCell>
                    <TableCell className="text-right">
                      {isFinancialFreedom && goal.current_investments
                        ? goal.current_investments.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : (goal.current_amount?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "N/A")}
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
                              <FormField
                                control={editForm.control}
                                name="is_financial_freedom_goal"
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
                                        Meta de Liberdade Financeira?
                                      </FormLabel>
                                      <FormDescription>
                                        Marque se esta meta for para atingir a liberdade financeira.
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />

                              {!editForm.watch("is_financial_freedom_goal") ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <FormField
                                    control={editForm.control}
                                    name="target_monthly_income"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Renda Mensal Alvo (R$)</FormLabel>
                                        <FormControl>
                                          <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="current_investments"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Investimento Atual (R$)</FormLabel>
                                        <FormControl>
                                          <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="annual_return_rate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Taxa de Retorno Anual (%)</FormLabel>
                                        <FormControl>
                                          <Input type="number" placeholder="8" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="monthly_contribution"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Contribuição Mensal (R$)</FormLabel>
                                        <FormControl>
                                          <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </>
                              )}
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