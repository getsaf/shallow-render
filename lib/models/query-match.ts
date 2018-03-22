export type QueryMatch<TMatch> = TMatch[] & TMatch;

export class NoMatchesError extends Error {
  constructor(propertyName: string) {
    super(`Could not find the element you were looking for. Your test tried to access the '${propertyName}' property on a QureyResult but your query had no results.`);
  }
}

export class MultipleMatchesError extends Error {
  constructor(propertyName: string, matchLength: number) {
    super(`Tried to access ${propertyName} on query match but your query found multiple (${matchLength} results. Try narrowing your query or targeting the specific match you are interested in from the array`);
  }
}

const throwErrorIfNotOneMatch = (key: string, matches: any[]) => {
  if (matches.length === 0) {
    throw new NoMatchesError(key);
  } else if (matches.length > 1) {
    throw new MultipleMatchesError(key, matches.length);
  }
}

export function createQueryMatch<TMatch>(matches: TMatch[]): QueryMatch<TMatch> {
  const match: any = matches.length ? matches[0] : {};
  return new Proxy(matches, {
    get: (obj: any, key: string) => {
      if (key in matches) {
        return (matches as any)[key];
      } else {
        throwErrorIfNotOneMatch(key, matches);
        return match[key];
      }
    },
    set: (obj: any, key: string, value: any) => {
      throwErrorIfNotOneMatch(key, matches);
      match[key] = value;
      return true;
    }
  });
}

