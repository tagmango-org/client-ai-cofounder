import { base44 } from './base44Client';
import tagMangoAuth from './auth';


export const KnowledgeArticle = base44.entities.KnowledgeArticle;




// Custom TagMango auth (replacing base44.auth):
export const User = tagMangoAuth;