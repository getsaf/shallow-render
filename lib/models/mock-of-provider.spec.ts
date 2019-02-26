import { MockOfProvider } from './mock-of-provider';

describe('MockOfProvider', () => {
  it('adds stubs to class instance', () => {
    const mock = new MockOfProvider(class {}, {getFoo: () => 'got foo'}) as any;

    expect(mock.getFoo()).toBe('got foo');
  });

  it('spys on stub methods', () => {
    const mock = new MockOfProvider(class {}, {getFoo: () => 'got foo'}) as any;
    mock.getFoo();

    expect(mock.getFoo).toHaveBeenCalled();
  });

  it('does not spy on an already stubbed method', () => {
    const mock = new MockOfProvider(class {}, {getFoo: jasmine.createSpy()}) as any;
    mock.getFoo();

    expect(mock.getFoo).toHaveBeenCalled();
  });

  it('applies properties from stub to class instance', () => {
    const mock = new MockOfProvider(class {}, {myProp: 'my value'}) as any;

    expect(mock.myProp).toBe('my value');
  });

  it('assigns the provider to the mockOf property', () => {
    const provider = class {};
    const mock = new MockOfProvider(provider);

    expect(mock.mockOf).toBe(provider);
  });

  it('does not require a stubs property to be sent in', () => {
    expect(() => new MockOfProvider(class {}))
      .not.toThrow();
  });
});
