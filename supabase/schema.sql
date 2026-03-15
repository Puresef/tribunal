-- ============================================
-- THE TRIBUNAL — Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- === Enums ===

CREATE TYPE claim_status AS ENUM ('active', 'unresolved', 'settled', 'archived');
CREATE TYPE evidence_stance AS ENUM ('supporting', 'challenging', 'derived');
CREATE TYPE judge_rank AS ENUM ('spectator', 'member', 'judge', 'senior_judge', 'verified_judge', 'chief_justice');
CREATE TYPE split_level AS ENUM ('none', 'low', 'medium', 'high');
CREATE TYPE challenge_status AS ENUM ('pending', 'dismissed', 'upheld');

-- === Topics ===

CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#60a5fa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Profiles (extends Supabase auth.users) ===

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  rank judge_rank DEFAULT 'spectator',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Judge Profiles (scoring stats) ===

CREATE TABLE judge_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  consistency_score NUMERIC(4,3) DEFAULT 0.000,
  total_ratings INTEGER DEFAULT 0,
  total_claims_judged INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  domain_specialties JSONB DEFAULT '{}',
  signature_rulings_count INTEGER DEFAULT 0,
  overturned_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Claims ===

CREATE TABLE claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic_id UUID REFERENCES topics(id),
  submitter_id UUID REFERENCES profiles(id) NOT NULL,
  composite_score NUMERIC(4,1) DEFAULT 0.0,
  evidence_count INTEGER DEFAULT 0,
  judge_count INTEGER DEFAULT 0,
  status claim_status DEFAULT 'active',
  split_level split_level DEFAULT 'none',
  challenge_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_topic ON claims(topic_id);
CREATE INDEX idx_claims_composite ON claims(composite_score DESC);
CREATE INDEX idx_claims_created ON claims(created_at DESC);

-- === Evidence ===

CREATE TABLE evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
  submitter_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  stance evidence_stance NOT NULL,
  composite_score NUMERIC(4,1) DEFAULT 0.0,
  judge_count INTEGER DEFAULT 0,
  split_level split_level DEFAULT 'none',
  -- For derived evidence (citing settled claims)
  derived_from_claim_id UUID REFERENCES claims(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_claim ON evidence(claim_id);
CREATE INDEX idx_evidence_composite ON evidence(composite_score DESC);
CREATE INDEX idx_evidence_stance ON evidence(stance);

-- === Ratings ===

CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE NOT NULL,
  judge_id UUID REFERENCES profiles(id) NOT NULL,
  source_credibility NUMERIC(3,1) NOT NULL CHECK (source_credibility >= 1.0 AND source_credibility <= 10.0),
  logical_strength NUMERIC(3,1) NOT NULL CHECK (logical_strength >= 1.0 AND logical_strength <= 10.0),
  relevance NUMERIC(3,1) NOT NULL CHECK (relevance >= 1.0 AND relevance <= 10.0),
  composite NUMERIC(4,1) GENERATED ALWAYS AS (
    ROUND((source_credibility * 0.333 + logical_strength * 0.333 + relevance * 0.334)::NUMERIC, 1)
  ) STORED,
  justification TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One rating per judge per evidence
  UNIQUE(evidence_id, judge_id)
);

CREATE INDEX idx_ratings_evidence ON ratings(evidence_id);
CREATE INDEX idx_ratings_judge ON ratings(judge_id);

-- === Challenges ===

