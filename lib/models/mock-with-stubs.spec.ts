import { MockWithStubs } from './mock-with-stubs';

describe('MockWithStubs', () => {
  it('adds stubs to class instance', () => {
    const mock = new MockWithStubs({ getFoo: () => 'got foo' }) as any;

    expect(mock.getFoo()).toBe('got foo');
  });

  it('spys on stub methods', () => {
    const mock = new MockWithStubs({ getFoo: () => 'got foo' }) as any;
    mock.getFoo();

    expect(mock.getFoo).toHaveBeenCalled();
  });

  it('does not spy on an already stubbed method', () => {
    const mock = new MockWithStubs({ getFoo: jest.fn() }) as any;
    mock.getFoo();

    expect(mock.getFoo).toHaveBeenCalled();
  });

  it('applies properties from stub to class instance', () => {
    const mock = new MockWithStubs({ myProp: 'my value' }) as any;

    expect(mock.myProp).toBe('my value');
  });

  it('does not require a stubs property to be sent in', () => {
    expect(() => new MockWithStubs(class {})).not.toThrow();
  });
});
