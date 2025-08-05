-- Summit Seekers Rock Climbing Forum Database Setup with Authentication
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

-- Create posts table with user_id
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  location TEXT,
  grade TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table with user_id
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for posts
CREATE POLICY "Allow public read access" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Insert sample data (optional - for testing)
INSERT INTO posts (user_id, title, content, image_url, location, grade, upvotes) VALUES
  ('00000000-0000-0000-0000-000000000000', 'First Lead Climb at Red River Gorge', 'Amazing experience climbing my first 5.10a lead route! The exposure was incredible and the rock quality was superb.', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800', 'Red River Gorge, Kentucky', '5.10a', 12),
  ('00000000-0000-0000-0000-000000000000', 'Epic Bouldering Session at Hueco Tanks', 'Spent the day working on some classic V6 problems. The rock texture here is unlike anything I\'ve experienced before.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'Hueco Tanks, Texas', 'V6', 8),
  ('00000000-0000-0000-0000-000000000000', 'Multi-pitch Adventure in Yosemite', 'Climbed the classic Nutcracker route. 5 pitches of pure granite bliss with stunning views of the valley.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Yosemite Valley, California', '5.8', 15);

-- Insert sample comments
INSERT INTO comments (post_id, user_id, content) VALUES
  (1, '00000000-0000-0000-0000-000000000000', 'Congrats on your first lead! Red River Gorge is such a great place to learn.'),
  (1, '00000000-0000-0000-0000-000000000000', 'Which route was it? I love the 5.10s at RRG!'),
  (2, '00000000-0000-0000-0000-000000000000', 'Hueco Tanks is on my bucket list! How was the approach?'),
  (3, '00000000-0000-0000-0000-000000000000', 'Yosemite granite is the best! Did you get any photos from the top?'); 