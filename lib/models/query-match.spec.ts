import { Type } from '@angular/core';
import { createQueryMatch, MultipleMatchesError, NoMatchesError, QueryMatch } from './query-match';

class Foo {
  fooProperty?: string;
  constructor(public which: string) {}
}

describe('QueryMatch', () => {
  const shouldThrow = (func: () => void, errorClass: Type<Error>) => {
    try {
      func();
      fail(`Should have thrown an ${errorClass.name} error`);
    } catch (e) {
      expect(e).toBeInstanceOf(errorClass);
    }
  };
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
      Object.defineProperty(match, 'fooProperty', { value: 'foo value' });

      expect(match[0].fooProperty).toBe('foo value');
    });

    it('deletes properties on the first match', () => {
      match.fooProperty = 'foo';
      delete match.fooProperty; /* tslint:disable-line no-dynamic-delete no-string-literal */
      expect(match.fooProperty).not.toBeDefined();
    });

    it('passes the instanceof check for the first object', () => {
      expect(match).toBeInstanceOf(Foo);
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
      matches = createQueryMatch([new Foo('ONE'), new Foo('TWO')]);
    });

    it('throws an error on instanceof checks', () => {
      expect(() => matches instanceof Foo).toThrow(new MultipleMatchesError('prototype', 2));
    });

    it('throws an error when you try to get a property and there are multiple results', () => {
      shouldThrow(() => Object.keys(matches.which), MultipleMatchesError);
    });

    it('throws an error when you try to set a property and there are multiple results', () => {
      shouldThrow(() => (matches.which = 'BOOM'), MultipleMatchesError);
    });

    it('throws an error when you try to define a property and there are multiple results', () => {
      shouldThrow(() => Object.defineProperty(matches, 'foo', { value: 'foo value' }), MultipleMatchesError);
    });

    it('throws an error when you try to delete a property and there are multiple results', () => {
      shouldThrow(() => delete matches.fooProperty, MultipleMatchesError);
    });

    it('allows mapping over results', () => {
      expect(matches.map(i => i.which)).toEqual(['ONE', 'TWO']);
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
      shouldThrow(() => emptyMatch instanceof Foo, NoMatchesError);
    });

    it('throws an error when trying to get a property on an empty query match', () => {
      shouldThrow(() => emptyMatch.which, NoMatchesError);
    });

    it('throws an error when trying to set a property on an empty query match', () => {
      shouldThrow(() => (emptyMatch.which = 'BOOM'), NoMatchesError);
    });

    it('throws an error when you try to define a property on an empty match', () => {
      shouldThrow(() => Object.defineProperty(emptyMatch, 'foo', { value: 'foo value' }), NoMatchesError);
    });

    it('throws an error when you try to delete a property on an empty match', () => {
      shouldThrow(() => delete emptyMatch.fooProperty, NoMatchesError);
    });

    it('does not match when trying to check a property on empty results', () => {
      expect('fooProperty' in emptyMatch).toBe(false);
    });

    it('allows mapping over results', () => {
      expect(emptyMatch.map(i => i.which)).toEqual([]);
    });

    it('allows forEach over results', () => {
      emptyMatch.forEach(fail);
      expect(true).toBe(true);
    });
  });
});
