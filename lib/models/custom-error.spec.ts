import { CustomError } from './custom-error';

describe('CustomError', () => {
  it('is an instanceof Error', () => {
    const error = new CustomError('foo');

    expect(error).toBeInstanceOf(Error);
  });

  it('is an instanceof CustomError', () => {
    const error = new CustomError('foo');

    expect(error).toBeInstanceOf(CustomError);
  });

  it('has has the correct message', () => {
    const error = new CustomError('foo');

    expect(error.message).toBe('foo');
  });
});
