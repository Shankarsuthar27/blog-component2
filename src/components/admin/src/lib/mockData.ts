import type { Blog, Category, Tag, Comment, NewsletterSubscriber, SystemSettings, ActivityLog } from '../types/admin';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Technology',
    slug: 'technology',
    color: '#0ea5e9',
    icon: 'Cpu',
    description: 'Latest updates from the tech world, hardware, and gadgets.',
    created_at: '2026-01-01T00:00:00Z',
    blog_count: 12
  },
  {
    id: 'cat-2',
    name: 'Web Development',
    slug: 'web-development',
    color: '#10b981',
    icon: 'Code',
    description: 'Frontend, backend, developer workflows, and frameworks.',
    created_at: '2026-01-02T00:00:00Z',
    blog_count: 18
  },
  {
    id: 'cat-3',
    name: 'React',
    slug: 'react',
    color: '#06b6d4',
    icon: 'Atom',
    description: 'React, React Native, hooks, Next.js, and components.',
    created_at: '2026-01-03T00:00:00Z',
    blog_count: 9
  },
  {
    id: 'cat-4',
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    color: '#ec4899',
    icon: 'Palette',
    description: 'User interfaces, layouts, accessibility, and dynamic aesthetics.',
    created_at: '2026-01-04T00:00:00Z',
    blog_count: 7
  },
  {
    id: 'cat-5',
    name: 'Business',
    slug: 'business',
    color: '#f59e0b',
    icon: 'Briefcase',
    description: 'Startups, venture capital, scaling products, and operations.',
    created_at: '2026-01-05T00:00:00Z',
    blog_count: 5
  },
  {
    id: 'cat-6',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    color: '#8b5cf6',
    icon: 'Brain',
    description: 'Machine learning, large language models, and AI tooling.',
    created_at: '2026-01-06T00:00:00Z',
    blog_count: 11
  }
];

export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'React Server Components', slug: 'react-server-components', blog_count: 5 },
  { id: 'tag-2', name: 'Performance', slug: 'performance', blog_count: 8 },
  { id: 'tag-3', name: 'TypeScript', slug: 'typescript', blog_count: 12 },
  { id: 'tag-4', name: 'CSS Grid', slug: 'css-grid', blog_count: 4 },
  { id: 'tag-5', name: 'Startup Stack', slug: 'startup-stack', blog_count: 3 },
  { id: 'tag-6', name: 'AI Workflows', slug: 'ai-workflows', blog_count: 6 },
  { id: 'tag-7', name: 'Accessibility', slug: 'accessibility', blog_count: 10 }
];

