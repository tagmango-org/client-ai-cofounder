import tagMangoAuth from './auth';
import KnowledgeArticleService from './knowledgeArticle';

// Independent KnowledgeArticle implementation (replacing Base44)
export const KnowledgeArticle = KnowledgeArticleService;

// Custom TagMango auth (replacing base44.auth):
export const User = tagMangoAuth;