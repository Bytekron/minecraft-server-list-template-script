# ServerCraft - Premium Minecraft Server List Template

(Legacy Server List Template from Minecraft Server Buzz Script)

Legacy Website Template from [Minecraft Server Buzz](https://minecraftserver.buzz)

Demo: [Legacy Minecraft Server List Demo](https://magnificent-douhua-b85183.netlify.app)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)

A **production-ready**, **fully-featured** Minecraft server list template built with modern web technologies. Perfect for creating your own Minecraft server listing website with advanced features like user authentication, server monitoring, analytics, and more.


<img width="552" height="759" alt="minecraft server list website template script" src="https://github.com/user-attachments/assets/90349930-51d8-4e3a-9456-e3bdc7326ae5" />




---

## 🌟 **Features**

### 🎯 **Core Functionality**
- **Server List** - Comprehensive listing with filtering, search, and pagination
- **Category Pages** - Dedicated pages for gamemodes, versions, and platforms
- **Server Detail Pages** - Individual pages for each server with full details
- **User Authentication** - Email/password authentication with Supabase
- **Server Management** - Add, edit, and manage your servers
- **Admin Panel** - Moderate and approve server submissions
- **Voting System** - Users can vote for their favorite servers
- **Reviews & Ratings** - Rate and review servers
- **Sponsored Servers** - Featured listings for premium visibility

### 🔧 **Advanced Features**
- **Server Monitoring** - Automatic server ping checks every 30 minutes
- **Analytics Tracking** - Track impressions, clicks, votes, and IP copies
- **Server Icons** - Display server favicons
- **Custom Banners** - Upload and display custom server banners
- **SEO Optimized** - Dynamic sitemap generation and meta tags
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Updates** - Server status updates in real-time

### 🎨 **Filtering & Search**
- Filter by gamemode (40+ gamemodes supported)
- Filter by Minecraft version (1.7 - 1.21)
- Filter by platform (Java, Bedrock, Cross-platform)
- Filter by country (100+ countries)
- Sort by votes, players, or latest
- Full-text search across server names, descriptions, and IPs

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Bytekron/minecraft-server-list-template-script.git
cd minecraft-server-list
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get your Supabase credentials from your Supabase project dashboard.

4. **Set up the database**

Run the migrations in your Supabase dashboard or use the Supabase CLI:

```bash
supabase migration up
```

5. **Start development server**
```bash
npm run dev
```

6. **Open your browser** to `http://localhost:3000`

---

## 📁 **Project Structure**

```
minecraft-server-list/
├── 📁 public/                    # Static assets
│   ├── 🖼️ *.webp, *.png          # Images and banners
│   ├── 🤖 robots.txt             # SEO robots file
│   └── 🗺️ sitemap.xml            # SEO sitemap
├── 📁 src/
│   ├── 📁 app/                    # Next.js app directory
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── 📁 admin/             # Admin panel page
│   │   ├── 📁 category/[category]/ # Category pages
│   │   ├── 📁 server/[slug]/     # Server detail pages
│   │   ├── 📁 my-servers/        # User's servers page
│   │   ├── 📁 edit-account/      # Account settings page
│   │   └── 📁 api/               # API routes
│   ├── 📁 components/            # React components
│   │   ├── Navigation.tsx        # Navigation with filters
│   │   ├── ServerList.tsx        # Server list component
│   │   ├── ServerPage.tsx        # Server detail page
│   │   ├── AuthModal.tsx         # Login/register modal
│   │   ├── AddServerModal.tsx    # Add server modal
│   │   ├── EditServerModal.tsx   # Edit server modal
│   │   ├── VotingModal.tsx       # Voting modal
│   │   ├── SponsoredServers.tsx  # Sponsored servers
│   │   ├── AdminPanel.tsx        # Admin dashboard
│   │   └── Footer.tsx            # Footer component
│   ├── 📁 data/                  # Data configurations
│   │   └── categoryDefinitions.ts # Category metadata
│   ├── 📁 hooks/                 # Custom React hooks
│   │   └── useAuth.ts            # Authentication hook
│   ├── 📁 lib/                   # Utility libraries
│   │   └── supabase.ts           # Supabase client
│   ├── 📁 services/              # Business logic services
│   │   ├── serverService.ts      # Server CRUD operations
│   │   ├── analyticsService.ts   # Analytics tracking
│   │   ├── serverMonitoringService.ts # Server monitoring
│   │   ├── sponsoredServerService.ts  # Sponsored servers
│   │   ├── adminService.ts       # Admin operations
│   │   ├── cronService.ts        # Background tasks
│   │   └── sitemapService.ts     # Sitemap generation
│   └── 📁 types/                 # TypeScript types
│       └── database.ts           # Database types
├── 📁 supabase/
│   ├── 📁 migrations/            # Database migrations
│   └── 📁 functions/             # Edge functions
│       ├── server-monitor/       # Server monitoring function
│       └── sitemap-servers/      # Sitemap generation function
├── 📋 package.json               # Dependencies
├── ⚙️ tailwind.config.js         # Tailwind configuration
├── ⚙️ next.config.js             # Next.js configuration
└── 📖 README.md                  # This file
```

---

## 🎨 **Customization**

### 🎯 **Branding**

1. Update logo and branding in `src/components/Navigation.tsx`
2. Change color scheme in `tailwind.config.js`
3. Update meta tags in `src/app/layout.tsx`

### 📦 **Database Schema**

The template includes the following tables:
- `servers` - Server listings with all metadata
- `user_profiles` - User profiles and settings
- `reviews` - Server reviews and ratings
- `votes` - Voting records
- `sponsored_servers` - Sponsored server listings
- `server_analytics` - Analytics data
- `server_icons` - Server favicon storage
- `admin_settings` - Admin configuration

All tables have Row Level Security (RLS) policies enabled for data protection.

### 🌐 **Supported Categories**

The template supports 40+ server categories including:
- **Gamemodes**: Survival, PvP, Skyblock, Prison, Factions, Creative, and more
- **Platforms**: Java Edition, Bedrock Edition, Cross-platform
- **Versions**: Minecraft 1.7 through 1.21
- **Special**: Popular, New, Whitelist servers

---

## 🔧 **Configuration**

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new Supabase project
2. Run all migrations from `supabase/migrations/`
3. Deploy edge functions from `supabase/functions/`
4. Configure authentication providers (email/password is default)

### Server Monitoring

The template includes automatic server monitoring via edge functions that:
- Ping servers every 30 minutes
- Update player counts and status
- Store server icons
- Calculate uptime percentages

---

## 🚀 **Deployment**

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## 🔍 **SEO Features**

- **Dynamic Sitemap** - Auto-generated XML sitemap
- **Server-side Rendering** - Full SSR with Next.js
- **Meta Tags** - Dynamic meta tags for each page
- **Structured Data** - Schema.org markup for servers
- **Robots.txt** - Search engine crawling configuration
- **Open Graph** - Social media preview cards

---

## 🛡️ **Security**

- **Row Level Security** - All database tables protected with RLS
- **Authentication** - Secure email/password auth with Supabase
- **Input Validation** - Server-side validation for all inputs
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - Built-in with Next.js
- **Rate Limiting** - API rate limiting on edge functions

---

## 📊 **Analytics**

The template tracks:
- Server impressions (views)
- Server page clicks
- IP address copies
- Votes
- Review submissions

All analytics data is stored in Supabase and can be viewed in the admin panel or server analytics pages.

---

## 🎮 **Tech Stack**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

---

## 📄 **License**

This template is licensed under the **MIT License**. You can:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use for client projects
- ✅ Remove attribution (optional)

See [LICENSE](./LICENSE) for full details.

---

## 💬 **Support**

### Want to buy your own custom [minecraft server list](https://minecraftserver.buzz)?
- Discord: bytekron

---

## 🎉 **Credits**

Built with modern web technologies and best practices. Special thanks to the Minecraft server community.

---

<div align="center">

**Made with ❤️ for the Minecraft community**

</div>