export const mockBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: 'The Future of Web Development with React Server Components',
    slug: 'future-of-react-server-components',
    excerpt: 'Discover how Server Components are reshaping the React ecosystem, offering faster load times and improved SEO without sacrificing interactivity.',
    content: 'React Server Components (RSC) represent one of the most significant architectural shifts in the React ecosystem...',
    featured_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-3',
    author_id: 'mock-admin-id',
    reading_time: '6 min read',
    views: 12050,
    featured: true,
    status: 'published',
    seo_title: 'React Server Components: Future of Web Dev',
    seo_description: 'An in-depth analysis of RSC architecture, benefits, and local preview guides.',
    canonical_url: 'https://insightjournal.com/blog/future-of-react-server-components',
    og_image: null,
    published_at: '2026-08-02T10:00:00Z',
    scheduled_at: null,
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-02T10:00:00Z'
  },
  {
    id: 'blog-2',
    title: 'Essential UI/UX Design Principles Every Developer Should Know',
    slug: 'ui-ux-principles-2026',
    excerpt: 'Explore the definitive guide to creating accessible, beautiful, and user-friendly interfaces in modern web applications.',
    content: 'Great design is invisible. When a user navigates your app effortlessly, they are experiencing design principles...',
    featured_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-4',
    author_id: 'mock-admin-id',
    reading_time: '5 min read',
    views: 8904,
    featured: false,
    status: 'published',
    seo_title: 'Developer Guide to Essential UI/UX Principles',
    seo_description: 'Accessibility, visual hierarchies, and micro-interactions for modern frontend engineers.',
    canonical_url: null,
    og_image: null,
    published_at: '2026-07-28T14:30:00Z',
    scheduled_at: null,
    created_at: '2026-07-28T10:00:00Z',
    updated_at: '2026-07-28T14:30:00Z'
  },
  {
    id: 'blog-3',
    title: 'Mastering TypeScript: Advanced Patterns for Large-Scale Apps',
    slug: 'mastering-typescript-advanced-patterns',
    excerpt: 'Go beyond basic types and unlock TypeScript\'s full power. Learn discriminated unions, conditional types, and template literals.',
    content: 'TypeScript has become the de facto standard for scalable frontends. But did you know compiler schemas can automate validations...',
    featured_image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-2',
    author_id: 'mock-admin-id',
    reading_time: '8 min read',
    views: 7620,
    featured: false,
    status: 'published',
    seo_title: null,
    seo_description: null,
    canonical_url: null,
    og_image: null,
    published_at: '2026-07-22T09:15:00Z',
    scheduled_at: null,
    created_at: '2026-07-22T09:15:00Z',
    updated_at: '2026-07-22T09:15:00Z'
  },
  {
    id: 'blog-4',
    title: 'How AI is Reshaping the Future of Software Development',
    slug: 'ai-reshaping-software-development',
    excerpt: 'Explore how artificial intelligence is augmenting developer workflows, code compilation, and automated test coverages.',
    content: 'Artificial intelligence has shifted from research hubs into command terminals. Generative agents collaborate with developers...',
    featured_image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-6',
    author_id: 'mock-admin-id',
    reading_time: '7 min read',
    views: 15230,
    featured: true,
    status: 'published',
    seo_title: 'AI Dev Workflows & Future Software Engineering',
    seo_description: 'How modern models integrate into terminals and the future of human coding.',
    canonical_url: null,
    og_image: null,
    published_at: '2026-07-18T11:00:00Z',
    scheduled_at: null,
    created_at: '2026-07-18T11:00:00Z',
    updated_at: '2026-07-18T11:00:00Z'
  },
  {
    id: 'blog-5',
    title: 'Upcoming Trends: React 20 Architecture Preview',
    slug: 'react-20-preview',
    excerpt: 'An early analysis of React 20, compiled templates, streaming renders, and progressive server bindings.',
    content: 'Although React 19 is newly launched, the core team is drafting plans for compiled stream templates...',
    featured_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-3',
    author_id: 'mock-admin-id',
    reading_time: '9 min read',
    views: 2310,
    featured: false,
    status: 'draft',
    seo_title: null,
    seo_description: null,
    canonical_url: null,
    og_image: null,
    published_at: null,
    scheduled_at: null,
    created_at: '2026-08-04T12:00:00Z',
    updated_at: '2026-08-04T12:00:00Z'
  },
  {
    id: 'blog-6',
    title: 'Building a Scalable Design System from Scratch in 2026',
    slug: 'building-design-system-from-scratch',
    excerpt: 'Learn how to architect, document, and maintain a design system that empowers your team, from design tokens to components.',
    content: 'A design system is not a UI kit; it is a shared language. It aligns designers and developers around tokens...',
    featured_image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-4',
    author_id: 'mock-admin-id',
    reading_time: '9 min read',
    views: 6340,
    featured: false,
    status: 'published',
    seo_title: null,
    seo_description: null,
    canonical_url: null,
    og_image: null,
    published_at: '2026-07-09T08:00:00Z',
    scheduled_at: null,
    created_at: '2026-07-09T08:00:00Z',
    updated_at: '2026-07-09T08:00:00Z'
  },
  {
    id: 'blog-7',
    title: 'Choosing the Right Tech Stack for Your Startup in 2026',
    slug: 'startup-tech-stack-2026',
    excerpt: 'Pragmatic stack evaluation: databases, hosting, backend runtimes, and developer hiring pipelines.',
    content: 'A tech stack defines your startup velocity. Selecting experimental languages can stunt hiring and release schedules...',
    featured_image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600',
    category_id: 'cat-5',
    author_id: 'mock-admin-id',
    reading_time: '6 min read',
    views: 11200,
    featured: false,
    status: 'scheduled',
    seo_title: 'Startup Architectures: The Recommended 2026 Stack',
    seo_description: 'Pragmatic guides covering databases, frameworks, auth solutions, and scalable hosting.',
    canonical_url: null,
    og_image: null,
    published_at: null,
    scheduled_at: '2026-08-10T10:00:00Z',
    created_at: '2026-08-04T09:00:00Z',
    updated_at: '2026-08-04T09:00:00Z'
  }
];

