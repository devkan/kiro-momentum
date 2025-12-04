/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and attributes
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove any script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate and sanitize API key format
 * Ensures API keys only contain alphanumeric characters, hyphens, and underscores
 */
export function validateApiKey(key: string): { isValid: boolean; sanitized: string; error?: string } {
  if (typeof key !== 'string') {
    return { isValid: false, sanitized: '', error: 'API key must be a string' };
  }

  const trimmed = key.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, sanitized: '', error: 'API key cannot be empty' };
  }

  // API keys should only contain alphanumeric characters, hyphens, and underscores
  // This is a reasonable constraint for most API keys (Unsplash, OpenWeatherMap, etc.)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  
  if (!validPattern.test(trimmed)) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: 'API key contains invalid characters' 
    };
  }

  // Check reasonable length constraints (most API keys are 20-64 characters)
  if (trimmed.length < 10 || trimmed.length > 128) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: 'API key length is invalid (must be 10-128 characters)' 
    };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Ensure URL uses HTTPS protocol
 * Throws an error if the URL uses HTTP in production
 */
export function ensureHttps(url: string): void {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }

  // In development, allow HTTP for localhost
  const isDevelopment = import.meta.env.DEV;
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  if (!isDevelopment || !isLocalhost) {
    if (url.startsWith('http://')) {
      throw new Error('Insecure HTTP protocol detected. Only HTTPS is allowed.');
    }
  }

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    throw new Error('Invalid URL protocol. Must use HTTPS.');
  }
}

/**
 * Validate URL and ensure it uses HTTPS
 */
export function validateSecureUrl(url: string): { isValid: boolean; error?: string } {
  try {
    ensureHttps(url);
    
    // Additional URL validation
    const urlObj = new URL(url);
    
    // Ensure it's a valid HTTP(S) URL
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return { isValid: false, error: 'Invalid URL protocol' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid URL' 
    };
  }
}

/**
 * Sanitize todo text to prevent XSS
 * More lenient than general input sanitization but still safe
 */
export function sanitizeTodoText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any remaining HTML tags but preserve most special characters for todo text
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}
