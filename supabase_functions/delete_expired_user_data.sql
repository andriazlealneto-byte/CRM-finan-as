CREATE OR REPLACE FUNCTION public.delete_expired_user_data()
RETURNS void AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  FOR user_id_to_delete IN
    SELECT id
    FROM public.profiles
    WHERE is_premium = FALSE
      AND data_retention_until IS NOT NULL
      AND data_retention_until < CURRENT_DATE
  LOOP
    RAISE NOTICE 'Deleting data for user ID: %', user_id_to_delete;

    -- Delete from all relevant tables
    DELETE FROM public.transactions WHERE user_id = user_id_to_delete;
    DELETE FROM public.future_expenses WHERE user_id = user_id_to_delete;
    DELETE FROM public.saved_categories WHERE user_id = user_id_to_delete;
    DELETE FROM public.user_budgets WHERE user_id = user_id_to_delete;
    DELETE FROM public.goals WHERE user_id = user_id_to_delete;
    DELETE FROM public.debts WHERE user_id = user_id_to_delete;
    DELETE FROM public.subscriptions WHERE user_id = user_id_to_delete;
    
    -- Finally, delete the profile and the user from auth.users
    DELETE FROM public.profiles WHERE id = user_id_to_delete;
    DELETE FROM auth.users WHERE id = user_id_to_delete;

    RAISE NOTICE 'Data for user ID: % deleted successfully.', user_id_to_delete;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;