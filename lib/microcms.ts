import { createClient } from 'microcms-js-sdk';

// microCMS クライアントの作成
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

// ブログ記事の型定義
export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  thumbnail?: {
    url: string;
    height: number;
    width: number;
  };
  category?: {
    id: string;
    name: string;
  };
  slug: string;
  excerpt: string;
};

// ブログ一覧の型定義
export type BlogListResponse = {
  contents: Blog[];
  totalCount: number;
  offset: number;
  limit: number;
};

// ブログ一覧を取得
export async function getBlogs(queries?: {
  offset?: number;
  limit?: number;
  filters?: string;
}): Promise<BlogListResponse> {
  return await client.get<BlogListResponse>({
    endpoint: 'blogs',
    queries: {
      offset: queries?.offset ?? 0,
      limit: queries?.limit ?? 10,
      filters: queries?.filters,
    },
  });
}

// スラッグからブログ記事を取得
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const response = await client.get<BlogListResponse>({
    endpoint: 'blogs',
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
    },
  });
  return response.contents[0] ?? null;
}

// IDからブログ記事を取得
export async function getBlogById(id: string): Promise<Blog> {
  return await client.get<Blog>({
    endpoint: 'blogs',
    contentId: id,
  });
}

// 全てのスラッグを取得（静的生成用）
export async function getAllBlogSlugs(): Promise<string[]> {
  const response = await client.get<BlogListResponse>({
    endpoint: 'blogs',
    queries: {
      fields: 'slug',
      limit: 100,
    },
  });
  return response.contents.map((blog) => blog.slug);
}

// 関連記事を取得（同じカテゴリの記事を優先）
export async function getRelatedBlogs(
  currentBlog: Blog,
  limit: number = 3
): Promise<Blog[]> {
  const relatedBlogs: Blog[] = [];

  // 1. 同じカテゴリの記事を取得
  if (currentBlog.category) {
    const sameCategoryResponse = await client.get<BlogListResponse>({
      endpoint: 'blogs',
      queries: {
        filters: `category[equals]${currentBlog.category.id}[and]id[not_equals]${currentBlog.id}`,
        limit: limit,
        orders: '-publishedAt',
      },
    });
    relatedBlogs.push(...sameCategoryResponse.contents);
  }

  // 2. カテゴリの記事が足りない場合、最新記事で補完
  if (relatedBlogs.length < limit) {
    const excludeIds = [currentBlog.id, ...relatedBlogs.map((b) => b.id)];
    const excludeFilter = excludeIds.map((id) => `id[not_equals]${id}`).join('[and]');

    const latestResponse = await client.get<BlogListResponse>({
      endpoint: 'blogs',
      queries: {
        filters: excludeFilter,
        limit: limit - relatedBlogs.length,
        orders: '-publishedAt',
      },
    });
    relatedBlogs.push(...latestResponse.contents);
  }

  return relatedBlogs.slice(0, limit);
}
