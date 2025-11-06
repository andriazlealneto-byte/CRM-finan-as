"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext";
import { Checkbox } from "@/components/ui/checkbox";

const budgetFormSchema = z.object({
  miscExpensesLimit: z.coerce.number().min(0, "O limite deve ser um valor positivo."),
  foodExpensesLimit: z.coerce.number().min(0, "O limite deve ser um valor positivo."),
  miscCategories: z.array(z.string()).optional(),
  foodCategories: z.array(z.string()).optional(),
});

const BudgetManagementPage = () => {
  const {
    miscExpensesLimit, setMiscExpensesLimit,
    foodExpensesLimit, setFoodExpensesLimit,
    miscCategories, setMiscCategories,
    foodCategories, setFoodCategories,
    savedCategories,
  } = useTransactionContext();

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      miscExpensesLimit: miscExpensesLimit,
      foodExpensesLimit: foodExpensesLimit,
      miscCategories: miscCategories,
      foodCategories: foodCategories,
    },
  });

  React.useEffect(() => {
    form.reset({
      miscExpensesLimit: miscExpensesLimit,
      foodExpensesLimit: foodExpensesLimit,
      miscCategories: miscCategories,
      foodCategories: foodCategories,
    });
  }, [miscExpensesLimit, foodExpensesLimit, miscCategories, foodCategories, form]);

  const onSubmit = (values: z.infer<typeof budgetFormSchema>) => {
    setMiscExpensesLimit(values.miscExpensesLimit);
    setFoodExpensesLimit(values.foodExpensesLimit);
    setMiscCategories(values.miscCategories || []);
    setFoodCategories(values.foodCategories || []);
    toast.success("Configurações de orçamento salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Orçamentos</h1>
      <p className="text-muted-foreground">Defina limites de gastos e associe categorias para acompanhar seus orçamentos de forma eficaz.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orçamento de Gastos Bestas</CardTitle>
              <CardDescription>Defina um limite mensal e selecione as categorias que se enquadram em "Gastos Bestas".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="miscExpensesLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Gastos Bestas (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="miscCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categorias de Gastos Bestas</FormLabel>
                      <FormDescription>
                        Selecione as categorias que você considera "Gastos Bestas".
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {savedCategories.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
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
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamento de Comida</CardTitle>
              <CardDescription>Defina um limite mensal e selecione as categorias relacionadas a "Comida".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="foodExpensesLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Gastos com Comida (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categorias de Comida</FormLabel>
                      <FormDescription>
                        Selecione as categorias que você considera "Comida".
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {savedCategories.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
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
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit">Salvar Orçamentos</Button>
        </form>
      </Form>
    </div>
  );
};

export default BudgetManagementPage;