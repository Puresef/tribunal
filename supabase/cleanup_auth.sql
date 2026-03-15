-- ==============================================================================
-- TRIBUNAL — EMERGENCY AUTH CLEANUP
-- RUN THIS IF SUPABASE UI FAILS TO DELETE ZOMBIE USERS
-- ==============================================================================

-- 1. Identify IDs (From our previous seed script)
-- chief_judge_id: '11111111-1111-1111-1111-111111111111'
-- senior_judge_id: '22222222-2222-2222-2222-222222222222'
-- member_id: '33333333-3333-3333-3333-333333333333'

DO $$
BEGIN
  -- Delete from public tables first (just in case cascade is missing)
  DELETE FROM public.ratings WHERE judge_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
  DELETE FROM public.judge_profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
  DELETE FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
  
  -- Force delete from auth.users (this should clean up the internal tables too)
  DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
  
  -- Clean up identities if any exist
  DELETE FROM auth.identities WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
END $$;
