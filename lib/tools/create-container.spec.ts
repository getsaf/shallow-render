import { createContainer } from './create-container';

describe('createContainerComponent', () => {
  it('attaches binding properties to container prototype', () => {
    const bindings: any = {foo: 'foo', bar: 'bar'};
    const Container = createContainer('', bindings);
    const container: any = new Container();

    Object.keys(bindings)
      .forEach(key => expect(container[key]).toBe(bindings[key]));
  });

  it('attaches binding functions as spys on container prototype', () => {
    const Container = createContainer('', {foo: () => 'foo'});
    const container: any = new Container();

    container.foo();
    expect(container.foo).toHaveBeenCalled();
  });

  it('does not spy on a spy', () => {
    const Container = createContainer('', {foo: jasmine.createSpy()});
    const container: any = new Container();

    container.foo();
    expect(container.foo).toHaveBeenCalled();
  });
});
