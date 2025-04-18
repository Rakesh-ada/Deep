/**
 * Context Manager Module
 * 
 * This module manages the conversation context for AI interactions.
 * It handles context pruning, relevance scoring, and memory management.
 */

/**
 * Maintain the conversation context by limiting its size
 * @param {Array} context - The current conversation context
 * @param {number} maxLength - Maximum number of messages to keep
 * @returns {Array} - The maintained context
 */
function maintainContext(context, maxLength = 10) {
  if (!Array.isArray(context)) {
    return [];
  }
  
  if (context.length <= maxLength) {
    return context;
  }
  
  // Simple approach: keep the most recent messages
  return context.slice(-maxLength);
}

/**
 * Score context items for relevance
 * @param {Array} context - The conversation context
 * @param {string} query - The current user query
 * @returns {Array} - Context with relevance scores
 */
function scoreContextRelevance(context, query) {
  if (!Array.isArray(context) || !query) {
    return context;
  }
  
  const queryWords = new Set(
    query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
  );
  
  return context.map(item => {
    let relevanceScore = 0;
    
    if (item.content) {
      const contentWords = item.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      // Count word overlap
      const matchingWords = contentWords.filter(word => queryWords.has(word));
      relevanceScore = matchingWords.length / Math.max(1, queryWords.size);
    }
    
    return {
      ...item,
      relevance: relevanceScore
    };
  });
}

/**
 * Extract the most relevant context for the current query
 * @param {Array} context - The full conversation context
 * @param {string} query - The current user query
 * @param {number} maxTokens - Maximum tokens to include
 * @returns {Array} - The most relevant context items
 */
function extractRelevantContext(context, query, maxTokens = 2000) {
  if (!Array.isArray(context) || context.length === 0) {
    return [];
  }
  
  // Simple token estimation (roughly 4 chars per token)
  const estimateTokens = text => Math.ceil((text || '').length / 4);
  
  // Score context for relevance
  const scoredContext = scoreContextRelevance(context, query);
  
  // Sort by relevance (most recent messages are still prioritized if relevance is equal)
  scoredContext.sort((a, b) => {
    if (a.role === 'system' && b.role !== 'system') return -1;
    if (a.role !== 'system' && b.role === 'system') return 1;
    return b.relevance - a.relevance;
  });
  
  // Build context up to token limit
  let tokenCount = 0;
  const relevantContext = [];
  
  for (const item of scoredContext) {
    const itemTokens = estimateTokens(item.content);
    if (tokenCount + itemTokens <= maxTokens) {
      relevantContext.push(item);
      tokenCount += itemTokens;
    } else {
      break;
    }
  }
  
  return relevantContext;
}

module.exports = {
  maintainContext,
  scoreContextRelevance,
  extractRelevantContext
}; 