export const mockComments: Comment[] = [
  {
    id: 'com-1',
    blog_id: 'blog-1',
    name: 'Michael Scott',
    email: 'michael.scott@dundermifflin.com',
    comment: 'This is brilliant! React Server Components have completely cleaned up our client rendering pipeline.',
    status: 'approved',
    created_at: '2026-08-02T12:00:00Z',
    blog_title: 'The Future of Web Development with React Server Components'
  },
  {
    id: 'com-2',
    blog_id: 'blog-1',
    name: 'Dwight Schrute',
    email: 'dwight.schrute@dundermifflin.com',
    comment: 'Server logic executed without database APIs? Sounds like a security risk. I prefer security.',
    status: 'pending',
    created_at: '2026-08-02T13:40:00Z',
    blog_title: 'The Future of Web Development with React Server Components'
  },
  {
    id: 'com-3',
    blog_id: 'blog-2',
    name: 'Pam Beesly',
    email: 'pam.beesly@dundermifflin.com',
    comment: 'The focus on visual hierarchies and micro-interactions really resonates with our designers. Thank you!',
    status: 'approved',
    created_at: '2026-07-29T10:20:00Z',
    blog_title: 'Essential UI/UX Design Principles Every Developer Should Know'
  },
  {
    id: 'com-4',
    blog_id: 'blog-3',
    name: 'Spam Bot',
    email: 'seo-booster@spam.com',
    comment: 'Buy cheap SEO backlinks here! High rank guaranteed! Click link!',
    status: 'spam',
    created_at: '2026-07-23T04:12:00Z',
    blog_title: 'Mastering TypeScript: Advanced Patterns for Large-Scale Apps'
  }
];

export const mockSubscribers: NewsletterSubscriber[] = [
  { id: 'sub-1', email: 'john.smith@gmail.com', subscribed_at: '2026-07-01T10:00:00Z' },
  { id: 'sub-2', email: 'sarah.jones@yahoo.com', subscribed_at: '2026-07-05T14:22:00Z' },
  { id: 'sub-3', email: 'emily.watson@outlook.com', subscribed_at: '2026-07-12T09:45:00Z' },
  { id: 'sub-4', email: 'david.bruce@icloud.com', subscribed_at: '2026-07-20T18:10:00Z' },
  { id: 'sub-5', email: 'robert.chen@github.com', subscribed_at: '2026-07-28T11:30:00Z' }
];

export const mockSettings: SystemSettings = {
  website_name: 'Daily Bharat',
  logo: null,
  favicon: null,
  footer_text: '© 2026 Daily Bharat. All rights reserved.',
  social_links: {
    facebook: 'https://facebook.com/dailybharat',
    twitter: 'https://twitter.com/dailybharat',
    instagram: 'https://instagram.com/dailybharat',
    linkedin: 'https://linkedin.com/company/dailybharat',
    github: 'https://github.com/dailybharat'
  },
  seo_default_title: 'Daily Bharat — Modern Tech & News Platform',
  seo_default_description: 'High-quality technical guides, web architectures, and daily inspirations.',
  google_analytics_id: 'G-2468101214',
  comment_moderation_enabled: true,
  newsletter_welcome_subject: 'Welcome to the Daily Bharat newsletter!',
  maintenance_mode: false
};

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'PUBLISH_BLOG',
    details: 'Published article: "The Future of Web Development with React Server Components"',
    user_id: 'mock-admin-id',
    user_name: 'Jane Doe',
    created_at: '2026-08-02T10:00:00Z'
  },
  {
    id: 'log-2',
    action: 'CREATE_CATEGORY',
    details: 'Created category "Artificial Intelligence" with slug "artificial-intelligence"',
    user_id: 'mock-admin-id',
    user_name: 'Jane Doe',
    created_at: '2026-07-06T09:12:00Z'
  },
  {
    id: 'log-3',
    action: 'APPROVE_COMMENT',
    details: 'Approved comment by Michael Scott on blog-1',
    user_id: 'mock-admin-id',
    user_name: 'Jane Doe',
    created_at: '2026-08-02T12:05:00Z'
  },
  {
    id: 'log-4',
    action: 'UPDATE_SETTINGS',
    details: 'Modified general website configuration and analytics tags',
    user_id: 'mock-admin-id',
    user_name: 'Jane Doe',
    created_at: '2026-08-04T15:30:00Z'
  }
];

export const mockTrafficData = [
  { month: 'Jan', views: 8200, posts: 2, subscribers: 120 },
  { month: 'Feb', views: 9400, posts: 1, subscribers: 180 },
  { month: 'Mar', views: 11000, posts: 3, subscribers: 240 },
  { month: 'Apr', views: 10500, posts: 2, subscribers: 310 },
  { month: 'May', views: 12800, posts: 4, subscribers: 410 },
  { month: 'Jun', views: 15400, posts: 3, subscribers: 550 },
  { month: 'Jul', views: 18900, posts: 5, subscribers: 780 },
];
