import { CustomError } from './custom-error';

describe('CustomError', () => {
  it('is an instanceof Error', () => {
    const error = new CustomError('foo');

    expect(error instanceof Error).toBe(true);
  });

  it('is an instanceof CustomError', () => {
    const error = new CustomError('foo');

    expect(error instanceof CustomError).toBe(true);
  });

  it('has has the correct message', () => {
    const error = new CustomError('foo');

    expect(error.message).toBe('foo');
  });
});
