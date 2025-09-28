import { base44 } from './base44Client';
import tagMangoAuth from './auth';


export const Conversation = base44.entities.Conversation;

export const Message = base44.entities.Message;

export const KnowledgeArticle = base44.entities.KnowledgeArticle;

export const AppUser = base44.entities.AppUser;



// Custom TagMango auth (replacing base44.auth):
export const User = tagMangoAuth;