/**
 * Independent KnowledgeArticle implementation
 * Replaces Base44 entities.KnowledgeArticle
 */

import { API_BASE_URL } from "./openai";

// Type definitions for KnowledgeArticle
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  created_date: string;
  updated_date: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export interface KnowledgeArticleResponse {
  success: boolean;
  data?: KnowledgeArticle[];
  error?: string;
}

/**
 * KnowledgeArticle class to replace Base44 implementation
 */
class KnowledgeArticleService {
  /**
   * List all knowledge articles
   * @returns {Promise<KnowledgeArticle[]>} Array of knowledge articles
   */
  static async list(): Promise<KnowledgeArticle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-articles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: KnowledgeArticleResponse = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn(
          "Knowledge articles API returned unsuccessful response:",
          result.error
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get a specific knowledge article by ID
   * @param {string} id - Article ID
   * @returns {Promise<KnowledgeArticle | null>} Knowledge article or null if not found
   */
  static async get(id: string): Promise<KnowledgeArticle | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-articles/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error fetching knowledge article:", error);
      return null;
    }
  }

  /**
   * Create a new knowledge article
   * @param {Partial<KnowledgeArticle>} articleData - Article data
   * @returns {Promise<KnowledgeArticle | null>} Created article or null if failed
   */
  static async create(
    articleData: Partial<KnowledgeArticle>
  ): Promise<KnowledgeArticle | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error creating knowledge article:", error);
      return null;
    }
  }

  /**
   * Update an existing knowledge article
   * @param {string} id - Article ID
   * @param {Partial<KnowledgeArticle>} articleData - Updated article data
   * @returns {Promise<KnowledgeArticle | null>} Updated article or null if failed
   */
  static async update(
    id: string,
    articleData: Partial<KnowledgeArticle>
  ): Promise<KnowledgeArticle | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error updating knowledge article:", error);
      return null;
    }
  }

  /**
   * Delete a knowledge article
   * @param {string} id - Article ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-articles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error deleting knowledge article:", error);
      return false;
    }
  }

  /**
   * Search knowledge articles by keywords
   * @param {string} query - Search query
   * @returns {Promise<KnowledgeArticle[]>} Array of matching articles
   */
  static async search(query: string): Promise<KnowledgeArticle[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/knowledge-articles/search?q=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: KnowledgeArticleResponse = await response.json();
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error("Error searching knowledge articles:", error);
      return [];
    }
  }
}

// Export the service as the default export to match Base44 pattern
export default KnowledgeArticleService;
