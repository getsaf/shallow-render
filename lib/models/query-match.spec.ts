import { createQueryMatch, NoMatchesError, MultipleMatchesError, QueryMatch } from './query-match';

class Foo {
  fooProperty: string;
  constructor(public which: string) {}
}

describe('QueryMatch', () => {
  describe('single match', () => {
    it('assigns properties on the first match', () => {
      const match = createQueryMatch([new Foo('ONE')]);
      match.fooProperty = 'foo value';

      expect(match[0].fooProperty).toBe('foo value');
    });

    it('passes the instanceof check for the first object', () => {
      const match = createQueryMatch([new Foo('ONE')]);

      expect(match instanceof Foo).toBe(true);
    });
  });

  describe('multiple matches', () => {
    let matches: QueryMatch<Foo>;

    beforeEach(() => {
      matches = createQueryMatch([
        new Foo('ONE'),
        new Foo('TWO'),
      ]);
    });

    it('throws an error on instanceof checks', () => {
      expect(() => matches instanceof Foo).toThrow(new MultipleMatchesError('prototype', 2));
    });

    it('throws an error when you try to get a debugElement property and there are multiple results', () => {
      expect(() => matches.which).toThrow(new MultipleMatchesError('which', 2));
    });

    it('throws an error when you try to set a debugElement property and there are multiple results', () => {
      expect(() => matches.which = 'BOOM').toThrow(new MultipleMatchesError('which', 2));
    });

    it('allows mapping over results', () => {
      expect(matches.map(i => i.which))
        .toEqual(['ONE', 'TWO']);
    });

    it('allows forEach over results', () => {
      matches.forEach(i => expect(typeof i.which).toBe('string'));
    });
  });

  describe('empty results', () => {
    let emptyMatch: QueryMatch<Foo>;

    beforeEach(() => {
      emptyMatch = createQueryMatch<Foo>([]);
    });

    it('throws an error on instanceof checks', () => {
      expect(() => emptyMatch instanceof Foo).toThrow(new NoMatchesError('prototype'));
    });

    it('throws an error when trying to get a property on an empty query match', () => {
      expect(() => emptyMatch.which).toThrow(new NoMatchesError('which'));
    });

    it('throws an error when trying to set a property on an empty query match', () => {
      expect(() => emptyMatch.which = 'BOOM').toThrow(new NoMatchesError('which'));
    });

    it('allows mapping over results', () => {
      expect(emptyMatch.map(i => i.which)).toEqual([]);
    });

    it('allows forEach over results', () => {
      emptyMatch.forEach(fail);
    });
  });
});
