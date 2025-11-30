import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property-based testing setup', () => {
  it('verifies fast-check is working with a simple property', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        // Property: adding zero to any integer returns the same integer
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });
});
