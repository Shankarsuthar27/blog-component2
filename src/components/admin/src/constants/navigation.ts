export interface NavItem {
  label: string;
  path: string;
  icon: string;
  group: 'content' | 'audience' | 'analytics' | 'system';
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard', group: 'content' },
  { label: 'All Blogs', path: '/admin/blogs', icon: 'BookOpen', group: 'content' },
  { label: 'News Import', path: '/admin/news-import', icon: 'Newspaper', group: 'content' },
  { label: 'Categories', path: '/admin/categories', icon: 'FolderTree', group: 'content' },
  { label: 'Tags', path: '/admin/tags', icon: 'Hash', group: 'content' },
  { label: 'Media Library', path: '/admin/media', icon: 'Image', group: 'content' },
  
  { label: 'Comments', path: '/admin/comments', icon: 'MessageSquare', group: 'audience' },
  { label: 'Agent Management', path: '/admin/agents', icon: 'UserCheck', group: 'audience' },
  { label: 'Newsletter', path: '/admin/newsletter', icon: 'Mail', group: 'audience' },
  
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3', group: 'analytics' },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: 'History', group: 'analytics' },
  
  { label: 'Users & Roles', path: '/admin/users', icon: 'Users', group: 'system' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings', group: 'system' },
];
