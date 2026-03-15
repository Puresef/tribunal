-- ==============================================================================
-- TRIBUNAL — SEED DATA SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO POPULATE THE PLATFORM
-- ==============================================================================

-- 1. Create Fake Users (Judges)
-- NOTE: We no longer insert into auth.users directly as it corrupts the schema.
-- Please CREATE the users first in the Supabase Auth UI, then run this script
-- to update their profiles and link them to data.

-- Emails used: 
-- chief@tribunal.so
-- senior@tribunal.so
-- member@tribunal.so

DO $$
DECLARE
  chief_judge_id UUID := (SELECT id FROM auth.users WHERE email = 'chief@tribunal.so' LIMIT 1);
  senior_judge_id UUID := (SELECT id FROM auth.users WHERE email = 'senior@tribunal.so' LIMIT 1);
  member_id UUID := (SELECT id FROM auth.users WHERE email = 'member@tribunal.so' LIMIT 1);
  topic_tech UUID;
  topic_philo UUID;
  topic_politics UUID;
  claim_agi UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  claim_sim UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  claim_settled UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  ev_1 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1';
  ev_2 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2';
  ev_3 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3';
  ev_4 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4';
  ev_5 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5';
BEGIN

  IF chief_judge_id IS NULL THEN
    RAISE EXCEPTION 'User chief@tribunal.so not found. Please create it in the Auth UI first.';
  END IF;

  -- Update profiles created by trigger
  UPDATE public.profiles SET display_name = 'Aurelius', rank = 'chief_justice' WHERE id = chief_judge_id;
  UPDATE public.profiles SET display_name = 'Socrates', rank = 'senior_judge' WHERE id = senior_judge_id;
  UPDATE public.profiles SET display_name = 'Plato', rank = 'member' WHERE id = member_id;


  -- 2. Ensure Topics exist and fetch their IDs
  INSERT INTO public.topics (name, slug, color) VALUES 
  ('Technology & AI', 'technology-and-ai', '#34d399') ON CONFLICT (name) DO NOTHING;
  INSERT INTO public.topics (name, slug, color) VALUES 
  ('Philosophy', 'philosophy', '#a78bfa') ON CONFLICT (name) DO NOTHING;
  INSERT INTO public.topics (name, slug, color) VALUES 
  ('Geopolitics', 'geopolitics', '#f87171') ON CONFLICT (name) DO NOTHING;

  SELECT id INTO topic_tech FROM public.topics WHERE name = 'Technology & AI' LIMIT 1;
  SELECT id INTO topic_philo FROM public.topics WHERE name = 'Philosophy' LIMIT 1;
  SELECT id INTO topic_politics FROM public.topics WHERE name = 'Geopolitics' LIMIT 1;

  -- 3. Insert Claims
  INSERT INTO public.claims (id, submitter_id, topic_id, title, description, status, created_at) VALUES
  (claim_agi, chief_judge_id, topic_tech, 'Artificial General Intelligence will be achieved before 2030.', 'A highly debated timeline regarding the point at which AI surpasses human capabilities across all economically valuable tasks.', 'active', now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.claims (id, submitter_id, topic_id, title, description, status, created_at) VALUES
  (claim_sim, senior_judge_id, topic_philo, 'Humanity is currently living inside an ancestral simulation.', 'Evaluating the statistical likelihood of Nick Bostrom''s simulation argument.', 'active', now() - interval '5 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.claims (id, submitter_id, topic_id, title, description, status, created_at, composite_score) VALUES
  (claim_settled, member_id, topic_politics, 'Universal Basic Income will become a necessity due to automation.', 'Economic restructuring enforced by capital vs labor displacement.', 'settled', now() - interval '30 days', 8.4)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Insert Evidence
  -- AGI Claim Evidence
  INSERT INTO public.evidence (id, claim_id, submitter_id, title, source_url, content, stance) VALUES
  (ev_1, claim_agi, senior_judge_id, 'OpenAI Scaling Laws Paper', 'https://arxiv.org/abs/2001.08361', 'Empirical laws of scaling language models predict continued predictable capability gains.', 'supporting') ON CONFLICT DO NOTHING;
  INSERT INTO public.evidence (id, claim_id, submitter_id, title, source_url, content, stance) VALUES
  (ev_2, claim_agi, member_id, 'The Bitter Lesson (Sutton)', 'http://www.incompleteideas.net/IncIdeas/BitterLesson.html', 'Compute scaling always wins in the end over hand-crafted knowledge.', 'supporting') ON CONFLICT DO NOTHING;
  INSERT INTO public.evidence (id, claim_id, submitter_id, title, source_url, content, stance) VALUES
  (ev_3, claim_agi, chief_judge_id, 'Gary Marcus on LLM Plateaus', 'https://garymarcus.substack.com/', 'LLMs are running out of high-quality data and cannot reason, requiring a fundamental paradigm shift that will take decades.', 'challenging') ON CONFLICT DO NOTHING;

  -- Simulation Claim Evidence
  INSERT INTO public.evidence (id, claim_id, submitter_id, title, source_url, content, stance) VALUES
  (ev_4, claim_sim, member_id, 'Are You Living in a Computer Simulation?', 'https://academic.oup.com/pq/article-abstract/53/211/243/1610975', 'The original paper laying out the trilemma.', 'supporting') ON CONFLICT DO NOTHING;
  INSERT INTO public.evidence (id, claim_id, submitter_id, title, source_url, content, stance) VALUES
  (ev_5, claim_sim, chief_judge_id, 'Physical Limits of Computation', 'https://en.wikipedia.org/wiki/Limits_of_computation', 'Simulating the entire universe down to the quantum level requires a computer larger than the universe itself.', 'challenging') ON CONFLICT DO NOTHING;

  -- 5. Insert Ratings
  -- Everyone agrees scaling laws are credible and relevant, but disagree on logic/strength
  INSERT INTO public.ratings (evidence_id, judge_id, source_credibility, logical_strength, relevance, justification) VALUES
  (ev_1, chief_judge_id, 9, 8, 10, 'Scaling laws are mathematically sound, but don''t guarantee generalized reasoning.'),
  (ev_1, senior_judge_id, 10, 10, 10, 'Indisputable proof of the current trajectory.');

  -- Split on Gary Marcus
  INSERT INTO public.ratings (evidence_id, judge_id, source_credibility, logical_strength, relevance, justification) VALUES
  (ev_3, chief_judge_id, 8, 9, 9, 'A necessary sober perspective against the hype.'),
  (ev_3, senior_judge_id, 3, 2, 7, 'Historically inaccurate predictions about deep learning.');

  -- Ratings on Simulation
  INSERT INTO public.ratings (evidence_id, judge_id, source_credibility, logical_strength, relevance) VALUES
  (ev_4, chief_judge_id, 10, 8, 10),
  (ev_4, member_id, 9, 9, 10),
  (ev_5, senior_judge_id, 8, 10, 8);

END $$;
