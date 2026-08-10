-- Sync remote migration 20260810020830: default avatar Female/ElfF32

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1), 'Dungeon Master'),
    COALESCE(NEW.raw_user_meta_data ->> 'image', 'Female/ElfF32')
  );
  RETURN NEW;
END;
$$;
