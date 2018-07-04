import { Input, Output, OnInit, Component, EventEmitter, NgModule } from '@angular/core';
import { Renderer, InvalidStaticPropertyMockError } from './renderer';
import { TestSetup } from './test-setup';

class TestUtility { // tslint:disable-line no-unnecessary-class
  static readonly staticNumber = 123;
  static staticMethod() { return 'foo'; }
}

const staticObject = {
  staticNumber: 123,
  staticMethod: () => 'foo',
};

@Component({
  selector: 'thing',
  template: `
    <div>{{myInput}}</div>
    <span>{{promiseResult}}</span>
  `
})
class TestComponent implements OnInit {
  @Input('renamedInput') fooInput: string;
  @Input() myInput: string;
  myProperty: string;
  @Output() myOutput = new EventEmitter<any>();
  emitterWithoutOutputDecorator = new EventEmitter<any>();
  promiseResult: string;

  async ngOnInit() {
    this.promiseResult = await Promise.resolve('Promise Result');
  }
}

@NgModule({
  declarations: [TestComponent]
})
class TestModule {}

describe('Renderer', () => {
  let renderer: Renderer<TestComponent>;
  let setup: TestSetup<TestComponent>;
  beforeEach(() => {
    setup = new TestSetup(TestComponent, TestModule);
    setup.dontMock.push(TestComponent);
    renderer = new Renderer(setup);
  });

  it('mocks static CLASS methods from the test setup', async () => {
    setup.staticMocks.set(TestUtility, {staticMethod: () => 'mocked foo'});
    await renderer.render();

    expect(TestUtility.staticMethod()).toBe('mocked foo');
  });

  it('mocks static OBJECT methods from the test setup', async () => {
    setup.staticMocks.set(staticObject, {staticMethod: () => 'mocked foo'});
    await renderer.render();

    expect(staticObject.staticMethod()).toBe('mocked foo');
  });

  it('mocks static CLASS properties throws an error', async () => {
    setup.staticMocks.set(TestUtility, {staticNumber: 999});

    try {
      await renderer.render();
      fail('render should have thrown an error');
    } catch (e) {
      expect(e instanceof InvalidStaticPropertyMockError).toBe(true);
    }
  });

  it('mocks static OBJECT properties throws an error', async () => {
    setup.staticMocks.set(staticObject, {staticNumber: 999});

    try {
      await renderer.render();
      fail('render should have thrown an error');
    } catch (e) {
      expect(e instanceof InvalidStaticPropertyMockError).toBe(true);
    }
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

  describe('whenStable', () => {
    fit('is awaited by default', async () => {
      const {find} = await renderer.render();

      expect(find('span').nativeElement.textContent).toBe('Promise Result');
    });

    it('is not awaited when disabled in options', async () => {
      const {find} = await renderer.render({whenStable: false});

      expect(find('span').nativeElement.textContent).toBe('');
    });
  });

  describe('detectChanges', () => {
    it('is detected by default', async () => {
      const {find} = await renderer.render({
        bind: {myInput: 'FOO'}
      });

      expect(find('div').nativeElement.textContent).toBe('FOO');
    });

    it('is not detected by when disabled in options', async () => {
      const {find} = await renderer.render({
        detectChanges: false,
        bind: {myInput: 'FOO'}
      });

      expect(find('div').nativeElement.textContent).toBe('');
    });
  });
});
