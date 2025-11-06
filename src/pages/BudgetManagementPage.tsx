"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Keep original Button for type, but use GlassButton
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Keep original Card for type, but use GlassCard
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GlassCard from "@/components/GlassCard"; // Import GlassCard
import GlassButton from "@/components/GlassButton"; // Import GlassButton

const defaultBudgetFormSchema = z.object({
  miscBudgetName: z.string().min(1, "O nome do orçamento é obrigatório.").max(50, "O nome não pode ter mais de 50 caracteres."),
  miscExpensesLimit: z.coerce.number().min(0, "O limite deve ser um valor positivo."),
  miscCategories: z.array(z.string()).optional(),
  foodBudgetName: z.string().min(1, "O nome do orçamento é obrigatório.").max(50, "O nome não pode ter mais de 50 caracteres."),
  foodExpensesLimit: z.coerce.number().min(0, "O limite deve ser um valor positivo."),
  foodCategories: z.array(z.string()).optional(),
});

const customBudgetFormSchema = z.object({
  name: z.string().min(1, "O nome do orçamento é obrigatório.").max(50, "O nome não pode ter mais de 50 caracteres."),
  limit: z.coerce.number().min(0, "O limite deve ser um valor positivo."),
  categories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria para o orçamento."),
});

const BudgetManagementPage = () => {
  const {
    miscExpensesLimit, setMiscExpensesLimit,
    foodExpensesLimit, setFoodExpensesLimit,
    miscCategories, setMiscCategories,
    foodCategories, setFoodCategories,
    savedCategories,
    userProfile, updateUserProfile,
    customBudgets, addCustomBudget, updateCustomBudget, deleteCustomBudget,
  } = useTransactionContext();

  const [isAddCustomBudgetDialogOpen, setIsAddCustomBudgetDialogOpen] = React.useState(false);
  const [isEditCustomBudgetDialogOpen, setIsEditCustomBudgetDialogOpen] = React.useState(false);
  const [editingCustomBudget, setEditingCustomBudget] = React.useState<z.infer<typeof customBudgetFormSchema> & { id: string } | null>(null);

  const defaultBudgetForm = useForm<z.infer<typeof defaultBudgetFormSchema>>({
    resolver: zodResolver(defaultBudgetFormSchema),
    defaultValues: {
      miscBudgetName: userProfile?.misc_budget_name || "Gastos Bestas",
      miscExpensesLimit: miscExpensesLimit,
      miscCategories: miscCategories,
      foodBudgetName: userProfile?.food_budget_name || "Comida",
      foodExpensesLimit: foodExpensesLimit,
      foodCategories: foodCategories,
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      defaultBudgetForm.reset({
        miscBudgetName: userProfile.misc_budget_name || "Gastos Bestas",
        miscExpensesLimit: miscExpensesLimit,
        miscCategories: miscCategories,
        foodBudgetName: userProfile.food_budget_name || "Comida",
        foodExpensesLimit: foodExpensesLimit,
        foodCategories: foodCategories,
      });
    }
  }, [userProfile, miscExpensesLimit, foodExpensesLimit, miscCategories, foodCategories, defaultBudgetForm]);

  React.useEffect(() => {
    if (editingCustomBudget) {
      customBudgetForm.reset({
        name: editingCustomBudget.name,
        limit: editingCustomBudget.limit,
        categories: editingCustomBudget.categories,
      });
    }
  }, [editingCustomBudget, customBudgetForm]);

  const onDefaultBudgetSubmit = async (values: z.infer<typeof defaultBudgetFormSchema>) => {
    await updateUserProfile({
      misc_budget_name: values.miscBudgetName,
      food_budget_name: values.foodBudgetName,
    });
    setMiscExpensesLimit(values.miscExpensesLimit);
    setFoodExpensesLimit(values.foodExpensesLimit);
    setMiscCategories(values.miscCategories || []);
    setFoodCategories(values.foodCategories || []);
    toast.success("Configurações de orçamentos padrão salvas com sucesso!");
  };

  const onAddCustomBudgetSubmit = async (values: z.infer<typeof customBudgetFormSchema>) => {
    await addCustomBudget({
      name: values.name,
      limit: values.limit,
      categories: values.categories,
    });
    customBudgetForm.reset();
    setIsAddCustomBudgetDialogOpen(false);
  };

  const onEditCustomBudgetSubmit = async (values: z.infer<typeof customBudgetFormSchema>) => {
    if (editingCustomBudget) {
      await updateCustomBudget(editingCustomBudget.id, {
        name: values.name,
        limit: values.limit,
        categories: values.categories,
      });
      setIsEditCustomBudgetDialogOpen(false);
      setEditingCustomBudget(null);
    }
  };

  const onDeleteCustomBudget = async (id: string, name: string) => {
    await deleteCustomBudget(id);
    toast.success(`Orçamento "${name}" excluído com sucesso!`);
  };

  if (!userProfile?.show_budgets) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Orçamentos Desativados</h1>
        <p className="text-muted-foreground">
          Esta seção está desativada nas suas configurações de perfil.
          Ative-a na página de Perfil para gerenciar seus orçamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Orçamentos</h1>
      <p className="text-muted-foreground">Defina limites de gastos e associe categorias para acompanhar seus orçamentos de forma eficaz.</p>

      <Form {...defaultBudgetForm}>
        <form onSubmit={defaultBudgetForm.handleSubmit(onDefaultBudgetSubmit)} className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Orçamento Padrão: {userProfile?.misc_budget_name || "Gastos Bestas"}</CardTitle>
              <CardDescription>Defina um limite mensal e selecione as categorias para este orçamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={defaultBudgetForm.control}
                name="miscBudgetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Orçamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lazer, Gastos Pessoais" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={defaultBudgetForm.control}
                name="miscExpensesLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Gastos (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={defaultBudgetForm.control}
                name="miscCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categorias Associadas</FormLabel>
                      <FormDescription>
                        Selecione as categorias que se enquadram neste orçamento.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {savedCategories.length > 0 ? (
                        savedCategories.map((category) => (
                          <FormField
                            key={category}
                            control={defaultBudgetForm.control}
                            name="miscCategories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), category])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {category}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-full">Nenhuma categoria criada. Crie categorias na seção 'Categorias'.</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardHeader>
              <CardTitle>Orçamento Padrão: {userProfile?.food_budget_name || "Comida"}</CardTitle>
              <CardDescription>Defina um limite mensal e selecione as categorias para este orçamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={defaultBudgetForm.control}
                name="foodBudgetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Orçamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Alimentação, Restaurantes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={defaultBudgetForm.control}
                name="foodExpensesLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Gastos (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={defaultBudgetForm.control}
                name="foodCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categorias Associadas</FormLabel>
                      <FormDescription>
                        Selecione as categorias que se enquadram neste orçamento.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {savedCategories.length > 0 ? (
                        savedCategories.map((category) => (
                          <FormField
                            key={category}
                            control={defaultBudgetForm.control}
                            name="foodCategories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), category])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {category}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-full">Nenhuma categoria criada. Crie categorias na seção 'Categorias'.</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </GlassCard>

          <GlassButton type="submit">Salvar Orçamentos Padrão</GlassButton>
        </form>
      </Form>

      <h2 className="text-2xl font-bold mt-8">Orçamentos Personalizados</h2>
      <p className="text-muted-foreground">Crie orçamentos adicionais para categorias específicas que você deseja monitorar.</p>

      <div className="flex justify-end">
        <Dialog open={isAddCustomBudgetDialogOpen} onOpenChange={setIsAddCustomBudgetDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Novo Orçamento
            </GlassButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Orçamento Personalizado</DialogTitle>
              <DialogDescription>
                Defina o nome, limite e categorias para seu novo orçamento.
              </DialogDescription>
            </DialogHeader>
            <Form {...customBudgetForm}>
              <form onSubmit={customBudgetForm.handleSubmit(onAddCustomBudgetSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={customBudgetForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Orçamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Viagem, Educação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customBudgetForm.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Gastos (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customBudgetForm.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Categorias Associadas</FormLabel>
                        <FormDescription>
                          Selecione as categorias que se enquadram neste orçamento.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {savedCategories.length > 0 ? (
                          savedCategories.map((category) => (
                            <FormField
                              key={category}
                              control={customBudgetForm.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), category])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== category
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {category}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))
                        ) : (
                          <p className="text-muted-foreground col-span-full">Nenhuma categoria criada. Crie categorias na seção 'Categorias'.</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <GlassButton type="submit">Salvar Orçamento</GlassButton>
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
              <TableHead>Orçamento</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customBudgets.length > 0 ? (
              customBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.name}</TableCell>
                  <TableCell>{budget.limit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{budget.categories.join(", ")}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditCustomBudgetDialogOpen && editingCustomBudget?.id === budget.id} onOpenChange={(open) => {
                      setIsEditCustomBudgetDialogOpen(open);
                      if (!open) setEditingCustomBudget(null);
                    }}>
                      <DialogTrigger asChild>
                        <GlassButton
                          variant="ghost"
                          size="icon"
                          className="mr-2"
                          onClick={() => setEditingCustomBudget(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </GlassButton>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Orçamento Personalizado</DialogTitle>
                          <DialogDescription>
                            Altere os detalhes do seu orçamento.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...customBudgetForm}>
                          <form onSubmit={customBudgetForm.handleSubmit(onEditCustomBudgetSubmit)} className="grid gap-4 py-4">
                            <FormField
                              control={customBudgetForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Orçamento</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={customBudgetForm.control}
                              name="limit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Limite de Gastos (R$)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={customBudgetForm.control}
                              name="categories"
                              render={() => (
                                <FormItem>
                                  <div className="mb-4">
                                    <FormLabel className="text-base">Categorias Associadas</FormLabel>
                                    <FormDescription>
                                      Selecione as categorias que se enquadram neste orçamento.
                                    </FormDescription>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {savedCategories.length > 0 ? (
                                      savedCategories.map((category) => (
                                        <FormField
                                          key={category}
                                          control={customBudgetForm.control}
                                          name="categories"
                                          render={({ field }) => {
                                            return (
                                              <FormItem
                                                key={category}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(category)}
                                                    onCheckedChange={(checked) => {
                                                      return checked
                                                        ? field.onChange([...(field.value || []), category])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                              (value) => value !== category
                                                            )
                                                          );
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                  {category}
                                                </FormLabel>
                                              </FormItem>
                                            );
                                          }}
                                        />
                                      ))
                                    ) : (
                                      <p className="text-muted-foreground col-span-full">Nenhuma categoria criada. Crie categorias na seção 'Categorias'.</p>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <GlassButton type="submit">Salvar Alterações</GlassButton>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <GlassButton
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </GlassButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o orçamento &quot;{budget.name}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteCustomBudget(budget.id, budget.name)}>
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
                  Nenhum orçamento personalizado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BudgetManagementPage;