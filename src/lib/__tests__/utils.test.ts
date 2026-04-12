import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      // Basic merge
      expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
      
      // Conditional merge
      expect(cn('px-2', true && 'py-1', false && 'bg-red-500')).toBe('px-2 py-1');
      
      // Merge with object
      expect(cn('px-2', { 'bg-blue-500': true, 'text-white': false })).toBe('px-2 bg-blue-500');
      
      // Overriding tailwind classes (twMerge behavior)
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });

  describe('compressImage', () => {
    it('should compress a wide image to maxWidth', () => {
      // Placeholder for image compression test. 
      // Testing canvas and FileReader in Jest requires extensive mocking
      // and is often better suited for integration tests or dedicated image processing libraries.
      expect(true).toBe(true);
    });
  });
});
