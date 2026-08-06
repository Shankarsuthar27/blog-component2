import type { BlogPost } from '../types/blog';

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'future-of-react-server-components',
    title: 'The Future of Web Development with React Server Components',
    excerpt:
      'Discover how React Server Components are reshaping the ecosystem, enabling faster load times, improved SEO, and zero-bundle-size server logic without sacrificing interactivity.',
    content: `React Server Components (RSC) represent one of the most significant architectural shifts in the React ecosystem since hooks were introduced in 2018. They allow developers to render components on the server, reducing the JavaScript bundle sent to the client while maintaining a seamless interactive experience.

## What Are Server Components?

Server Components run exclusively on the server and never ship their code to the browser. This means you can directly access databases, file systems, or any server-side resource without needing to write a separate API layer. The result? Dramatically smaller bundles and faster page loads.

## Key Benefits

- **Zero bundle size**: Server component code never ships to the client
- **Direct data access**: Query databases directly without REST or GraphQL APIs
- **Automatic code splitting**: Each component is a natural code-split boundary
- **Improved security**: Sensitive logic stays on the server

## Getting Started

In Next.js 13+, all components in the \`app\` directory are Server Components by default. You only need to opt into client components when you need interactivity.

\`\`\`jsx
// This is a Server Component by default
async function BlogList() {
  const posts = await db.query('SELECT * FROM posts');
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
\`\`\`

The paradigm shift is profound — we're moving from a model where the server serves raw data and the client builds UIs, to one where the server participates in rendering while the client handles only what needs to be interactive.`,
    category: 'React',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Sarah Drasner',
      avatar: 'https://i.pravatar.cc/150?u=sarah-drasner',
      bio: 'Sarah is a VP of Developer Experience at Netlify, author, and speaker on web performance and animation.',
    },
    publishedAt: 'Aug 2, 2026',
    readingTime: '6 min read',
    views: 12050,
    featured: true,
    tags: ['React', 'Server Components', 'Performance'],
  },
  {
    id: 2,
    slug: 'ui-ux-principles-2026',
    title: 'Essential UI/UX Design Principles Every Developer Should Know',
    excerpt:
      'Explore the definitive guide to creating accessible, beautiful, and user-friendly interfaces. From visual hierarchy to micro-interactions, learn what separates good design from great.',
    content: `Great design is invisible. When a user navigates your app effortlessly, they're experiencing the result of hundreds of deliberate decisions made by designers and developers working in harmony.

## The Hierarchy of Needs in UX

Abraham Maslow's hierarchy maps to user experience better than you'd think. Users need:

1. **Functionality** — Does it work?
2. **Reliability** — Does it work consistently?
3. **Usability** — Can I figure it out?
4. **Proficiency** — Does it empower me?
5. **Creativity** — Does it delight me?

## Visual Hierarchy

Every interface has a natural reading order. Guide the user's eye using size, color, contrast, and spacing. The most important element should be the most visually dominant.

## Micro-Interactions

Small animations that acknowledge user actions build trust and feel premium. A loading spinner, a subtle button press, a success checkmark — these signal that the interface is alive and responsive.

## Accessibility First

Accessibility isn't a feature — it's a foundation. Semantic HTML, sufficient color contrast, keyboard navigation, and screen reader support should be default requirements, not afterthoughts.`,
    category: 'UI/UX Design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?u=alex-chen',
      bio: 'Alex is a product designer with 10 years of experience crafting digital products at Figma and Stripe.',
    },
    publishedAt: 'Jul 28, 2026',
    readingTime: '5 min read',
    views: 8904,
    tags: ['Design', 'UX', 'Accessibility'],
  },
  {
    id: 3,
    slug: 'mastering-typescript-advanced-patterns',
    title: 'Mastering TypeScript: Advanced Patterns for Large-Scale Apps',
    excerpt:
      'Go beyond basic types and unlock TypeScript\'s full power. Learn discriminated unions, conditional types, template literal types, and design patterns that scale.',
    content: `TypeScript has become the de facto standard for large JavaScript codebases. But most developers only scratch the surface of what the type system can do.

## Discriminated Unions

One of the most powerful patterns in TypeScript is the discriminated union, which allows you to write exhaustive, type-safe code:

\`\`\`typescript
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };
\`\`\`

## Template Literal Types

TypeScript 4.1 introduced template literal types, enabling incredibly precise string typing:

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
type ClickEvent = 'onClick'; // Valid
\`\`\`

## Conditional Types

Write types that adapt based on their inputs — the if/else of the type world:

\`\`\`typescript
type NonNullable<T> = T extends null | undefined ? never : T;
\`\`\`

These patterns, when combined, allow you to build APIs that are both flexible and completely type-safe.`,
    category: 'Web Development',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'James Turner',
      avatar: 'https://i.pravatar.cc/150?u=james-turner',
      bio: 'James is a senior software engineer specializing in TypeScript and compiler design.',
    },
    publishedAt: 'Jul 22, 2026',
    readingTime: '8 min read',
    views: 7620,
    tags: ['TypeScript', 'JavaScript', 'Programming'],
  },
  {
    id: 4,
    slug: 'ai-reshaping-software-development',
    title: 'How AI is Reshaping the Future of Software Development',
    excerpt:
      'From AI pair programmers to automated testing and intelligent code review, explore how artificial intelligence is augmenting developer workflows and what it means for the future of coding.',
    content: `Artificial intelligence is no longer a futuristic concept — it's a daily reality in modern software development. Tools like GitHub Copilot, Cursor, and Claude have fundamentally changed how developers write code.

## AI as a Pair Programmer

AI coding assistants excel at boilerplate, repetitive patterns, and suggesting completions based on context. They free developers to focus on architecture, domain logic, and creative problem-solving.

## Automated Code Review

AI-powered code review tools can catch potential bugs, security vulnerabilities, and performance issues before human reviewers even see the PR. This shifts the review conversation toward design and business logic.

## The 10x Developer Myth — Revisited

AI doesn't create 10x developers. It makes every developer more productive. The competitive advantage now lies in knowing what to build, not just how to build it.

## What Won't Change

- **Systems thinking** remains human
- **Understanding user needs** requires empathy
- **Architectural decisions** need business context
- **Debugging complex systems** still needs experience`,
    category: 'Artificial Intelligence',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?u=priya-sharma',
      bio: 'Priya is an AI researcher and developer advocate helping teams integrate AI into their engineering workflows.',
    },
    publishedAt: 'Jul 18, 2026',
    readingTime: '7 min read',
    views: 15230,
    tags: ['AI', 'Future', 'Productivity'],
  },
  {
    id: 5,
    slug: 'web-performance-optimization-2026',
    title: 'Web Performance Optimization: The Complete Guide for 2026',
    excerpt:
      'Core Web Vitals, lazy loading, edge caching, and modern image formats — a practical, hands-on guide to making your web app blazing fast and ranking higher in search.',
    content: `Performance is not a feature — it's the feature. Studies consistently show that a 100ms delay in load time can reduce conversion rates by 7%.

## Core Web Vitals in 2026

Google's ranking signals have evolved:
- **LCP** (Largest Contentful Paint) < 2.5s
- **INP** (Interaction to Next Paint) < 200ms  
- **CLS** (Cumulative Layout Shift) < 0.1

## Image Optimization

Modern formats like AVIF and WebP can reduce image sizes by 50-80% compared to JPEG. Always use responsive images with \`srcset\`:

\`\`\`html
<img 
  src="hero.avif"
  srcset="hero-400.avif 400w, hero-800.avif 800w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="Hero image"
/>
\`\`\`

## Edge Computing

Deploying to edge networks like Cloudflare Workers or Vercel Edge reduces latency by serving users from locations geographically close to them.`,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Marcus Webb',
      avatar: 'https://i.pravatar.cc/150?u=marcus-webb',
      bio: 'Marcus is a performance engineer at Vercel, focused on making the web faster for everyone.',
    },
    publishedAt: 'Jul 14, 2026',
    readingTime: '10 min read',
    views: 9870,
    tags: ['Performance', 'Core Web Vitals', 'SEO'],
  },
  {
    id: 6,
    slug: 'building-design-system-from-scratch',
    title: 'Building a Scalable Design System from Scratch in 2026',
    excerpt:
      'Learn how to architect, document, and maintain a design system that empowers your team. From design tokens to accessible component libraries and living documentation.',
    content: `A design system is not a UI kit. It's a shared language between designers and developers — a single source of truth that enables teams to build consistent, high-quality products at speed.

## Start with Design Tokens

Tokens are the atoms of your design system. They encode decisions like colors, spacing, typography, and motion:

\`\`\`json
{
  "color": {
    "brand": {
      "primary": { "value": "#0891B2" },
      "secondary": { "value": "#06B6D4" }
    }
  },
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  }
}
\`\`\`

## Component Architecture

Follow the atomic design methodology: atoms → molecules → organisms → templates → pages. Each level builds on the one below.

## Living Documentation

A design system without documentation is just a component library. Use tools like Storybook to create interactive, always-up-to-date docs that serve both designers and developers.`,
    category: 'UI/UX Design',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Elena Vasquez',
      avatar: 'https://i.pravatar.cc/150?u=elena-vasquez',
      bio: 'Elena is a design systems lead at Airbnb, building DLS (Design Language System) tools and processes.',
    },
    publishedAt: 'Jul 9, 2026',
    readingTime: '9 min read',
    views: 6340,
    tags: ['Design Systems', 'Storybook', 'Components'],
  },
  {
    id: 7,
    slug: 'startup-tech-stack-2026',
    title: 'Choosing the Right Tech Stack for Your Startup in 2026',
    excerpt:
      'With hundreds of frameworks, databases, and cloud providers available, how do you choose? A pragmatic guide for founders and CTOs making architectural decisions that will define their company.',
    content: `The best tech stack is the one your team knows. This sounds obvious, but it's the most violated principle in startup engineering.

## The Cost of Wrong Choices

Switching databases at scale is a months-long engineering project. Rewriting from one framework to another takes even longer. Make these decisions deliberately.

## The 2026 Recommended Stack

For most startups in 2026, the following stack offers the best combination of velocity, scalability, and hiring pool:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js (Fastify) or Go
- **Database**: PostgreSQL + Redis
- **ORM**: Drizzle or Prisma
- **Hosting**: Vercel (frontend) + Railway (backend)
- **Auth**: Clerk or Auth.js

## When to Deviate

Use specialized tools when the problem demands it:
- **Real-time**: Elixir + Phoenix
- **ML workloads**: Python + FastAPI
- **High-throughput**: Go or Rust`,
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?u=david-kim',
      bio: 'David is a CTO consultant who has helped 30+ startups architect and scale their engineering systems.',
    },
    publishedAt: 'Jul 5, 2026',
    readingTime: '6 min read',
    views: 11200,
    tags: ['Startup', 'Architecture', 'Business'],
  },
  {
    id: 8,
    slug: 'css-grid-mastery',
    title: 'CSS Grid Mastery: Layouts That Were Impossible 5 Years Ago',
    excerpt:
      'CSS Grid has matured into the most powerful layout tool on the web. Explore advanced techniques — subgrid, named template areas, auto-placement algorithms, and creative grid hacks.',
    content: `When CSS Grid landed in 2017, it was revolutionary. In 2026, with subgrid support in all major browsers, we can finally build layouts that would have required complex JavaScript hacks just five years ago.

## Subgrid: The Missing Piece

Subgrid allows child elements to participate in the parent grid's track structure:

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}
\`\`\`

This makes cards with images, titles, and descriptions align perfectly across rows — something that was previously only achievable with JavaScript.

## Named Template Areas

Named areas make complex layouts readable:

\`\`\`css
.layout {
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
\`\`\`

## Auto-Placement Algorithm

CSS Grid's auto-placement can create masonry-like layouts without any JavaScript.`,
    category: 'Web Development',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Rachel Lee',
      avatar: 'https://i.pravatar.cc/150?u=rachel-lee',
      bio: 'Rachel is a CSS specialist and author of "Modern CSS Patterns". She contributes to the CSS Working Group.',
    },
    publishedAt: 'Jun 29, 2026',
    readingTime: '7 min read',
    views: 5890,
    tags: ['CSS', 'Grid', 'Layout'],
  },
  {
    id: 9,
    slug: 'securing-web-applications-owasp-top-10',
    title: 'Securing Modern Web Apps: OWASP Top 10 for React Developers',
    excerpt:
      'Security is a developer responsibility. Walk through the OWASP Top 10 vulnerabilities from a React developer\'s perspective with practical prevention techniques and code examples.',
    content: `Security vulnerabilities cost companies millions and destroy user trust. As a frontend developer, you're the last line of defense against many common attacks.

## XSS — Cross-Site Scripting

React's JSX automatically escapes values, but dangerouslySetInnerHTML is exactly what it sounds like — dangerous:

\`\`\`jsx
// NEVER do this with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Always sanitize with DOMPurify if you must render HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
\`\`\`

## CSRF — Cross-Site Request Forgery

Use SameSite=Strict cookies and CSRF tokens for all state-changing operations.

## Sensitive Data Exposure

Never store sensitive data in localStorage. It's accessible to any JavaScript on the page. Use httpOnly cookies for tokens.

## Dependency Security

Run \`npm audit\` regularly and use tools like Snyk to monitor your dependencies for known vulnerabilities.`,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Omar Hassan',
      avatar: 'https://i.pravatar.cc/150?u=omar-hassan',
      bio: 'Omar is a security engineer at HackerOne, specializing in web application security and responsible disclosure.',
    },
    publishedAt: 'Jun 23, 2026',
    readingTime: '11 min read',
    views: 8450,
    tags: ['Security', 'OWASP', 'Best Practices'],
  },
  {
    id: 10,
    slug: 'framer-motion-advanced-animations',
    title: 'Framer Motion: Advanced Animation Patterns for React Apps',
    excerpt:
      'Go beyond basic fade-ins. Explore orchestrated animations, shared layout transitions, scroll-driven effects, gesture recognition, and physics-based springs with Framer Motion.',
    content: `Animation is the language of UI. When done well, it makes interfaces feel alive, responsive, and premium. When done poorly, it feels sluggish and distracting. Framer Motion gives React developers the best tools to get it right.

## Orchestration with Variants

\`\`\`jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AnimatedList({ items }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>{item.text}</motion.li>
      ))}
    </motion.ul>
  );
}
\`\`\`

## Shared Layout Animations

\`AnimatePresence\` and \`layout\` props enable smooth transitions between different UI states.

## Scroll-Driven Animations

\`useScroll\` and \`useTransform\` create parallax effects and scroll-linked progress indicators without a single scroll event listener.`,
    category: 'React',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Nina Patel',
      avatar: 'https://i.pravatar.cc/150?u=nina-patel',
      bio: 'Nina is a creative developer and motion designer who specializes in React animations and interactive experiences.',
    },
    publishedAt: 'Jun 17, 2026',
    readingTime: '8 min read',
    views: 7130,
    tags: ['Animation', 'Framer Motion', 'React'],
  },
];
