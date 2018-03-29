import { createQueryMatch, NoMatchesError, MultipleMatchesError, QueryMatch } from './query-match';

class Foo {
  fooProperty: string;
  constructor(public which: string) {}
}

describe('QueryMatch', () => {
  describe('single match', () => {
    let match: QueryMatch<Foo>;
    beforeEach(() => {
      match = createQueryMatch([new Foo('ONE')]);
    });

    it('assigns properties on the first match', () => {
      match.fooProperty = 'foo value';

      expect(match[0].fooProperty).toBe('foo value');
    });

    it('defines properties on the first match', () => {
      Object.defineProperty(match, 'fooProperty', {value: 'foo value'});

      expect(match[0].fooProperty).toBe('foo value');
    });

    it('deletes properties on the first match', () => {
      match.fooProperty = 'foo';
      delete match.fooProperty; /* tslint:disable-line no-dynamic-delete no-string-literal */
      expect(match.fooProperty).not.toBeDefined();
    });

    it('passes the instanceof check for the first object', () => {
      expect(match instanceof Foo).toBe(true);
    });

    it('allows checking individual object keys', () => {
      match.fooProperty = 'foo';
      expect('fooProperty' in match).toBe(true);
    });

    // I can't get this to friggen work
    // it('allows checking object keys', () => {
    //   match.fooProperty = 'foo';
    //   expect(Object.keys(match)).toContain('fooProperty');
    // });
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

    it('throws an error when you try to get a property and there are multiple results', () => {
      expect(() => matches.which).toThrow(new MultipleMatchesError('which', 2));
    });

    it('throws an error when you try to set a property and there are multiple results', () => {
      expect(() => matches.which = 'BOOM').toThrow(new MultipleMatchesError('which', 2));
    });

    it('throws an error when you try to define a property and there are multiple results', () => {
      expect(() => {
        Object.defineProperty(matches, 'foo', {value: 'foo value'});
      }).toThrow();
    });

    it('throws an error when you try to delete a property and there are multiple results', () => {
      expect(() => {
        delete matches.fooProperty;
      }).toThrow();
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

    it('throws an error when you try to define a property on an empty match', () => {
      expect(() => {
        Object.defineProperty(emptyMatch, 'foo', {value: 'foo value'});
      }).toThrow();
    });

    it('throws an error when you try to delete a property on an empty match', () => {
      expect(() => {
        delete emptyMatch.fooProperty;
      }).toThrow();
    });

    it('does not match when trying to check a property on empty results', () => {
      expect('fooProperty' in emptyMatch).toBe(false);
    });

    it('allows mapping over results', () => {
      expect(emptyMatch.map(i => i.which)).toEqual([]);
    });

    it('allows forEach over results', () => {
      emptyMatch.forEach(fail);
    });
  });
});
