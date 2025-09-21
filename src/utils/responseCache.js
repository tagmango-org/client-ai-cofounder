// Intelligent response caching for course generation
// Caches responses based on conversation context and user intent

class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // Maximum number of cached responses
        this.ttl = 1000 * 60 * 30; // 30 minutes cache TTL
    }

    // Generate cache key based on user input and context
    generateCacheKey(userMessage, conversationContext, userProfile) {
        const normalizedMessage = userMessage.toLowerCase().trim();
        
        // Extract key intent indicators
        const keyWords = this.extractKeyWords(normalizedMessage);
        const intent = this.detectIntent(normalizedMessage);
        
        // Include relevant context
        const contextHash = this.hashContext({
            keyWords: keyWords.sort(),
            intent,
            niche: userProfile?.niche || 'general',
            experience: userProfile?.experience || 'beginner',
            recentTopics: this.extractRecentTopics(conversationContext)
        });
        
        return contextHash;
    }

    extractKeyWords(message) {
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'would', 'should', 'will', 'i', 'me', 'my', 'you', 'your']);
        
        return message
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 10); // Limit to most important words
    }

    detectIntent(message) {
        if (/course|curriculum|lesson|module|teach|training/i.test(message)) return 'course';
        if (/workshop|event|session|webinar/i.test(message)) return 'workshop';
        if (/price|cost|payment|subscription|membership/i.test(message)) return 'service';
        if (/discount|coupon|offer|sale/i.test(message)) return 'coupon';
        if (/post|content|social|share/i.test(message)) return 'post';
        return 'general';
    }

    extractRecentTopics(conversationHistory) {
        if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
            return [];
        }
        
        return conversationHistory
            .slice(-3) // Last 3 messages
            .map(msg => this.detectIntent(msg.text || ''))
            .filter(Boolean);
    }

    hashContext(context) {
        // Simple hash function for context
        const str = JSON.stringify(context);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    get(userMessage, conversationContext, userProfile) {
        const key = this.generateCacheKey(userMessage, conversationContext, userProfile);
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check if cache entry has expired
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.response;
    }

    set(userMessage, conversationContext, userProfile, response) {
        const key = this.generateCacheKey(userMessage, conversationContext, userProfile);
        
        // Only cache successful responses with actual content
        if (!response || !response.ai_response_text) {
            return;
        }
        
        // Don't cache responses that are too specific (contain personal info)
        if (this.containsPersonalInfo(response.ai_response_text)) {
            return;
        }
        
        // Evict oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            response: response,
            timestamp: Date.now()
        });
    }

    containsPersonalInfo(text) {
        // Basic check for personal information that shouldn't be cached
        const personalPatterns = [
            /\b\d{10,}\b/, // Phone numbers
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
        ];
        
        return personalPatterns.some(pattern => pattern.test(text));
    }

    clear() {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
        };
    }
}

// Create a singleton instance
export const responseCache = new ResponseCache();

// Hook for React components
export const useResponseCache = () => {
    return {
        get: (userMessage, conversationContext, userProfile) => 
            responseCache.get(userMessage, conversationContext, userProfile),
        set: (userMessage, conversationContext, userProfile, response) => 
            responseCache.set(userMessage, conversationContext, userProfile, response),
        clear: () => responseCache.clear(),
        getStats: () => responseCache.getStats()
    };
};
