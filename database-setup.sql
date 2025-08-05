-- Summit Seekers Rock Climbing Forum Database Setup
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  location TEXT,
  grade TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON posts FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON comments FOR INSERT WITH CHECK (true);

-- Insert some sample data (optional)
INSERT INTO posts (title, content, location, grade, upvotes) VALUES
('First Lead Climb at Red River Gorge', 'Amazing experience climbing my first 5.8 lead! The exposure was incredible and the rock quality was perfect.', 'Red River Gorge, Kentucky', '5.8', 12),
('Epic Bouldering Session at Joshua Tree', 'Spent the whole day bouldering in the desert. The friction was incredible and the problems were challenging but fun.', 'Joshua Tree National Park, California', '5.10a', 8),
('Multi-pitch Adventure in Yosemite', 'Climbed a classic 5.9 multi-pitch route. The views from the top were absolutely breathtaking!', 'Yosemite Valley, California', '5.9', 15);

-- Insert sample comments
INSERT INTO comments (post_id, content) VALUES
(1, 'Congrats on your first lead! Red River Gorge is such a great place to learn.'),
(1, 'What route did you climb? I love the 5.8s there!'),
(2, 'Joshua Tree is magical for bouldering. The rock quality is unmatched.'),
(3, 'Yosemite multi-pitch is the best! Which route did you climb?'); 