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
