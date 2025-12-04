import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateApiKey,
  ensureHttps,
  validateSecureUrl,
  sanitizeTodoText,
} from './security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove null bytes', () => {
      const input = 'Hello\0World';
      const result = sanitizeInput(input);
      expect(result).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should return empty string for non-string input', () => {
      const result = sanitizeInput(123 as any);
      expect(result).toBe('');
    });

    it('should preserve safe text', () => {
      const input = 'Hello World!';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World!');
    });
  });

  describe('validateApiKey', () => {
    it('should accept valid API key', () => {
      const key = 'abc123-def456_ghi789';
      const result = validateApiKey(key);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(key);
    });

    it('should reject empty API key', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject API key with invalid characters', () => {
      const key = 'abc123<script>alert("xss")</script>';
      const result = validateApiKey(key);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    it('should reject API key that is too short', () => {
      const key = 'abc123';
      const result = validateApiKey(key);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('length');
    });

    it('should reject API key that is too long', () => {
      const key = 'a'.repeat(150);
      const result = validateApiKey(key);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('length');
    });

    it('should trim whitespace from API key', () => {
      const key = '  abc123-def456_ghi789  ';
      const result = validateApiKey(key);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('abc123-def456_ghi789');
    });

    it('should reject non-string input', () => {
      const result = validateApiKey(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('string');
    });
  });

  describe('ensureHttps', () => {
    it('should accept HTTPS URLs', () => {
      expect(() => ensureHttps('https://example.com')).not.toThrow();
    });

    it('should reject HTTP URLs in production', () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;
      
      expect(() => ensureHttps('http://example.com')).toThrow('Insecure HTTP');
      
      (import.meta.env as any).DEV = originalEnv;
    });

    it('should reject invalid protocol', () => {
      expect(() => ensureHttps('ftp://example.com')).toThrow('Invalid URL protocol');
    });

    it('should reject non-string input', () => {
      expect(() => ensureHttps(123 as any)).toThrow('URL must be a string');
    });
  });

  describe('validateSecureUrl', () => {
    it('should accept valid HTTPS URL', () => {
      const result = validateSecureUrl('https://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = validateSecureUrl('not a url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject FTP protocol', () => {
      const result = validateSecureUrl('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('protocol');
    });
  });

  describe('sanitizeTodoText', () => {
    it('should remove HTML tags', () => {
      const input = '<b>Important</b> task';
      const result = sanitizeTodoText(input);
      expect(result).toBe('Important task');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss") task';
      const result = sanitizeTodoText(input);
      expect(result).toBe('alert("xss") task');
    });

    it('should preserve special characters', () => {
      const input = 'Buy milk @ $3.50 (urgent!)';
      const result = sanitizeTodoText(input);
      expect(result).toBe('Buy milk @ $3.50 (urgent!)');
    });

    it('should remove null bytes', () => {
      const input = 'Task\0with\0nulls';
      const result = sanitizeTodoText(input);
      expect(result).toBe('Taskwithnulls');
    });

    it('should return empty string for non-string input', () => {
      const result = sanitizeTodoText(null as any);
      expect(result).toBe('');
    });
  });
});
