import { Input, Output, Component, EventEmitter, NgModule } from '@angular/core';
import { Renderer } from './renderer';
import { TestSetup } from './test-setup';

@Component({
  selector: 'thing',
  template: '<div></div>'
})
class TestComponent {
  @Input('renamedInput') fooInput: string;
  @Input() myInput: string;
  myProperty: string;
  @Output() myOutput = new EventEmitter<any>();
  emitterWithoutOutputDecorator = new EventEmitter<any>();
}

@NgModule({
  declarations: [TestComponent]
})
class TestModule {}

describe('Renderer', () => {
  let renderer: Renderer<TestComponent>;
  beforeEach(() => {
    const setup = new TestSetup(TestComponent, TestModule);
    setup.dontMock.push(TestComponent);
    renderer = new Renderer(setup);
  });

  it('spys on output event emitters', async () => {
    const {instance} = await renderer.render();
    instance.myOutput.emit('FOO');

    // Spys have a `calls` property on them. This is the only way I know
    // how to detect an existing spy.
    expect((instance.myOutput.emit as jasmine.Spy).calls).toBeDefined();
    expect(instance.myOutput.emit).toHaveBeenCalledWith('FOO');
  });

  it('does not spy on event emitters that are not marked as @Output', async () => {
    const {instance} = await renderer.render();
    instance.emitterWithoutOutputDecorator.emit('FOO');

    // Spys have a `calls` property on them. This is the only way I know
    // how to detect an existing spy.
    expect((instance.emitterWithoutOutputDecorator.emit as jasmine.Spy).calls)
      .not.toBeDefined();
  });

  describe('with only template', () => {
    it('wraps the rendering in a container', async () => {
      const {fixture} = await renderer.render('<thing></thing>');

      expect(fixture.componentInstance instanceof TestComponent).toBe(false);
    });
  });

  describe('with no arguments', () => {
    it('renders the component directly', async () => {
      const {fixture} = await renderer.render();

      expect(fixture.componentInstance instanceof TestComponent).toBe(true);
    });

  });

  describe('with only renderOptions', () => {
    it('renders the component directly', async () => {
      const {fixture} = await renderer.render({});

      expect(fixture.componentInstance instanceof TestComponent).toBe(true);
    });

    it('binds directly to the component', async () => {
      const {instance} = await renderer.render({
        bind: {myInput: 'FOO'}
      });

      expect(instance.myInput).toBe('FOO');
    });

    it('works on renamed @Input properties', async () => {
      await renderer.render({
        bind: {fooInput: 'FOO'}
      });
    });

    it('throws an error when binding to a property that is not marked as an @Input', async (done) => {
      try {
        await renderer.render({
          bind: {myProperty: 'FOO'}
        });
        fail('Render should have thrown an error because the myProperty is not an @Input');
      } catch {
        done();
      }
    });
  });
});
