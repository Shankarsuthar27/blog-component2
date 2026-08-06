# 📰 Daily Bharat — Modern Responsive Tech & News Platform

> A production-ready, fully responsive blog website built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and **React Router DOM**. Features a modern editorial design with real-time search, category filtering, animated UI components, and a complete blog detail view.

---

## 📋 Table of Contents

- [Live Preview](#live-preview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
  - [Layout Components](#layout-components)
  - [Blog Components](#blog-components)
  - [Sidebar Components](#sidebar-components)
- [Data & Types](#data--types)
- [Routing](#routing)
- [Features](#features)
- [Design System](#design-system)
- [Responsive Behavior](#responsive-behavior)
- [NPM Scripts](#npm-scripts)
- [Dependencies](#dependencies)

---

## 🖥️ Live Preview

```bash
npm run dev
# → http://localhost:5173
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | ^19.2.8 | UI framework |
| **TypeScript** | ~6.0.2 | Type safety |
| **Tailwind CSS** | ^4.3.3 | Utility-first styling |
| **@tailwindcss/vite** | ^4.3.3 | Tailwind v4 Vite integration |
| **Vite** | ^8.2.0 | Build tool & dev server |
| **React Router DOM** | ^7.18.2 | Client-side routing |
| **Framer Motion** | ^12.43.0 | Animations & transitions |
| **Lucide React** | ^1.28.0 | Icon library |
| **Google Fonts** | — | Inter + Playfair Display |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# 1. Navigate into the project
cd "d:\blog component\insight-journal"

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
# Output → dist/
```

### Preview Production Build

```bash
npm run preview
# → http://localhost:4173
```

---

## 📁 Project Structure

```
insight-journal/
├── index.html                        # HTML entry point (Google Fonts, SEO meta)
├── vite.config.ts                    # Vite config with @tailwindcss/vite plugin
├── tailwind.config.js                # Tailwind v3-style config (legacy, unused in v4)
├── tsconfig.json                     # TypeScript project references
├── tsconfig.app.json                 # App TypeScript config (verbatimModuleSyntax ON)
├── package.json                      # Dependencies & scripts
│
└── src/
    ├── main.tsx                      # React root entry — mounts <App />
    ├── App.tsx                       # BrowserRouter + Routes setup
    ├── index.css                     # Tailwind v4 @import + @theme tokens + base styles
    │
    ├── types/
    │   └── blog.ts                   # BlogPost & Category interfaces + CATEGORIES data
    │
    ├── data/
    │   └── blogPosts.ts              # 10 mock blog posts with full article content
    │
    ├── pages/
    │   ├── BlogPage.tsx              # Main blog listing page (all state management)
    │   └── BlogDetailsPage.tsx       # Individual article detail page
    │
    └── components/
        ├── layout/
        │   ├── Header.tsx            # Sticky navigation header
        │   └── Footer.tsx            # Site-wide footer
        │
        ├── blog/
        │   ├── FeaturedPost.tsx      # Hero featured article card
        │   ├── BlogCard.tsx          # Individual blog post card
        │   ├── BlogList.tsx          # Post list with skeletons & empty state
        │   └── Pagination.tsx        # Page navigation controls
        │
        └── sidebar/
            ├── SearchWidget.tsx      # Article search input
            ├── CategoriesWidget.tsx  # Category filter list
            ├── RecentPostsWidget.tsx # 4 most recent posts
            ├── PopularPostsWidget.tsx# 3 most viewed posts
            ├── NewsletterWidget.tsx  # Email subscription form
            └── SocialWidget.tsx      # Social media link buttons
```

---

## 📄 Pages

### `BlogPage.tsx` — Main Blog Listing

**Path:** `/`  
**File:** `src/pages/BlogPage.tsx`

The root page that orchestrates the entire blog experience. Manages all global state and passes data down to child components.

**State managed:**
| State | Type | Default | Description |
|---|---|---|---|
| `searchTerm` | `string` | `''` | Current search query |
| `selectedCategory` | `string` | `''` | Active category filter |
| `currentPage` | `number` | `1` | Active pagination page |
| `isLoading` | `boolean` | `true` | Simulates 800ms load delay |

**Logic:**
- Reads `?search=` and `?category=` URL params on mount and syncs state back to URL on change
- Filters `blogPosts` by search term (checks `title`, `excerpt`, `author.name`, `category`) and `selectedCategory`
- Paginates filtered results at **3 posts per page**
- Passes `onSearch` and `onCategorySelect` callbacks to sidebar widgets

**Layout:**
```
Header
│
├── Page Hero (title + subtitle)
├── FeaturedPost (the post with featured: true)
├── Active Filter Chips (dismissible)
│
└── Grid (12-column)
    ├── col-span-8 → BlogList + Pagination
    └── col-span-4 → Sticky Sidebar
        ├── SearchWidget
        ├── CategoriesWidget
        ├── NewsletterWidget
        ├── RecentPostsWidget
        ├── PopularPostsWidget
        └── SocialWidget
│
Footer
```

---

### `BlogDetailsPage.tsx` — Article Detail View

**Path:** `/blog/:slug`  
**File:** `src/pages/BlogDetailsPage.tsx`

Displays a full blog article matched by its `slug` URL parameter.

**Features:**
- Uses `useParams` to extract `:slug` from the URL
- Finds the matching post from `blogPosts` array
- Displays a **404 state** with a back button if slug is not found
- Renders a **full-width hero image** with gradient overlay
- Shows an **overlapping article card** that rises over the hero image (`-mt-32`)
- Renders post `content` with a basic markdown parser (converts `## Heading`, `- list`, `1. list`, and paragraphs)
- Displays post **tags** as clickable chips
- Shows **share buttons** (X/Twitter, LinkedIn, copy link)
- Renders **related posts** (same category, max 3) using `BlogCard`
- Scrolls to top on slug change via `useEffect`

---

## 🧩 Components

### Layout Components

---

#### `Header.tsx`
**Path:** `src/components/layout/Header.tsx`

The sticky navigation bar at the top of every page.

**Props:** None (self-contained)

**Internal State:**
| State | Type | Description |
|---|---|---|
| `isScrolled` | `boolean` | `true` when page scroll > 20px — triggers backdrop blur |
| `isMobileOpen` | `boolean` | Controls the mobile menu drawer |
| `showSearch` | `boolean` | Shows/hides the search bar dropdown |
| `searchValue` | `string` | Controlled value of the search input |

**Key Features:**
- **Sticky positioning** with `position: fixed`, `top: 0`, `z-index: 50`
- **Backdrop blur** (`bg-white/90 backdrop-blur-md`) kicks in after 20px scroll
- **Animated search bar** — slides open below the nav when search icon is clicked; auto-focuses input
- **Active NavLink** — uses React Router `NavLink` with `isActive` for the highlighted active page
- **Subscribe button** — visible on desktop (`md:hidden`)
- **Hamburger menu** — icon animates between `Menu` and `X` with Framer Motion `AnimatePresence`
- **Mobile drawer** — slides in from the right with a backdrop overlay; closes on backdrop click
- **Body scroll lock** — adds/removes `body.menu-open` class (CSS: `overflow: hidden`)
- **Search form** — submits via `navigate('/?search=...')` from React Router

**Navigation Links:**
```ts
['Home', 'About', 'Blog', 'Categories', 'Contact']
```

---

#### `Footer.tsx`
**Path:** `src/components/layout/Footer.tsx`

The full-width dark footer at the bottom of every page, plus a floating **Back to Top** button.

**Props:** None (self-contained)

**Internal State:**
| State | Type | Description |
|---|---|---|
| `email` | `string` | Footer newsletter input value |
| `subscribed` | `boolean` | Shows success message after submission |
| `showBackToTop` | `boolean` | `true` when page scroll > 400px |

**Layout (4-column grid on desktop, stacks on mobile):**

| Column | Content |
|---|---|
| **Brand** | Logo, description, social icon row |
| **Quick Links** | Home, About, Blog, Contact, Privacy, Terms |
| **Popular Categories** | 6 category links → `/?category=...` |
| **Stay Updated** | Mini newsletter form + email contact |

**Social Media Icons:** Inline SVG brand icons for Facebook, Instagram, X/Twitter, LinkedIn, YouTube, GitHub (Lucide React v1.28 doesn't include brand icons).

**Back to Top Button:** Fixed `bottom-6 right-6`, animated in/out with Framer Motion `AnimatePresence`, smooth scrolls to `top: 0`.

---

### Blog Components

---

#### `FeaturedPost.tsx`
**Path:** `src/components/blog/FeaturedPost.tsx`

The large hero card shown directly below the header for the post marked `featured: true`.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `post` | `BlogPost` | ✅ | The featured blog post data object |

**Layout:** Two-column on desktop (image 55% / content 45%), stacks vertically on mobile.

**Visual Features:**
- Two decorative blurred circle elements (teal and blue) in corners
- `"Featured Post"` badge with a filled star icon, positioned over the image
- Category badge (cyan pill)
- Large serif title (`Playfair Display`, h1)
- 3-line clamped excerpt
- Author avatar + name + publication date + reading time
- Orange `"Read Article"` CTA button → links to `/blog/:slug`
- Image zoom on group hover (`scale-105`, 700ms transition)
- Framer Motion entrance animation (`opacity 0→1`, `y 30→0`)

---

#### `BlogCard.tsx`
**Path:** `src/components/blog/BlogCard.tsx`

Individual article card used in the main blog list and related posts section.

**Props:**
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `post` | `BlogPost` | ✅ | — | Blog post data |
| `index` | `number` | ❌ | `0` | Position in list — used to stagger animations |

**Layout:** Horizontal on desktop (`sm:flex-row`) with image on left (240px wide), vertical on mobile (`flex-col`).

**Visual Features:**
- Lazy-loaded image with zoom on hover
- Category badge overlaid on image (mobile) + inline badge (desktop)
- `h2` title with 2-line clamp, color transitions to cyan on hover
- 2-line clamped excerpt
- Author avatar, name, publication date, reading time in footer row
- `"Read More →"` link with animated arrow on hover
- Card lifts (`-translate-y-1`) and shadow deepens on hover
- **Framer Motion scroll-reveal:** `whileInView={{ opacity: 1, y: 0 }}` with `once: true` and staggered `delay: index * 0.07`

---

#### `BlogList.tsx`
**Path:** `src/components/blog/BlogList.tsx`

Renders a list of `BlogCard` components, or alternative UI states.

**Props:**
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `posts` | `BlogPost[]` | ✅ | — | Array of posts to display |
| `isLoading` | `boolean` | ❌ | `false` | Shows skeleton loaders when true |
| `searchTerm` | `string` | ❌ | `''` | Used in empty state message |
| `selectedCategory` | `string` | ❌ | `''` | Used in empty state message |

**Three Render States:**

1. **Loading** — Shows 3 animated `BlogCardSkeleton` placeholder cards (pulse animation)
2. **Empty** — Shows a centered state with a `FileSearch` icon and contextual message based on whether `searchTerm` or `selectedCategory` is set
3. **Normal** — Maps `posts` array to `BlogCard` components with staggered index prop

**Skeleton Card:** Mimics the BlogCard layout with animated `bg-slate-200` placeholders for image, category badge, title lines, excerpt lines, and meta row.

---

#### `Pagination.tsx`
**Path:** `src/components/blog/Pagination.tsx`

Page navigation controls rendered below the `BlogList`.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `currentPage` | `number` | ✅ | Currently active page (1-indexed) |
| `totalPages` | `number` | ✅ | Total number of pages |
| `onPageChange` | `(page: number) => void` | ✅ | Callback when a page is selected |

**Behavior:**
- Returns `null` (renders nothing) when `totalPages <= 1`
- **Ellipsis algorithm:** Shows first page, last page, current page ±1, and `'...'` gaps
- **Previous button:** Disabled when `currentPage === 1`; uses `ChevronLeft` icon
- **Next button:** Disabled when `currentPage === totalPages`; uses `ChevronRight` icon
- Active page button uses `bg-[#0891B2]` (primary accent) styling
- Framer Motion `whileInView` entrance animation
- `aria-current="page"` on the active page button for accessibility

---

### Sidebar Components

All sidebar components are wrapped in a `sticky top-[88px]` container inside `BlogPage.tsx`.

---

#### `SearchWidget.tsx`
**Path:** `src/components/sidebar/SearchWidget.tsx`

Provides a search input that filters the blog post list in real-time on clear, and on form submit.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | ✅ | Externally controlled current search term |
| `onChange` | `(value: string) => void` | ✅ | Called when search is submitted or input is cleared |

**Behavior:**
- Maintains an internal `localValue` state for typing — only calls `onChange` on form submit
- Immediately calls `onChange('')` when the input is cleared (backspace to empty)
- Has `role="search"` on the form and `aria-label` on the input for screen readers
- Submit button shows a `Search` icon

---

#### `CategoriesWidget.tsx`
**Path:** `src/components/sidebar/CategoriesWidget.tsx`

Displays a filterable list of blog categories with post counts.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `selectedCategory` | `string` | ✅ | The currently active category name (or `''`) |
| `onSelect` | `(category: string) => void` | ✅ | Called with category name; passing the active category again deselects it |

**Categories (from `src/types/blog.ts`):**
| Category | Posts |
|---|---|
| Technology | 12 |
| Web Development | 18 |
| React | 9 |
| UI/UX Design | 7 |
| Business | 5 |
| Artificial Intelligence | 11 |

**Active State:** Selected category gets `bg-[#0891B2]` background; count badge turns white. Clicking the active category again deselects it (`onSelect('')`).

**Accessibility:** Each button has `aria-pressed` set to `true`/`false`.

---

#### `RecentPostsWidget.tsx`
**Path:** `src/components/sidebar/RecentPostsWidget.tsx`

Shows the 4 most recently published posts.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `posts` | `BlogPost[]` | ✅ | Full list of all posts (widget sorts internally by `id` desc) |

**Layout per item:** 60×60px thumbnail + title (2-line clamp) + publication date with calendar icon.  
Each item links to `/blog/:slug`. Thumbnail zooms on hover.

---

#### `PopularPostsWidget.tsx`
**Path:** `src/components/sidebar/PopularPostsWidget.tsx`

Shows the 3 most viewed posts with large numbered positions.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `posts` | `BlogPost[]` | ✅ | Full list of all posts (widget sorts internally by `views` desc) |

**Layout per item:**
- Large **01 / 02 / 03** serif number in light slate (decorative, not interactive)
- Post title (2-line clamp) — color transitions to cyan on hover — links to `/blog/:slug`
- View count (formatted with `toLocaleString()`) + reading time in muted row

---

#### `NewsletterWidget.tsx`
**Path:** `src/components/sidebar/NewsletterWidget.tsx`

Email subscription card with form validation and success state.

**Props:** None (self-contained)

**Internal State:**
| State | Type | Description |
|---|---|---|
| `email` | `string` | Controlled email input value |
| `status` | `'idle' \| 'success' \| 'error'` | Current form state |
| `message` | `string` | Validation error or success message text |

**Validation Rules:**
- Empty input → error: `"Please enter your email address."`
- Invalid format (non-`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) → error: `"Please enter a valid email address."`
- Valid email → success state (replaces form with animated success message)

**Design:** Gradient background (`from-[#0891B2] to-[#0369A1]`) with decorative circle elements. Error messages animate in with `framer-motion`. Orange `"Subscribe Now"` CTA button.

---

#### `SocialWidget.tsx`
**Path:** `src/components/sidebar/SocialWidget.tsx`

Grid of social media platform buttons.

**Props:** None (self-contained)

**Platforms (3-column grid):**
| Platform | Hover Color |
|---|---|
| Facebook | `hover:bg-blue-600` |
| Instagram | `hover:bg-pink-600` |
| X / Twitter | `hover:bg-slate-800` |
| LinkedIn | `hover:bg-blue-700` |
| YouTube | `hover:bg-red-600` |
| GitHub | `hover:bg-slate-900` |

Each button: `hover:scale-105`, `hover:shadow-md`, tooltip via HTML `title` attribute, `aria-label` for screen readers. Icons are **inline SVG** paths (Lucide React v1.28 does not include social brand icons).

---

## 📊 Data & Types

### `BlogPost` Interface
**File:** `src/types/blog.ts`

```ts
export interface BlogPost {
  id: number;           // Unique identifier
  slug: string;         // URL slug e.g. "future-of-react-server-components"
  title: string;        // Article headline
  excerpt: string;      // Short summary (used in cards and meta descriptions)
  content: string;      // Full article body (markdown-like text)
  category: string;     // One of the 6 categories
  image: string;        // Unsplash image URL
  author: {
    name: string;       // Author display name
    avatar: string;     // Avatar image URL (pravatar.cc)
    bio?: string;       // Optional biography (shown in detail page)
  };
  publishedAt: string;  // Formatted date string e.g. "Aug 2, 2026"
  readingTime: string;  // e.g. "6 min read"
  views: number;        // View count (used for popular posts ranking)
  featured?: boolean;   // If true, shown in FeaturedPost hero section
  tags?: string[];      // Optional tags array (shown in detail page)
}
```

### `Category` Interface
```ts
export interface Category {
  name: string;   // Display name
  count: number;  // Number of articles in category
  slug: string;   // URL-friendly slug
}
```

### Mock Data — `blogPosts.ts`
**File:** `src/data/blogPosts.ts`

Contains **10 fully-written mock articles** with realistic content:

| # | Title | Category | Views | Featured |
|---|---|---|---|---|
| 1 | The Future of Web Development with React Server Components | React | 12,050 | ✅ |
| 2 | Essential UI/UX Design Principles Every Developer Should Know | UI/UX Design | 8,904 | — |
| 3 | Mastering TypeScript: Advanced Patterns for Large-Scale Apps | Web Development | 7,620 | — |
| 4 | How AI is Reshaping the Future of Software Development | Artificial Intelligence | 15,230 | — |
| 5 | Web Performance Optimization: The Complete Guide for 2026 | Technology | 9,870 | — |
| 6 | Building a Scalable Design System from Scratch in 2026 | UI/UX Design | 6,340 | — |
| 7 | Choosing the Right Tech Stack for Your Startup in 2026 | Business | 11,200 | — |
| 8 | CSS Grid Mastery: Layouts That Were Impossible 5 Years Ago | Web Development | 5,890 | — |
| 9 | Securing Modern Web Apps: OWASP Top 10 for React Developers | Technology | 8,450 | — |
| 10 | Framer Motion: Advanced Animation Patterns for React Apps | React | 7,130 | — |

---

## 🗺️ Routing

**File:** `src/App.tsx`

```
BrowserRouter
└── Routes
    ├── "/"           → <BlogPage />          (Main blog listing)
    └── "/blog/:slug" → <BlogDetailsPage />   (Article detail view)
```

React Router v7 is used. The `useNavigate` hook is used in the Header to redirect from the search bar. `useSearchParams` is used in `BlogPage` to sync filters to the URL.

**URL Parameter Examples:**
```
/?search=react          → Filters posts containing "react"
/?category=Technology   → Shows only Technology posts
/blog/ui-ux-principles-2026  → Article detail view
```

---

## ✨ Features

### Search & Filtering
- **Real-time search** across title, excerpt, author name, and category
- **Category filter** with active toggle (click again to deselect)
- **URL sync** — filters persist in the URL and survive browser refresh
- **Active filter chips** with `×` dismiss buttons shown above the post list
- Filters are **mutually exclusive** — setting a search clears the category, and vice versa

### Pagination
- **3 posts per page** (configurable via `POSTS_PER_PAGE` constant in `BlogPage.tsx`)
- Ellipsis (`…`) for large page counts
- Auto-scrolls to top on page change
- Resets to page 1 whenever search or category changes

### Animations (Framer Motion)
| Element | Animation |
|---|---|
| Featured Post | Fade + slide-up on mount |
| Blog Cards | Staggered scroll-reveal (7ms delay per card) |
| Mobile Menu Icon | Rotate in/out (Menu ↔ X) |
| Mobile Drawer | Slide in from right + backdrop fade |
| Search Bar | Expand/collapse with height animation |
| Newsletter Messages | Scale + fade |
| Back to Top Button | Scale pop in/out |
| Pagination | Fade + slide-up on scroll-into-view |

### Accessibility
- Semantic HTML5 (`<header>`, `<main>`, `<aside>`, `<footer>`, `<article>`, `<nav>`, `<section>`)
- `aria-label` on all icon-only buttons
- `aria-label` on navigation landmarks
- `aria-current="page"` on active pagination button
- `aria-pressed` on category filter buttons
- `aria-expanded` on hamburger button
- `role="search"` on search form
- `sr-only` labels on all form inputs
- `alt` text on all images
- Keyboard-navigable (all interactive elements are focusable)

### UX Details
- Lazy-loaded images with `loading="lazy"`
- Image zoom on hover (700ms ease-out transition)
- Card lift on hover (`-translate-y-1`)
- Body scroll lock during mobile menu open
- 404 page for unknown blog slugs
- `useEffect` scrolls to top on article slug change
- Loading skeletons for 800ms on initial page load

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Page Background | `#F8FAFC` | Body background |
| Card Background | `#FFFFFF` | All card surfaces |
| Primary Dark | `#0F172A` | Headlines, footer background |
| Secondary Dark | `#1E293B` | Footer social buttons |
| Primary Accent | `#0891B2` | Links, active states, borders, buttons |
| Secondary Accent | `#06B6D4` | Gradient endpoints, hover highlights |
| Button Accent | `#F97316` | CTA buttons (orange) |
| Main Text | `#111827` | Body copy |
| Muted Text | `#64748B` | Meta, secondary text, placeholders |
| Border Light | `#E2E8F0` | Card borders, dividers |

### Typography

| Role | Font | Weight |
|---|---|---|
| Headings / Titles | Playfair Display | 600, 700, 800 |
| Body / UI | Inter | 300, 400, 500, 600, 700 |

### Spacing & Shape
- **Max container width:** 1200px (`max-w-[1200px] mx-auto`)
- **Border radius:** 16px (`rounded-2xl`) for cards, 12px (`rounded-xl`) for inputs/buttons
- **Shadows:** `shadow-sm` default → `shadow-lg` on hover
- **Sidebar sticky offset:** `top-[88px]` (below 70px header + padding)

---

## 📱 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| **Mobile** (< 640px) | Single column, FeaturedPost stacks, BlogCards stack vertically, sidebar below posts |
| **Tablet** (640px – 1024px) | BlogCards go horizontal (`sm:flex-row`), sidebar still below posts |
| **Desktop** (≥ 1024px) | 2-column grid (8+4 col), sticky sidebar, full nav visible |

Tailwind breakpoints used: `sm:`, `md:`, `lg:`

**No horizontal overflow** — all layouts use `overflow-hidden` and responsive grid/flex.

---

## 📜 NPM Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Starts Vite dev server with HMR |
| `build` | `tsc -b && vite build` | TypeScript type-check + production build |
| `preview` | `vite preview` | Serves the `dist/` production build locally |
| `lint` | `oxlint` | Runs OxLint static analysis |

---

## 📦 Dependencies

### Runtime Dependencies

| Package | Version | Used For |
|---|---|---|
| `react` | ^19.2.8 | Core UI framework |
| `react-dom` | ^19.2.8 | React DOM renderer |
| `react-router-dom` | ^7.18.2 | `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useParams`, `useNavigate`, `useSearchParams` |
| `framer-motion` | ^12.43.0 | `motion`, `AnimatePresence`, `whileInView` animations |
| `lucide-react` | ^1.28.0 | Icon components (`Search`, `Menu`, `X`, `BookOpen`, `Calendar`, `Clock`, `ArrowRight`, etc.) |

### Dev Dependencies

| Package | Version | Used For |
|---|---|---|
| `vite` | ^8.2.0 | Build tool & dev server |
| `@vitejs/plugin-react` | ^6.0.4 | React Fast Refresh support in Vite |
| `tailwindcss` | ^4.3.3 | Utility-first CSS framework (v4) |
| `@tailwindcss/vite` | ^4.3.3 | Tailwind v4 Vite plugin (replaces PostCSS approach) |
| `typescript` | ~6.0.2 | Static type checking |
| `@types/react` | ^19.2.17 | React type definitions |
| `@types/react-dom` | ^19.2.3 | ReactDOM type definitions |
| `@types/node` | ^24.13.3 | Node.js type definitions |
| `oxlint` | ^1.75.0 | Fast Rust-based linter |
| `autoprefixer` | ^10.5.4 | CSS vendor prefix automation |
| `postcss` | ^8.5.25 | CSS transformation pipeline |

---

## ⚙️ Tailwind v4 Configuration

This project uses **Tailwind CSS v4** which uses a **CSS-based configuration** instead of `tailwind.config.js`.

**`src/index.css`:**
```css
@import "tailwindcss";

@theme {
  --color-primaryAccent: #0891B2;
  --color-buttonAccent: #F97316;
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-serif: 'Playfair Display', Georgia, serif;
  /* ... */
}
```

**`vite.config.ts`:**
```ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

> **Note:** The `tailwind.config.js` file in the root is a legacy artifact from the initial scaffold and is not active in v4. All theme tokens live in `src/index.css`.

---

## 🔧 Known Limitations & Notes

- **Social brand icons** (Facebook, Instagram, etc.) are rendered as **inline SVG** because `lucide-react@1.28.0` does not include social media brand icons.
- **`verbatimModuleSyntax`** is enabled in `tsconfig.app.json`, so all type-only imports use `import type { ... }`.
- The **newsletter subscription** and **social media links** are frontend-only with no backend integration.
- The **blog content renderer** is a basic line-by-line Markdown parser. It supports `## headings`, `- bullet lists`, `1. numbered lists`, and paragraphs. For production, use a library like `react-markdown`.
- Posts are stored as **static mock data**. To connect to a real CMS or API, replace `src/data/blogPosts.ts` with API calls and add `React.Suspense` or a loading state.

---

## 📝 License

This project is created for demonstration and educational purposes.

---

*Built with ❤️ using React 19, TypeScript, Tailwind CSS v4, and Framer Motion.*
