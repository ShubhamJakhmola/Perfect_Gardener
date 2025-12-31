/**
 * Search Utilities
 * Provides fuzzy matching and auto-correct functionality for search terms
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Find the best matching term from a list of available terms
 */
export function findBestMatch(
  searchTerm: string,
  availableTerms: string[],
  threshold: number = 0.6
): { match: string | null; similarity: number } {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return { match: null, similarity: 0 };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // First, try exact match (case-insensitive)
  const exactMatch = availableTerms.find(
    term => term.toLowerCase() === normalizedSearch
  );
  if (exactMatch) {
    return { match: exactMatch, similarity: 1 };
  }

  // Try partial match (contains)
  const partialMatch = availableTerms.find(
    term => term.toLowerCase().includes(normalizedSearch) ||
            normalizedSearch.includes(term.toLowerCase())
  );
  if (partialMatch) {
    return { match: partialMatch, similarity: 0.8 };
  }

  // Try fuzzy matching
  let bestMatch: string | null = null;
  let bestSimilarity = 0;

  for (const term of availableTerms) {
    const sim = similarity(normalizedSearch, term.toLowerCase());
    if (sim > bestSimilarity && sim >= threshold) {
      bestSimilarity = sim;
      bestMatch = term;
    }
  }

  return { match: bestMatch, similarity: bestSimilarity };
}

/**
 * Get search suggestions based on available terms
 */
export function getSearchSuggestions(
  searchTerm: string,
  availableTerms: string[],
  maxSuggestions: number = 5
): string[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const suggestions: Array<{ term: string; score: number }> = [];

  for (const term of availableTerms) {
    const normalizedTerm = term.toLowerCase();
    
    // Exact match gets highest score
    if (normalizedTerm === normalizedSearch) {
      suggestions.push({ term, score: 100 });
      continue;
    }

    // Starts with gets high score
    if (normalizedTerm.startsWith(normalizedSearch)) {
      suggestions.push({ term, score: 80 });
      continue;
    }

    // Contains gets medium score
    if (normalizedTerm.includes(normalizedSearch)) {
      suggestions.push({ term, score: 60 });
      continue;
    }

    // Fuzzy match gets score based on similarity
    const sim = similarity(normalizedSearch, normalizedTerm);
    if (sim >= 0.5) {
      suggestions.push({ term, score: sim * 50 });
    }
  }

  // Sort by score and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(s => s.term);
}

/**
 * Filter items with auto-correct support
 */
export function filterWithAutoCorrect<T>(
  items: T[],
  searchTerm: string,
  getSearchableText: (item: T) => string,
  threshold: number = 0.5
): { filtered: T[]; suggestedTerm: string | null } {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return { filtered: items, suggestedTerm: null };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Get all searchable text from items
  const allTerms = items.map(item => getSearchableText(item));
  const uniqueTerms = Array.from(new Set(allTerms));
  
  // Find best match
  const { match: bestMatch, similarity: matchSimilarity } = findBestMatch(
    searchTerm,
    uniqueTerms,
    threshold
  );

  // Filter items
  let filtered: T[];
  let suggestedTerm: string | null = null;

  if (bestMatch && matchSimilarity >= threshold && matchSimilarity < 1) {
    // Use the best match for filtering
    filtered = items.filter(item => {
      const text = getSearchableText(item).toLowerCase();
      return text.includes(bestMatch.toLowerCase());
    });
    suggestedTerm = bestMatch;
  } else {
    // Use original search term
    filtered = items.filter(item => {
      const text = getSearchableText(item).toLowerCase();
      return text.includes(normalizedSearch);
    });
  }

  return { filtered, suggestedTerm };
}

