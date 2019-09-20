import { createQueryMatch } from '../models/query-match';
import './shallow-matchers';

describe('JasmineMatchers', () => {
  describe('toHaveFound', () => {
    it('passes when match length equals expected', () => {
      const match = createQueryMatch(['one', 'two']);

      expect(match).toHaveFound(2);
    });

    it('fails when match length does not equal expected', () => {
      const match = createQueryMatch(['one']);

      expect(match).not.toHaveFound(2);
    });
  });

  describe('toHaveFoundOne', () => {
    it('passes when one is found', () => {
      const match = createQueryMatch(['one']);

      expect(match).toHaveFoundOne();
    });

    it('fails when none are found', () => {
      const match = createQueryMatch<number>([]);

      expect(match).not.toHaveFoundOne();
    });

    it('fails when more than one are found', () => {
      const match = createQueryMatch(['one', 'two', 'three']);

      expect(match).not.toHaveFoundOne();
    });
  });

  describe('toHaveFoundMoreThan', () => {
    it('passes when more are found', () => {
      const match = createQueryMatch(['one']);

      expect(match).toHaveFoundMoreThan(0);
    });

    it('fails when exact amount are found', () => {
      const match = createQueryMatch(['one']);

      expect(match).not.toHaveFoundMoreThan(1);
    });

    it('fails when fewer are found', () => {
      const match = createQueryMatch([1, 2, 3]);

      expect(match).not.toHaveFoundMoreThan(4);
    });
  });

  describe('toHaveFoundLessThan', () => {
    it('passes when fewer are found', () => {
      const match = createQueryMatch(['one']);

      expect(match).toHaveFoundLessThan(2);
    });

    it('fails when exact amount are found', () => {
      const match = createQueryMatch(['one']);

      expect(match).not.toHaveFoundLessThan(1);
    });

    it('fails when more are found', () => {
      const match = createQueryMatch([1, 2, 3]);

      expect(match).not.toHaveFoundLessThan(2);
    });
  });
});
