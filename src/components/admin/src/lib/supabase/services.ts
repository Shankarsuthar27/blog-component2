import { supabase } from './client';
import type { Blog, Category, Tag, Comment, NewsletterSubscriber, ActivityLog, Profile } from '../../types/admin';

// =============================================
// BLOG SERVICES
// =============================================

export const blogServices = {
  /** Fetch all blogs with joined category and author */
  async getAll(): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Blog[];
  },

  /** Fetch a single blog by ID */
  async getById(id: string): Promise<Blog | null> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Blog;
  },

  /** Fetch a single blog by slug (public) */
  async getBySlug(slug: string): Promise<Blog | null> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    if (error) return null;
    return data as Blog;
  },

  /** Get tags for a blog */
  async getTagIds(blogId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('tag_id')
      .eq('blog_id', blogId);
    if (error) return [];
    return (data || []).map((r: { tag_id: string }) => r.tag_id);
  },

  /** Fetch published blogs for public site */
  async getPublished(options?: {
    search?: string;
    categorySlug?: string;
    tagSlug?: string;
    page?: number;
    perPage?: number;
    orderBy?: 'created_at' | 'views' | 'published_at';
  }): Promise<{ blogs: Blog[]; total: number }> {
    const page = options?.page || 1;
    const perPage = options?.perPage || 10;
    const orderBy = options?.orderBy || 'published_at';

    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order(orderBy, { ascending: false });

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`
      );
    }

    if (options?.categorySlug) {
      // Join via categories table
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { blogs: (data as Blog[]) || [], total: count || 0 };
  },

  /** Create a new blog */
  async create(blog: Partial<Blog>, tagIds: string[]): Promise<Blog> {
    let authorId = blog.author_id;
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorId || '');
    if (!isValidUuid) {
      const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).single();
      authorId = firstProfile?.id || undefined;
    }

    const payload = { ...blog };
    if (authorId) {
      payload.author_id = authorId;
    } else {
      delete payload.author_id;
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;

    // Insert tags
    if (tagIds.length > 0) {
      await supabase.from('blog_tags').insert(
        tagIds.map((tag_id) => ({ blog_id: data.id, tag_id }))
      );
    }
    return data as Blog;
  },

  /** Update an existing blog */
  async update(id: string, blog: Partial<Blog>, tagIds: string[]): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update(blog)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Sync tags: delete all then re-insert
    await supabase.from('blog_tags').delete().eq('blog_id', id);
    if (tagIds.length > 0) {
      await supabase.from('blog_tags').insert(
        tagIds.map((tag_id) => ({ blog_id: id, tag_id }))
      );
    }
    return data as Blog;
  },

  /** Delete a blog */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
  },

  /** Duplicate a blog */
  async duplicate(blog: Blog): Promise<Blog> {
    const duplicate: Partial<Blog> = {
      title: `${blog.title} (Copy)`,
      slug: `${blog.slug}-copy-${Date.now()}`,
      excerpt: blog.excerpt,
      content: blog.content,
      featured_image: blog.featured_image,
      category_id: blog.category_id,
      author_id: blog.author_id,
      reading_time: blog.reading_time,
      featured: false,
      status: 'draft',
      seo_title: blog.seo_title,
      seo_description: blog.seo_description,
    };
    const tagIds = await blogServices.getTagIds(blog.id);
    return blogServices.create(duplicate, tagIds);
  },

  /** Increment view count atomically */
  async incrementViews(blogId: string): Promise<void> {
    await supabase.rpc('increment_blog_views', { p_blog_id: blogId });
  },
};

// =============================================
// CATEGORY SERVICES
// =============================================

export const categoryServices = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`*, blogs:blogs(count)`)
      .order('name');
    if (error) throw error;
    // Flatten blog_count
    return (data || []).map((c: any) => ({
      ...c,
      blog_count: c.blogs?.[0]?.count || 0,
    })) as Category[];
  },

  async create(cat: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([cat])
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async update(id: string, cat: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(cat)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// TAG SERVICES
// =============================================

export const tagServices = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select(`*, blog_tags(count)`)
      .order('name');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      ...t,
      blog_count: t.blog_tags?.[0]?.count || 0,
    })) as Tag[];
  },

  async create(tag: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();
    if (error) throw error;
    return data as Tag;
  },

  async update(id: string, tag: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Tag;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// COMMENT SERVICES
// =============================================

export const commentServices = {
  async getAll(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`*, blogs:blogs(title)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((c: any) => ({
      ...c,
      blog_title: c.blogs?.title || 'Unknown',
    })) as Comment[];
  },

  /** Get approved comments for a blog (public) */
  async getApprovedForBlog(blogId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    if (error) return [];
    return data as Comment[];
  },

  async updateStatus(id: string, status: Comment['status']): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
  },

  /** Submit a comment from a visitor */
  async submit(comment: {
    blog_id: string;
    name: string;
    email: string;
    comment: string;
  }): Promise<void> {
    const { error } = await supabase.from('comments').insert([{
      ...comment,
      status: 'pending',
    }]);
    if (error) throw error;
  },
};

