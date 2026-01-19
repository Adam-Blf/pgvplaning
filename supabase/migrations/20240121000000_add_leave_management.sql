-- Migration: Add Leave Management System
-- Description: Employee type (employee/executive) with annual leave days tracking

-- ============================================
-- 1. ADD COLUMNS TO TEAM_MEMBERS
-- ============================================

-- Add employee_type column (employé ou cadre)
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS employee_type TEXT
  CHECK (employee_type IN ('employee', 'executive'))
  DEFAULT 'employee' NOT NULL;

-- Add annual_leave_days column (nombre de jours annuels)
-- Default: 25 for employee, 30 for executive
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS annual_leave_days INTEGER DEFAULT 25 NOT NULL;

-- Add leave_balance column (solde actuel de jours disponibles)
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_balance INTEGER DEFAULT 25 NOT NULL;

-- Add leave_balance_year column (année du solde pour le reset au 01/01)
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_balance_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER NOT NULL;

-- ============================================
-- 2. FUNCTION TO SET DEFAULT LEAVE DAYS BASED ON TYPE
-- ============================================

CREATE OR REPLACE FUNCTION set_default_leave_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Set annual leave days based on employee type
  IF NEW.employee_type = 'executive' THEN
    NEW.annual_leave_days := COALESCE(NULLIF(NEW.annual_leave_days, 25), 30);
    NEW.leave_balance := COALESCE(NULLIF(NEW.leave_balance, 25), 30);
  ELSE
    NEW.annual_leave_days := COALESCE(NEW.annual_leave_days, 25);
    NEW.leave_balance := COALESCE(NEW.leave_balance, 25);
  END IF;

  -- Set the current year for balance tracking
  NEW.leave_balance_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new members
DROP TRIGGER IF EXISTS trigger_set_default_leave_days ON public.team_members;
CREATE TRIGGER trigger_set_default_leave_days
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION set_default_leave_days();

-- ============================================
-- 3. FUNCTION TO RESET LEAVE BALANCE YEARLY
-- ============================================

CREATE OR REPLACE FUNCTION check_and_reset_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  -- If the year changed, reset the balance
  IF OLD.leave_balance_year < current_year THEN
    NEW.leave_balance := NEW.annual_leave_days;
    NEW.leave_balance_year := current_year;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check balance reset on any update
DROP TRIGGER IF EXISTS trigger_check_leave_reset ON public.team_members;
CREATE TRIGGER trigger_check_leave_reset
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION check_and_reset_leave_balance();

-- ============================================
-- 4. FUNCTION TO UPDATE LEAVE BALANCE ON CALENDAR ENTRY
-- ============================================

CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
  days_to_deduct NUMERIC;
BEGIN
  -- Only process LEAVE status entries
  IF NEW.status = 'LEAVE' THEN
    -- Calculate days to deduct (0.5 for half day, 1 for full day)
    days_to_deduct := CASE
      WHEN NEW.half_day IN ('AM', 'PM') THEN 0.5
      ELSE 1
    END;

    -- Get member info and check year
    SELECT * INTO member_record
    FROM public.team_members
    WHERE user_id = NEW.user_id AND team_id = NEW.team_id;

    IF member_record IS NOT NULL THEN
      -- Check if we need to reset first (new year)
      IF member_record.leave_balance_year < EXTRACT(YEAR FROM NEW.date)::INTEGER THEN
        UPDATE public.team_members
        SET
          leave_balance = annual_leave_days - days_to_deduct,
          leave_balance_year = EXTRACT(YEAR FROM NEW.date)::INTEGER
        WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
      ELSE
        -- Deduct from current balance
        UPDATE public.team_members
        SET leave_balance = leave_balance - days_to_deduct
        WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for calendar entries with LEAVE status
DROP TRIGGER IF EXISTS trigger_update_leave_balance ON public.calendar_entries;
CREATE TRIGGER trigger_update_leave_balance
  AFTER INSERT ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION update_leave_balance();

-- ============================================
-- 5. FUNCTION TO RESTORE LEAVE BALANCE ON DELETE
-- ============================================

CREATE OR REPLACE FUNCTION restore_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  days_to_restore NUMERIC;
BEGIN
  -- Only process LEAVE status entries
  IF OLD.status = 'LEAVE' THEN
    -- Calculate days to restore
    days_to_restore := CASE
      WHEN OLD.half_day IN ('AM', 'PM') THEN 0.5
      ELSE 1
    END;

    -- Restore balance
    UPDATE public.team_members
    SET leave_balance = leave_balance + days_to_restore
    WHERE user_id = OLD.user_id
      AND team_id = OLD.team_id
      AND leave_balance_year = EXTRACT(YEAR FROM OLD.date)::INTEGER;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for deleting leave entries
DROP TRIGGER IF EXISTS trigger_restore_leave_balance ON public.calendar_entries;
CREATE TRIGGER trigger_restore_leave_balance
  AFTER DELETE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION restore_leave_balance();

-- ============================================
-- 6. HELPER FUNCTION TO GET LEAVE INFO
-- ============================================

CREATE OR REPLACE FUNCTION get_leave_info(p_user_id UUID, p_team_id UUID)
RETURNS TABLE (
  employee_type TEXT,
  annual_leave_days INTEGER,
  leave_balance NUMERIC,
  leave_balance_year INTEGER,
  used_days NUMERIC
) AS $$
DECLARE
  current_year INTEGER;
  member_record RECORD;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  SELECT * INTO member_record
  FROM public.team_members tm
  WHERE tm.user_id = p_user_id AND tm.team_id = p_team_id;

  IF member_record IS NOT NULL THEN
    -- Check if reset needed
    IF member_record.leave_balance_year < current_year THEN
      -- Return reset values
      RETURN QUERY SELECT
        member_record.employee_type,
        member_record.annual_leave_days,
        member_record.annual_leave_days::NUMERIC,
        current_year,
        0::NUMERIC;
    ELSE
      -- Return current values
      RETURN QUERY SELECT
        member_record.employee_type,
        member_record.annual_leave_days,
        member_record.leave_balance::NUMERIC,
        member_record.leave_balance_year,
        (member_record.annual_leave_days - member_record.leave_balance)::NUMERIC;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. UPDATE RLS POLICIES FOR NEW COLUMNS
-- ============================================

-- Members can update their own employee_type and leave settings (during setup)
-- This is handled by existing "Users can leave teams" policy
-- Leaders can update any member's settings via existing "Leaders can update member roles" policy
