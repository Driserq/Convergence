# Database Schema - Habit Blueprint MVP

## Database Setup Instructions

### One-Time Manual Setup (via Supabase SQL Editor)
1. Go to your Supabase project dashboard  
2. Navigate to **SQL Editor**  
3. Run the complete SQL command block provided below  
4. Authentication table (`auth.users`) is automatically created by Supabase

## Tables Overview

### 1. auth.users (Auto-created by Supabase Auth)
**Note**: This table is automatically created and managed by Supabase Auth

| Column | Data Type | Description |
|--------|-----------|-------------|
| id | UUID | Primary key (auto-generated) |
| email | TEXT | User's email address |
| created_at | TIMESTAMPTZ | Account creation timestamp |

### 2. habit_blueprints (Manual Creation Required)
**Purpose**: Store each user's generated habit blueprints (history)

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique blueprint ID |
| user_id | UUID | FOREIGN KEY REFERENCES auth.users(id) ON DELETE CASCADE | Owner of blueprint |
| goal | TEXT | NOT NULL | User's primary goal |
| habits_to_kill | TEXT[] | NULLABLE | Array of habits to eliminate |
| habits_to_develop | TEXT[] | NULLABLE | Array of habits to develop |
| content_source | TEXT | NOT NULL | YouTube URL or "Text Input" |
| content_type | VARCHAR(20) | NOT NULL, CHECK IN ('youtube', 'text') | Source type |
| ai_output | JSONB | NOT NULL | Complete AI-generated output (summary, mistakes, guidance, steps) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When blueprint was created |

### 3. Indexes
- `idx_blueprints_user_id` ON habit_blueprints(user_id) — Fast user queries  
- `idx_blueprints_created_at` ON habit_blueprints(created_at DESC) — Recent blueprints

## Complete SQL Setup Commands

-- Enable UUID extension (usually already enabled)  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habit_blueprints table  
CREATE TABLE habit_blueprints (  
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  
  goal TEXT NOT NULL,  
  habits_to_kill TEXT[],  
  habits_to_develop TEXT[],  
  content_source TEXT NOT NULL,  
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('youtube', 'text')),  
  ai_output JSONB NOT NULL,  
  created_at TIMESTAMPTZ DEFAULT NOW()  
);

-- Create indexes for performance  
CREATE INDEX idx_blueprints_user_id ON habit_blueprints(user_id);  
CREATE INDEX idx_blueprints_created_at ON habit_blueprints(created_at DESC);

-- Enable Row Level Security  
ALTER TABLE habit_blueprints ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own blueprints  
CREATE POLICY "Users can view own blueprints"  
ON habit_blueprints FOR SELECT  
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blueprints"  
ON habit_blueprints FOR INSERT  
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blueprints"  
ON habit_blueprints FOR UPDATE  
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own blueprints"  
ON habit_blueprints FOR DELETE  
USING (auth.uid() = user_id);

## Data Structure Examples

### AI Output JSON Format
```json
{
  "overview": "This video discusses the importance of environment design and atomic habits. Key insight: make good habits obvious and bad habits invisible through strategic environment changes.\n\nCommon mistakes to avoid: Relying solely on willpower without changing your environment, trying to change too many habits at once, and not tracking progress which leads to loss of momentum.\n\nGuidance for success: Start with one keystone habit that will trigger positive changes in other areas. Use the 2-minute rule to scale habits down. Focus on identity-based habits: 'I am the type of person who...' rather than 'I want to...'",
  "habits": [
    {
      "id": 1,
      "title": "Morning Routine Setup",
      "description": "Create a 15-minute morning routine that primes your day. Place your workout clothes next to your bed the night before.",
      "timeframe": "Week 1"
    },
    {
      "id": 2,
      "title": "Environment Design",
      "description": "Remove phone from bedroom and replace with a physical alarm clock. Create a 'phone jail' in another room.",
      "timeframe": "Week 1-2"
    },
    {
      "id": 3,
      "title": "Habit Stacking",
      "description": "After making morning coffee (existing habit), immediately do 5 minutes of journaling (new habit).",
      "timeframe": "Week 2-3"
    }
  ]
}


## Authentication Setup
**Enable in Supabase Studio → Authentication → Providers:**  
- ✅ Email (password-based auth)  
- ✅ Magic Link (optional - for passwordless)  
- ❌ Disable email confirmation initially (for faster testing)

## Local Development
- Run the same SQL commands in your local Supabase (`npx supabase start`)  
- RLS policies work identically in local and production  
- Access local data at http://localhost:54323 (Supabase Studio)

## Key Benefits
- **Security**: RLS ensures users only see their data  
- **Scalability**: UUID primary keys, proper indexing  
- **Flexibility**: JSONB for AI output allows rich structured data  
- **Data Integrity**: Foreign key and CHECK constraints  
- **Audit Trail**: Created timestamps for all blueprints