// =============================================
// NEWSLETTER SERVICES
// =============================================

export const newsletterServices = {
  async getAll(): Promise<NewsletterSubscriber[]> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data as NewsletterSubscriber[];
  },

  async subscribe(email: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);
    if (error) {
      if (error.code === '23505') throw new Error('Already subscribed');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// SETTINGS SERVICES
// =============================================

export const settingsServices = {
  async getAll(): Promise<Record<string, any>> {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    const settings: Record<string, any> = {};
    (data || []).forEach((row: { key: string; value: any }) => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  async upsert(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  },

  async upsertMany(settings: Record<string, any>): Promise<void> {
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  },
};

// =============================================
// ACTIVITY LOG SERVICES
// =============================================

export const activityLogServices = {
  async getAll(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`*, profiles:profiles(full_name)`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data || []).map((log: any) => ({
      ...log,
      user_name: log.profiles?.full_name || 'Unknown',
    })) as ActivityLog[];
  },

  async log(action: string, details: string, userId: string): Promise<void> {
    await supabase.rpc('log_activity', {
      p_action: action,
      p_details: details,
      p_user_id: userId,
    });
  },
};

// =============================================
// DASHBOARD / STATS SERVICES
// =============================================

export const dashboardServices = {
  async getStats(): Promise<{
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    scheduledBlogs: number;
    totalViews: number;
    totalCategories: number;
    totalTags: number;
    totalSubscribers: number;
    totalComments: number;
    pendingComments: number;
  }> {
    const [blogs, categories, tags, subscribers, comments] = await Promise.all([
      supabase.from('blogs').select('status, views'),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('tags').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('status'),
    ]);

    const blogData = blogs.data || [];
    return {
      totalBlogs: blogData.length,
      publishedBlogs: blogData.filter((b: any) => b.status === 'published').length,
      draftBlogs: blogData.filter((b: any) => b.status === 'draft').length,
      scheduledBlogs: blogData.filter((b: any) => b.status === 'scheduled').length,
      totalViews: blogData.reduce((sum: number, b: any) => sum + (b.views || 0), 0),
      totalCategories: categories.count || 0,
      totalTags: tags.count || 0,
      totalSubscribers: subscribers.count || 0,
      totalComments: (comments.data || []).length,
      pendingComments: (comments.data || []).filter((c: any) => c.status === 'pending').length,
    };
  },

  /** Monthly view trends from blog_views table */
  async getViewTrend(): Promise<{ month: string; views: number; posts: number }[]> {
    const { data } = await supabase
      .from('blog_views')
      .select('viewed_at, view_count')
      .gte('viewed_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .order('viewed_at');

    const { data: blogDates } = await supabase
      .from('blogs')
      .select('published_at')
      .eq('status', 'published')
      .not('published_at', 'is', null);

    // Group by month
    const months: Record<string, { views: number; posts: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    (data || []).forEach((row: any) => {
      const d = new Date(row.viewed_at);
      const key = monthNames[d.getMonth()];
      if (!months[key]) months[key] = { views: 0, posts: 0 };
      months[key].views += row.view_count;
    });

    (blogDates || []).forEach((row: any) => {
      const d = new Date(row.published_at);
      const key = monthNames[d.getMonth()];
      if (!months[key]) months[key] = { views: 0, posts: 0 };
      months[key].posts += 1;
    });

    return Object.entries(months).map(([month, val]) => ({ month, ...val }));
  },
};

// =============================================
// PROFILE SERVICES
// =============================================

export const profileServices = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');
    if (error) throw error;
    return data as Profile[];
  },

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateRole(id: string, role: Profile['role']): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) throw error;
  },
};
