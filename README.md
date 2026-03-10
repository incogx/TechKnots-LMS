# TechKnots - Learn & Connect

<div align="center">

**A comprehensive learning platform combining interactive courses, coding challenges, and live sessions**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

## 📖 Overview

TechKnots is a modern, full-featured learning platform designed to help students master coding and technology through interactive courses, hands-on coding challenges, and live sessions with expert instructors. The platform combines the best features from top learning platforms into one powerful, user-friendly experience.

## ✨ Features

### 🎓 Learning Features
- **Interactive Courses** - Learn from expertly crafted courses with hands-on projects and real-world applications
- **Coding Challenges** - Sharpen your skills with coding problems from beginner to advanced levels
- **Live Sessions** - Join live classes with Google Meet integration and access recorded sessions anytime
- **Code Editor** - Built-in Monaco editor with syntax highlighting and code execution
- **Video Player** - Enhanced video playback for course content
- **Course Notes** - Take and manage notes while learning
- **Course Recommendations** - Personalized course suggestions based on your progress

### 🏆 Gamification
- **Leaderboards** - Track your progress and compete with peers on global leaderboards
- **Achievements** - Unlock achievements as you progress through courses and challenges
- **Rewards Shop** - Earn and redeem points for rewards
- **Daily Challenges** - Complete daily coding challenges to earn bonus points
- **Certificates** - Generate certificates upon course completion

### 👥 Community & Social
- **Discussion Forum** - Connect with learners worldwide and collaborate on projects
- **Role-Based Dashboards** - Separate dashboards for Students, Mentors, and Admins
- **User Profiles** - Track your learning journey and showcase achievements

### 🔐 Authentication & Security
- **Supabase Auth** - Secure authentication with email/password and OAuth
- **Role-Based Access Control** - Different access levels for students, mentors, and admins
- **Protected Routes** - Secure routing based on user roles

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing
- **TanStack Query 5.83.0** - Data fetching and state management

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark mode support

### Code Editor
- **Monaco Editor** - VS Code's editor in the browser

### Backend & Services
- **Supabase** - Authentication, PostgreSQL database, storage, and RLS
- **PostgreSQL** - Relational data model for courses, enrollments, stats, and achievements

### Forms & Validation
- **React Hook Form 7.61.1** - Performant forms
- **Zod 3.25.76** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Charts & Data Visualization
- **Recharts 2.15.4** - Composable charting library

### Additional Libraries
- **date-fns** - Date utility library
- **sonner** - Toast notifications
- **cmdk** - Command menu component

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **bun** package manager
- **Supabase account** (for authentication, database, and storage)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techknots-learn-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   To get your Supabase credentials:
   1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
   2. Create a new project or open an existing one
   3. Open `Settings -> API`
   4. Copy the `Project URL` into `VITE_SUPABASE_URL`
   5. Copy the `anon public` key into `VITE_SUPABASE_ANON_KEY`

   Apply migrations from `supabase/migrations` in the SQL editor:
   1. Run `001_initial_schema.sql`
   2. Run `002_rls_policies.sql`

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:8080` (or the port shown in your terminal)

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
techknots-learn-connect/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── placeholder.svg
├── src/
│   ├── assets/            # Images and other assets
│   │   └── hero-bg.jpg
│   ├── components/        # Reusable React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── CertificateGenerator.tsx
│   │   ├── CourseNotes.tsx
│   │   ├── CourseRecommendations.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── DiscussionForum.tsx
│   │   ├── DownloadableResources.tsx
│   │   ├── NavLink.tsx
│   │   ├── SiteNav.tsx
│   │   └── VideoPlayer.tsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/              # Utility functions and configurations
│   │   ├── supabaseClient.ts
│   │   ├── recommendationEngine.ts
│   │   ├── roleStorage.ts
│   │   └── utils.ts
│   ├── pages/            # Page components (routes)
│   │   ├── Achievements.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── CourseDetail.tsx
│   │   ├── Courses.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Login.tsx
│   │   ├── MentorDashboard.tsx
│   │   ├── NotFound.tsx
│   │   ├── Problems.tsx
│   │   ├── RewardsShop.tsx
│   │   ├── Signup.tsx
│   │   └── StudentDashboard.tsx
│   ├── App.tsx           # Main app component with routing
│   ├── App.css           # Global styles
│   ├── index.css         # Tailwind CSS imports
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables (create this)
├── components.json       # shadcn/ui configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── supabase/             # SQL migrations and Supabase functions
│   └── migrations/       # Database schema and RLS policies
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🗺️ Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index` | Landing page with hero, features, and CTA |
| `/login` | `Login` | User login page |
| `/signup` | `Signup` | User registration page |
| `/dashboard` | `Dashboard` | Main dashboard (redirects based on role) |
| `/student-dashboard` | `StudentDashboard` | Student-specific dashboard |
| `/mentor-dashboard` | `MentorDashboard` | Mentor-specific dashboard |
| `/admin-dashboard` | `AdminDashboard` | Admin panel and management |
| `/courses` | `Courses` | Browse all available courses |
| `/courses/:id` | `CourseDetail` | Individual course details and content |
| `/problems` | `Problems` | Coding challenges and problems |
| `/code-editor/:id?` | `CodeEditor` | Code editor for solving problems |
| `/leaderboard` | `Leaderboard` | Global leaderboard rankings |
| `/rewards` | `RewardsShop` | Rewards shop to redeem points |
| `/achievements` | `Achievements` | User achievements and badges |
| `*` | `NotFound` | 404 page for invalid routes |

## 🎯 Key Features Breakdown

### Role-Based Access
- **Students**: Access courses, solve problems, track progress, earn achievements
- **Mentors**: Manage students, conduct live sessions, create content
- **Admins**: Full system access, user management, analytics

### Course System
- Browse courses by category and difficulty
- Detailed course pages with curriculum
- Video lessons with progress tracking
- Course notes and downloadable resources
- Course recommendations based on progress

### Coding Challenges
- Problem sets with varying difficulty levels
- Integrated code editor with syntax highlighting
- Test case execution and results
- Submission tracking and history

### Gamification System
- Points and rewards for completing courses and challenges
- Leaderboard rankings
- Achievement badges
- Daily challenges
- Certificate generation

## 🔧 Development

### Code Style
- The project uses ESLint for code quality
- TypeScript for type safety
- Follow React best practices and hooks patterns

### Adding New Components
- Use shadcn/ui components from `src/components/ui/`
- Create reusable components in `src/components/`
- Follow the existing component structure and naming conventions

### State Management
- React Context for global state (authentication)
- TanStack Query for server state and caching
- Local state with React hooks for component-specific state

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Notes

- The backend API functions are currently placeholders. You'll need to implement the actual backend integration in the respective service files.
- Supabase is used for authentication and data storage. Make sure to configure Auth providers and run migrations in your Supabase project.
- The project uses Vite's environment variable prefix `VITE_` for client-side variables.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

<div align="center">

**Made with ❤️ by the TechKnots Team**

For questions or support, please open an issue in the repository.

</div>
#   T e c h K n o t s - L M S  
 #   T e c h K n o t s - L M S  
 