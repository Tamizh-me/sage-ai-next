CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  skills TEXT[],
  work_experience JSONB,
  education JSONB,
  resume_data JSONB,
  linkedin_data JSONB,
  ai_interactions JSONB[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
 LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_modtime
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create an index on user_id for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);