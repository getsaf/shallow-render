import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef,
  InjectionToken,
  Injectable,
} from '@angular/core';
import { InvalidBindOnEntryComponentError, InvalidInputBindError, Renderer } from './renderer';
import { TestSetup } from './test-setup';
import { InvalidStaticPropertyMockError } from '../tools/mock-statics';

class TestUtility {
  // tslint:disable-line no-unnecessary-class
  static readonly staticNumber = 123;
  static staticMethod() {
    return 'foo';
  }
}

const staticObject = {
  staticNumber: 123,
  staticMethod: () => 'foo',
};

@Component({
  selector: 'thing',
  template: `
    <div>{{ myInput }}</div>
    <span>{{ promiseResult }}</span>
  `,
})
class TestComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('renamedInput') fooInput!: string;
  @Input() myInput!: string;
  myProperty!: string;
  @Output() myOutput = new EventEmitter<any>();
  emitterWithoutOutputDecorator = new EventEmitter<any>();
  promiseResult!: string;

  async ngOnInit() {
    this.promiseResult = await Promise.resolve('Promise Result');
  }
}

@NgModule({
  declarations: [TestComponent],
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
    setup.staticMocks.set(TestUtility, { staticMethod: () => 'mocked foo' });
    await renderer.render();

    expect(TestUtility.staticMethod()).toBe('mocked foo');
  });

  it('mocks static OBJECT methods from the test setup', async () => {
    setup.staticMocks.set(staticObject, { staticMethod: () => 'mocked foo' });
    await renderer.render();

    expect(staticObject.staticMethod()).toBe('mocked foo');
  });

  it('mocks static CLASS properties throws an error', async () => {
    setup.staticMocks.set(TestUtility, { staticNumber: 999 });

    try {
      await renderer.render();
      fail('render should have thrown an error');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidStaticPropertyMockError);
    }
  });

  it('mocks static OBJECT properties throws an error', async () => {
    setup.staticMocks.set(staticObject, { staticNumber: 999 });

    try {
      await renderer.render();
      fail('render should have thrown an error');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidStaticPropertyMockError);
    }
  });

  it('spys on output event emitters', async () => {
    const { instance } = await renderer.render();
    instance.myOutput.emit('FOO');

    // Spys have a `calls` property on them. This is the only way I know
    // how to detect an existing spy.
    expect((instance.myOutput.emit as jasmine.Spy).calls).toBeDefined();
    expect(instance.myOutput.emit).toHaveBeenCalledWith('FOO');
  });

  it('does not spy on event emitters that are not marked as @Output', async () => {
    const { instance } = await renderer.render();
    instance.emitterWithoutOutputDecorator.emit('FOO');

    // Spys have a `calls` property on them. This is the only way I know
    // how to detect an existing spy.
    expect((instance.emitterWithoutOutputDecorator.emit as jasmine.Spy).calls).not.toBeDefined();
  });

  describe('with only template', () => {
    it('wraps the rendering in a container', async () => {
      const { fixture } = await renderer.render('<thing></thing>');

      expect(fixture.debugElement.children[0].componentInstance).toBeInstanceOf(TestComponent);
    });
  });

  describe('with no arguments', () => {
    it('wraps the rendering in a container', async () => {
      const { fixture } = await renderer.render();

      expect(fixture.debugElement.children[0].componentInstance).toBeInstanceOf(TestComponent);
    });
  });

  describe('with only renderOptions', () => {
    it('wraps the rendering in a container', async () => {
      const { fixture } = await renderer.render({});

      expect(fixture.debugElement.children[0].componentInstance).toBeInstanceOf(TestComponent);
    });

    it('binds through the wrapper to the component', async () => {
      const { instance } = await renderer.render({
        bind: { myInput: 'FOO' },
      });

      expect(instance.myInput).toBe('FOO');
    });

    it('works on renamed @Input properties', async () => {
      await renderer.render({
        bind: { fooInput: 'FOO' },
      });
      expect(true).toBe(true);
    });

    it('throws an error when binding to a property that is not marked as an @Input', async () => {
      try {
        await renderer.render({
          bind: { myProperty: 'FOO' },
        });
        fail('Render should have thrown an error because the myProperty is not an @Input');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidInputBindError);
      }
    });

    describe('without a selector defined on the component', () => {
      @Component({ template: '<div>Without selector</div>' })
      class TestComponentWithoutSelector {}

      @NgModule({ declarations: [TestComponentWithoutSelector] })
      class NoSelectorModule {}

      it('should be able to render without a template specified', async () => {
        const testSetup = new TestSetup(TestComponentWithoutSelector, NoSelectorModule);
        testSetup.dontMock.push(TestComponentWithoutSelector);

        const { element } = await new Renderer(testSetup).render();

        expect(element).toBeTruthy();
      });
    });
  });

  describe('whenStable', () => {
    it('is awaited by default', async () => {
      const { find } = await renderer.render();

      expect(find('span').nativeElement.textContent).toBe('Promise Result');
    });

    it('is not awaited when disabled in options', async () => {
      const { find } = await renderer.render({ whenStable: false });

      expect(find('span').nativeElement.textContent).toBe('');
    });
  });

  describe('detectChanges', () => {
    it('is detected by default', async () => {
      const { find } = await renderer.render({
        bind: { myInput: 'FOO' },
      });

      expect(find('div').nativeElement.textContent).toBe('FOO');
    });

    it('is not detected when disabled in options', async () => {
      const { find } = await renderer.render({
        detectChanges: false,
        bind: { myInput: 'FOO' },
      });

      expect(find('div').nativeElement.textContent).toBe('');
    });
  });

  describe('structural directives', () => {
    @Directive({ selector: '[ifOdd]' })
    class IfOddDirective {
      private hasView = false;

      constructor(private readonly _templateRef: TemplateRef<any>, private readonly _viewContainer: ViewContainerRef) {}

      @Input() set ifOdd(possiblyOdd: number) {
        const isOdd = possiblyOdd % 2 !== 0;
        if (!isOdd && !this.hasView) {
          this._viewContainer.createEmbeddedView(this._templateRef);
          this.hasView = true;
        } else if (isOdd && this.hasView) {
          this._viewContainer.clear();
          this.hasView = false;
        }
      }
    }
    @NgModule({ declarations: [IfOddDirective] })
    class OddModule {}

    it('element is the first child element when testing a structural directive', async () => {
      const myRenderer = new Renderer(new TestSetup(IfOddDirective, OddModule));
      const { element } = await myRenderer.render('<b *ifOdd="2"></b>');

      expect(element.nativeElement.tagName).toBe('B');
    });

    it('element is undefined when the structural directive does not render an element', async () => {
      const myRenderer = new Renderer(new TestSetup(IfOddDirective, OddModule));
      const { element } = await myRenderer.render('<b *ifOdd="1"></b>');

      expect(element).not.toBeDefined();
    });

    it('instance is the directive instance when testing a structural directive', async () => {
      const myRenderer = new Renderer(new TestSetup(IfOddDirective, OddModule));
      const { instance } = await myRenderer.render('<b *ifOdd="2"></b>');

      expect(instance).toBeInstanceOf(IfOddDirective);
    });
  });

  describe('entry components', () => {
    it('allows rendering entryComponents with some module magic', async () => {
      @Component({
        template: '<i class="my-entry">My Entry</i>',
      })
      class EntryComponent {}

      @Component({
        selector: 'my-normal-component',
        template: '<i *ngComponentOutlet="entryComponentClass"></i>',
      })
      class NormalComponent {
        entryComponentClass = EntryComponent;
      }

      @NgModule({
        declarations: [NormalComponent, EntryComponent],
        entryComponents: [EntryComponent],
      })
      class EntryTestModule {}

      const mySetup = new TestSetup(NormalComponent, EntryTestModule);
      mySetup.dontMock.push(NormalComponent, EntryComponent);
      const { find } = await new Renderer(mySetup).render({ whenStable: true });

      expect(find('.my-entry')).toHaveFoundOne();
    });

    it('allows rendering entryComponents with dependencies', async () => {
      @Component({
        selector: 'child-component',
        template: '<i class="my-child">My Dependency</i>',
      })
      class ChildComponent {}

      @Component({
        template: '<i class="my-entry"><child-component></child-component></i>',
      })
      class EntryComponent {}

      @Component({
        selector: 'normal-component',
        template: '<i *ngComponentOutlet="entryComponentClass"></i>',
      })
      class NormalComponent {
        entryComponentClass = EntryComponent;
      }

      @NgModule({
        declarations: [NormalComponent, EntryComponent, ChildComponent],
        entryComponents: [EntryComponent],
      })
      class EntryTestModule {}

      const mySetup = new TestSetup(NormalComponent, EntryTestModule);
      mySetup.dontMock.push(NormalComponent, EntryComponent);
      const { find } = await new Renderer(mySetup).render({ whenStable: true });

      expect(find('.my-entry')).toHaveFoundOne();
    });

    it('does not allow bindings to be set for entry components', async () => {
      @Component({
        template: '<i class="my-entry">My Entry</i>',
      })
      class EntryComponent {
        @Input() devMadeAMistakeAndCreatedAnInputOnAnEntryComponent!: string;
      }

      @NgModule({
        declarations: [EntryComponent],
        entryComponents: [EntryComponent],
      })
      class EntryTestModule {}

      const mySetup = new TestSetup(EntryComponent, EntryTestModule);
      try {
        await new Renderer(mySetup).render({
          bind: { devMadeAMistakeAndCreatedAnInputOnAnEntryComponent: 'Whoops!' },
        });
        fail('Should not have rendered the entry component');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidBindOnEntryComponentError);
      }
    });

    it('provides mocked things even if they are not in the module', async () => {
      @Component({
        template: '<i>Booya</i>',
      })
      class BasicComponent {}

      @Injectable({ providedIn: 'root' })
      class BasicService {
        basicFunction() {
          return 'Basic';
        }
      }

      const MY_TOKEN = new InjectionToken('Foo', { providedIn: 'root', factory: () => 'FOO' });

      @NgModule({
        declarations: [BasicComponent],
      })
      class BasicModule {}

      const mySetup = new TestSetup(BasicComponent, BasicModule);
      mySetup.mocks.set(MY_TOKEN, 'MOCKED VALUE');
      mySetup.mocks.set(BasicService, { basicFunction: () => 'MOCKED BASIC' });

      const rendering = await new Renderer(mySetup).render();

      const injectedService = rendering.inject(BasicService);
      const injectedToken = rendering.inject(MY_TOKEN);

      expect(injectedToken).toBe('MOCKED VALUE');
      expect(injectedService.basicFunction()).toBe('MOCKED BASIC');
      expect(injectedService.basicFunction).toHaveBeenCalled();
    });
  });
});
