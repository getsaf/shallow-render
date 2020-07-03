import { CustomError } from './custom-error';
export type QueryMatch<TMatch> = TMatch[] & TMatch;

export class NoMatchesError extends CustomError {
  constructor(propertyName: string) {
    super(
      `Could not find the element you were looking for. Your test tried to access the '${propertyName}' property on a QueryResult but your query had no results.`
    );
  }
}

export class MultipleMatchesError extends CustomError {
  constructor(propertyName: string, matchLength: number) {
    super(
      `Tried to access ${propertyName} on query match but your query found multiple (${matchLength} results. Try narrowing your query or targeting the specific match you are interested in from the array`
    );
    // this.message = 'foo';
  }
}

const throwErrorIfNotOneMatch = (key: string, matches: any[]) => {
  if (matches.length === 0) {
    throw new NoMatchesError(key);
  } else if (matches.length > 1) {
    throw new MultipleMatchesError(key, matches.length);
  }
};

export function createQueryMatch<TMatch>(matches: TMatch[]): QueryMatch<TMatch> {
  const match: any = matches.length ? matches[0] : {};
  return new Proxy(matches, {
    get: (_obj: any, key: string) => {
      if (key in matches) {
        return (matches as any)[key];
      } else {
        throwErrorIfNotOneMatch(key, matches);
        return match[key];
      }
    },
    set: (_obj: any, key: string, value: any) => {
      throwErrorIfNotOneMatch(key, matches);
      match[key] = value;
      return true;
    },
    has: (_obj: any, key: string) => {
      if (matches.length === 1) {
        return key in matches || key in match;
      }
      return key in matches;
    },
    // Not sure why, but this don't work in Chrome
    // ownKeys: (obj: any) => {
    //   if (matches.length === 1) {
    //     return [...Reflect.ownKeys(match), ...Reflect.ownKeys(matches)];
    //   } else {
    //     return Object.keys(matches);
    //   }
    // },
    defineProperty: (_obj, key: string, descriptor: any) => {
      throwErrorIfNotOneMatch(key, matches);
      Object.defineProperty(match, key, descriptor);
      return true;
    },
    deleteProperty: (_obj, key: string) => {
      throwErrorIfNotOneMatch(key, matches);
      delete match[key]; /* tslint:disable-line no-dynamic-delete */
      return true;
    },
    getPrototypeOf: (_target: any) => {
      throwErrorIfNotOneMatch('prototype', matches);
      return Object.getPrototypeOf(match);
    },
  });
}
