export interface BlogPost {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    bio?: string;
  };
  publishedAt: string;
  readingTime: string;
  views: number;
  featured?: boolean;
  tags?: string[];
}

export interface Category {
  name: string;
  count: number;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { name: 'Technology', count: 12, slug: 'technology' },
  { name: 'Web Development', count: 18, slug: 'web-development' },
  { name: 'React', count: 9, slug: 'react' },
  { name: 'UI/UX Design', count: 7, slug: 'ui-ux-design' },
  { name: 'Business', count: 5, slug: 'business' },
  { name: 'Artificial Intelligence', count: 11, slug: 'artificial-intelligence' },
];
