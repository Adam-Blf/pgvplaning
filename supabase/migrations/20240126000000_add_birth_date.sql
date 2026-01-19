-- Migration: Add Birth Date to Profiles
-- Date: 2024-01-26
-- Description: Add birth_date field for birthday tracking in team calendar

-- ============================================
-- 1. ADD BIRTH_DATE COLUMN TO PROFILES
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- ============================================
-- 2. CREATE INDEX FOR BIRTHDAY QUERIES
-- ============================================

-- Index for efficient birthday lookups by month/day
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date
  ON public.profiles (EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
  WHERE birth_date IS NOT NULL;

-- ============================================
-- 3. FUNCTION TO GET TEAM BIRTHDAYS
-- ============================================

CREATE OR REPLACE FUNCTION get_team_birthdays(p_team_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  first_name TEXT,
  birth_date DATE,
  birth_month INTEGER,
  birth_day INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.first_name,
    p.birth_date,
    EXTRACT(MONTH FROM p.birth_date)::INTEGER as birth_month,
    EXTRACT(DAY FROM p.birth_date)::INTEGER as birth_day
  FROM public.profiles p
  JOIN public.team_members tm ON tm.user_id = p.id
  WHERE tm.team_id = p_team_id
    AND p.birth_date IS NOT NULL
  ORDER BY
    EXTRACT(MONTH FROM p.birth_date),
    EXTRACT(DAY FROM p.birth_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_team_birthdays TO authenticated;

-- ============================================
-- 4. FUNCTION TO GET UPCOMING BIRTHDAYS
-- ============================================

CREATE OR REPLACE FUNCTION get_upcoming_birthdays(p_team_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  first_name TEXT,
  birth_date DATE,
  next_birthday DATE,
  days_until INTEGER
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_this_year INTEGER := EXTRACT(YEAR FROM v_today);
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.first_name,
    p.birth_date,
    CASE
      WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
      THEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER)
      ELSE make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER)
    END as next_birthday,
    CASE
      WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
      THEN (make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
      ELSE (make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
    END as days_until
  FROM public.profiles p
  JOIN public.team_members tm ON tm.user_id = p.id
  WHERE tm.team_id = p_team_id
    AND p.birth_date IS NOT NULL
    AND (
      CASE
        WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
        THEN (make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
        ELSE (make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
      END
    ) <= p_days
  ORDER BY days_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_upcoming_birthdays TO authenticated;

-- ============================================
-- 5. UPDATE PROFILE TRIGGER TO HANDLE BIRTH_DATE
-- ============================================

-- Update existing handle_new_user function to include birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    birth_date
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL
        AND NEW.raw_user_meta_data->>'birth_date' != ''
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
