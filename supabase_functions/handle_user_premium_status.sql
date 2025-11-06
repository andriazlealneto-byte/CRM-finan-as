CREATE OR REPLACE FUNCTION public.handle_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    IF NEW.is_premium = FALSE THEN
      -- User cancelled subscription, disable login
      UPDATE auth.users
      SET disabled = TRUE
      WHERE id = NEW.id;
      RAISE NOTICE 'User % (ID: %) login disabled due to subscription cancellation.', NEW.first_name, NEW.id;
    ELSE
      -- User reactivated subscription, enable login
      UPDATE auth.users
      SET disabled = FALSE
      WHERE id = NEW.id;
      RAISE NOTICE 'User % (ID: %) login enabled due to subscription reactivation.', NEW.first_name, NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;