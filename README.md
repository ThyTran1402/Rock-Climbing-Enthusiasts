# Summit Seekers - Rock Climbing Adventures Forum

A modern React.js web application for rock climbing enthusiasts to share their adventures, discuss routes, and connect with the climbing community.

## 🏔️ Features

### Core Functionality
- **User Authentication**: Sign up, sign in, and sign out functionality
- **Create Posts**: Share climbing adventures with title, content, images, location, and grade
- **Home Feed**: Browse all posts with search and sort functionality
- **Post Details**: View full posts with comments and upvote system
- **Comments**: Leave comments on any post (requires authentication)
- **Upvotes**: Upvote posts to show appreciation
- **Edit/Delete**: Edit or delete your own posts (requires authentication)
- **Responsive Design**: Works perfectly on desktop and mobile

### User Experience
- **Search**: Search posts by title
- **Sort**: Sort posts by creation time or upvotes
- **Modern UI**: Beautiful gradient design with smooth animations
- **Real-time Updates**: Instant feedback for all interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rock-climbing-forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Update `src/supabase.js` with your credentials

4. **Create database tables**
   
   Run these SQL commands in your Supabase SQL editor (use `supabase_auth_schema.sql` for the complete setup):

   ```sql
   -- Create posts table with user authentication
   CREATE TABLE posts (
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

   -- Create comments table with user authentication
   CREATE TABLE comments (
     id BIGSERIAL PRIMARY KEY,
     post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

   -- Create policies for authenticated access
   CREATE POLICY "Allow public read access" ON posts FOR SELECT USING (true);
   CREATE POLICY "Allow authenticated users to insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Allow users to update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Allow users to delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
   CREATE POLICY "Allow authenticated users to insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Allow users to update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Allow users to delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

### Posts Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | UUID | Foreign key to auth.users (required) |
| title | TEXT | Post title (required) |
| content | TEXT | Post content |
| image_url | TEXT | External image URL |
| location | TEXT | Climbing location |
| grade | TEXT | Climbing grade (5.5-5.13+) |
| upvotes | INTEGER | Number of upvotes (default: 0) |
| created_at | TIMESTAMP | Creation timestamp |

### Comments Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| post_id | BIGINT | Foreign key to posts |
| user_id | UUID | Foreign key to auth.users (required) |
| content | TEXT | Comment content |
| created_at | TIMESTAMP | Creation timestamp |

## 🎨 Design Features

- **Modern Gradient Design**: Beautiful purple-blue gradients
- **Card-based Layout**: Clean, organized post cards
- **Smooth Animations**: Hover effects and transitions
- **Responsive Grid**: Adapts to all screen sizes
- **Loading States**: Spinner animations for better UX
- **Error Handling**: User-friendly error messages

## 🛠️ Technology Stack

- **Frontend**: React.js 18
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS3 with modern features
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag the `build` folder to Netlify
3. Configure environment variables if needed

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then update `src/supabase.js`:
```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
```

## 🎯 Project Requirements Met

✅ **Create Form**: Users can create posts with title, content, and image URL  
✅ **Home Feed**: Displays all posts with creation time, title, and upvotes  
✅ **Post Navigation**: Clicking posts navigates to individual post pages  
✅ **Search & Sort**: Search by title, sort by time or upvotes  
✅ **Post Details**: Full post view with content, image, and comments  
✅ **Comments**: Users can leave comments on posts  
✅ **Upvotes**: Upvote button increases count by one  
✅ **Edit/Delete**: Users can edit and delete their posts  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Supabase for the backend-as-a-service
- Font Awesome for the beautiful icons
- The climbing community for inspiration

---

**Happy Climbing! 🧗‍♂️**
