CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  tier        TEXT DEFAULT 'free' CHECK (tier IN ('free','module','all_access','team','mba')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company         TEXT NOT NULL,
  exercise_number INTEGER NOT NULL,
  status          TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  sql_submitted   TEXT,
  sql_score       INTEGER,
  attempts        INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, company, exercise_number)
);

CREATE TABLE IF NOT EXISTS briefing_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company           TEXT NOT NULL,
  briefing_text     TEXT NOT NULL,
  word_count        INTEGER,
  exercises_cited   INTEGER[],
  overall_score     INTEGER,
  passed            BOOLEAN,
  grading_breakdown JSONB,
  grading_feedback  TEXT,
  attempt_number    INTEGER DEFAULT 1,
  submitted_at      TIMESTAMPTZ DEFAULT NOW(),
  graded_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS biz_certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id         TEXT UNIQUE NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name       TEXT NOT NULL,
  user_email      TEXT NOT NULL,
  company         TEXT NOT NULL,
  company_label   TEXT NOT NULL,
  score           INTEGER NOT NULL,
  passed          BOOLEAN NOT NULL,
  submission_id   UUID REFERENCES briefing_submissions(id),
  signature       TEXT NOT NULL,
  public_key_id   TEXT DEFAULT 'realitydb-atelier-2026',
  issued_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  admin_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  seats       INTEGER NOT NULL,
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohort_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id   UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at  TIMESTAMPTZ DEFAULT NOW(),
  joined_at   TIMESTAMPTZ
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_profile ON profiles FOR ALL USING (auth.uid() = id);

ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_progress ON module_progress FOR ALL USING (auth.uid() = user_id);

ALTER TABLE briefing_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_submissions ON briefing_submissions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE biz_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_certs ON biz_certifications FOR SELECT USING (true);
CREATE POLICY users_insert_certs ON biz_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_own_cohorts ON cohorts FOR ALL USING (auth.uid() = admin_id);

ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_membership ON cohort_members FOR ALL USING (auth.uid() = user_id);