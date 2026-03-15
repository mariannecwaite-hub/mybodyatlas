
-- Enums
CREATE TYPE public.event_type AS ENUM ('injury', 'symptom', 'stress_period', 'treatment', 'life_transition', 'recovery');
CREATE TYPE public.impact_level AS ENUM ('mild', 'moderate', 'significant');
CREATE TYPE public.profile_type AS ENUM ('adult', 'child');
CREATE TYPE public.insight_type AS ENUM ('recurring_region', 'stress_correlation', 'treatment_outcome', 'life_transition_link', 'body_echo', 'general');

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type profile_type NOT NULL DEFAULT 'adult',
  avatar TEXT NOT NULL DEFAULT '🙂',
  birth_year INTEGER,
  handover_age INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Body regions (reference table)
CREATE TABLE public.body_regions (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  a11y_description TEXT
);

-- Events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE NOT NULL,
  date_end DATE,
  impact_level impact_level NOT NULL DEFAULT 'mild',
  is_ongoing BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event ↔ Region (many-to-many)
CREATE TABLE public.event_regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  region_id TEXT NOT NULL REFERENCES public.body_regions(id) ON DELETE CASCADE,
  UNIQUE (event_id, region_id)
);

-- Treatments (linked to events)
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT,
  approach TEXT,
  outcome TEXT,
  date_logged DATE NOT NULL DEFAULT CURRENT_DATE,
  is_ongoing BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insights (generated patterns)
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type insight_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'sage',
  related_event_ids UUID[] DEFAULT '{}',
  related_regions TEXT[] DEFAULT '{}',
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  is_saved BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_profile ON public.events(profile_id);
CREATE INDEX idx_events_user ON public.events(user_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_date ON public.events(date_start);
CREATE INDEX idx_event_regions_event ON public.event_regions(event_id);
CREATE INDEX idx_event_regions_region ON public.event_regions(region_id);
CREATE INDEX idx_treatments_event ON public.treatments(event_id);
CREATE INDEX idx_insights_profile ON public.insights(profile_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- body_regions is a reference table, readable by all authenticated users
CREATE POLICY "Anyone can read body regions" ON public.body_regions FOR SELECT TO authenticated USING (true);

-- Profiles: users see only their own
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profiles" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Events: users see only their own
CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Event regions: access via event ownership
CREATE OR REPLACE FUNCTION public.owns_event(_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE id = _event_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can view own event regions" ON public.event_regions FOR SELECT USING (public.owns_event(event_id));
CREATE POLICY "Users can create own event regions" ON public.event_regions FOR INSERT WITH CHECK (public.owns_event(event_id));
CREATE POLICY "Users can delete own event regions" ON public.event_regions FOR DELETE USING (public.owns_event(event_id));

-- Treatments: users see only their own
CREATE POLICY "Users can view own treatments" ON public.treatments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own treatments" ON public.treatments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treatments" ON public.treatments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own treatments" ON public.treatments FOR DELETE USING (auth.uid() = user_id);

-- Insights: users see only their own
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.insights FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
