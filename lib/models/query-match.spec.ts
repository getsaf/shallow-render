import { DebugElement } from '@angular/core';
import { createQueryMatch, NoMatchesError, MultipleMatchesError } from './query-match';

describe('QueryMatch', () => {
  describe('multiple matches', () => {
    const matches = createQueryMatch([
      {nativeElement: 'ONE'} as DebugElement,
      {nativeElement: 'TWO'} as DebugElement,
    ]);

    it('throws an error when you try to access a debugElement property and there are multiple results', () => {
      expect(() => matches.nativeElement).toThrow(new MultipleMatchesError('nativeElement', 2));
    });

    it('allows mapping over results', () => {
      expect(matches.map(i => i.nativeElement))
        .toEqual(['ONE', 'TWO']);
    });

    it('allows forEach over results', () => {
      matches.forEach(i => expect(typeof i.nativeElement).toBe('string'));
    });
  });

  describe('empty results', () => {
    const emptyMatch = createQueryMatch([]);

    it('throws an error when trying to access a property on an empty query match', () => {
      expect(() => emptyMatch.nativeElement).toThrow(new NoMatchesError('nativeElement'));
    });

    it('allows mapping over results', () => {
      expect(emptyMatch.map(i => i.nativeElement)).toEqual([]);
    });

    it('allows forEach over results', () => {
      emptyMatch.forEach(fail);
    });
  });
});
