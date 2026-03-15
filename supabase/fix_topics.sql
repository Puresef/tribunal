-- ==============================================================================
-- TRIBUNAL — CLEANUP REDUNDANT TOPICS
-- Merges 'Technology' and 'Technology & AI' into 'Tech'
-- ==============================================================================

DO $$
DECLARE
  target_topic_id UUID;
BEGIN
  -- 1. Ensure 'Tech' exists
  INSERT INTO public.topics (name, slug, color) 
  VALUES ('Tech', 'tech', '#60a5fa')
  ON CONFLICT (name) DO NOTHING;

  -- Get the UUID for 'Tech'
  SELECT id INTO target_topic_id FROM public.topics WHERE name = 'Tech' LIMIT 1;

  -- 2. Move all claims from the redundant topics to 'Tech'
  UPDATE public.claims 
  SET topic_id = target_topic_id
  WHERE topic_id IN (
    SELECT id FROM public.topics WHERE name IN ('Technology', 'Technology & AI')
  );

  -- 3. Delete the redundant topics
  DELETE FROM public.topics 
  WHERE name IN ('Technology', 'Technology & AI');

  RAISE NOTICE 'Merging complete! All tech claims are now under "Tech".';
END $$;