CREATE TABLE challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
  challenger_id UUID REFERENCES profiles(id) NOT NULL,
  new_evidence_id UUID REFERENCES evidence(id),
  reason TEXT NOT NULL,
  status challenge_status DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_claim ON challenges(claim_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- === Tribunal Sessions (Phase 2 — schema ready) ===

CREATE TABLE tribunal_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  participant_count INTEGER DEFAULT 0,
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Functions & Triggers
-- ============================================

-- === Calculate evidence composite from ratings ===

CREATE OR REPLACE FUNCTION calculate_evidence_composite()
RETURNS TRIGGER AS $$
DECLARE
  new_composite NUMERIC(4,1);
  new_judge_count INTEGER;
  stddev_source NUMERIC;
  stddev_logic NUMERIC;
  stddev_relevance NUMERIC;
  avg_source NUMERIC;
  avg_logic NUMERIC;
  avg_relevance NUMERIC;
  max_spread NUMERIC;
  new_split split_level;
BEGIN
  -- Calculate average composite and judge count
  SELECT
    ROUND(AVG(composite)::NUMERIC, 1),
    COUNT(*),
    COALESCE(STDDEV(source_credibility), 0),
    COALESCE(STDDEV(logical_strength), 0),
    COALESCE(STDDEV(relevance), 0),
    COALESCE(AVG(source_credibility), 0),
    COALESCE(AVG(logical_strength), 0),
    COALESCE(AVG(relevance), 0)
  INTO new_composite, new_judge_count,
       stddev_source, stddev_logic, stddev_relevance,
       avg_source, avg_logic, avg_relevance
  FROM ratings
  WHERE evidence_id = COALESCE(NEW.evidence_id, OLD.evidence_id);

  -- Calculate max spread between dimension averages
  max_spread := GREATEST(avg_source, avg_logic, avg_relevance)
              - LEAST(avg_source, avg_logic, avg_relevance);

  -- Determine split level
  IF GREATEST(stddev_source, stddev_logic, stddev_relevance) > 2.5
     OR max_spread > 3.0 THEN
    new_split := 'high';
  ELSIF GREATEST(stddev_source, stddev_logic, stddev_relevance) > 1.5
        OR max_spread > 2.0 THEN
    new_split := 'medium';
  ELSIF GREATEST(stddev_source, stddev_logic, stddev_relevance) > 0.8
        OR max_spread > 1.0 THEN
    new_split := 'low';
  ELSE
    new_split := 'none';
  END IF;

  -- Update evidence
  UPDATE evidence
  SET composite_score = COALESCE(new_composite, 0),
      judge_count = new_judge_count,
      split_level = new_split,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.evidence_id, OLD.evidence_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rating_change
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION calculate_evidence_composite();

-- === Calculate claim composite from evidence ===

CREATE OR REPLACE FUNCTION calculate_claim_composite()
RETURNS TRIGGER AS $$
DECLARE
  new_composite NUMERIC(4,1);
  new_evidence_count INTEGER;
  total_judges INTEGER;
  max_split split_level;
BEGIN
  -- Weighted average: evidence with more judges gets more weight
  SELECT
    ROUND(
      (SUM(composite_score * judge_count) / NULLIF(SUM(judge_count), 0))::NUMERIC,
      1
    ),
    COUNT(*),
    COALESCE(SUM(judge_count), 0)
  INTO new_composite, new_evidence_count, total_judges
  FROM evidence
  WHERE claim_id = NEW.claim_id
    AND judge_count > 0;

  -- Claim split = highest split of any evidence
  SELECT COALESCE(MAX(e.split_level), 'none')
  INTO max_split
  FROM evidence e
  WHERE e.claim_id = NEW.claim_id;

  -- Update claim
  UPDATE claims
  SET composite_score = COALESCE(new_composite, 0),
      evidence_count = new_evidence_count,
      judge_count = total_judges,
      split_level = max_split,
      updated_at = NOW()
  WHERE id = NEW.claim_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_evidence_change
AFTER INSERT OR UPDATE ON evidence
FOR EACH ROW
EXECUTE FUNCTION calculate_claim_composite();

-- === Auto-create profile on signup ===

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Judge'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'member'
  );

  INSERT INTO judge_profiles (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Judge profiles: anyone can read
CREATE POLICY "Judge profiles are viewable by everyone" ON judge_profiles FOR SELECT USING (true);

-- Topics: anyone can read
CREATE POLICY "Topics are viewable by everyone" ON topics FOR SELECT USING (true);

-- Claims: anyone can read, auth users can insert (role check in app)
CREATE POLICY "Claims are viewable by everyone" ON claims FOR SELECT USING (true);
CREATE POLICY "Auth users can create claims" ON claims FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- Evidence: anyone can read, auth users can insert
CREATE POLICY "Evidence is viewable by everyone" ON evidence FOR SELECT USING (true);
CREATE POLICY "Auth users can submit evidence" ON evidence FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- Ratings: anyone can read, auth users can insert their own
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Auth users can submit ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = judge_id);

-- Challenges: anyone can read, auth users can create
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Auth users can create challenges" ON challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);

-- Tribunal sessions: anyone can read
CREATE POLICY "Sessions are viewable by everyone" ON tribunal_sessions FOR SELECT USING (true);

-- ============================================
-- Seed Data: Topics
-- ============================================

INSERT INTO topics (name, slug, color) VALUES
  ('Politics', 'politics', '#f87171'),
  ('Science', 'science', '#34d399'),
  ('Tech', 'tech', '#60a5fa'),
  ('Health', 'health', '#a78bfa'),
  ('History', 'history', '#fbbf24'),
  ('Religion', 'religion', '#f472b6'),
  ('Conspiracy', 'conspiracy', '#fb923c'),
  ('Environment', 'environment', '#4ade80'),
  ('Finance', 'finance', '#facc15'),
  ('Legal', 'legal', '#94a3b8'),
  ('Physics', 'physics', '#22d3ee'),
  ('Journalism', 'journalism', '#e879f9');
