// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeBaseState {
  articles: KnowledgeArticle[];
  loading: boolean;
  error: string | null;
}

export interface FormData {
  title: string;
  content: string;
  keywords: string;
  file?: File | null;
}

export type FormChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

export interface KnowledgeBaseProps {
  articles?: KnowledgeArticle[];
  onArticleCreate?: (article: KnowledgeArticle) => void;
  onArticleUpdate?: (article: KnowledgeArticle) => void;
  onArticleDelete?: (id: string) => void;
}
