export interface Tip {
  id: string;
  title: string;
  category: string;
  preview: string;
  content: string;
  image: string;
  slug: string;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: string;
  publishDate: string;
  rating: number;
}