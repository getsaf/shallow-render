# shallow-render

[![Build Status](https://travis-ci.org/getsaf/shallow-render.svg?branch=master)](https://travis-ci.org/getsaf/shallow-render)

Angular 5 testing made easy with shallow rendering and easy mocking.

---
## The problem
Testing in Angular is **HARD**. TestBed is powerful but it's use in component specs ends with lots of duplication.

Here's a standard TestBed spec for a component that uses a few other components, a directive and a pipe and handles click events:
```typescript
describe('MyComponent', () => {
  beforeEach(async => {
    return TestBed.configureTestModule({
      imports: [
        SomeModuleWithDependencies,
      ],
      declarations: [
        TestHostComponent,
        MyComponent, // <-- All I want to do is test this!!
        // We either must list all our dependencies here
        // -- OR --
        // Use NO_ERRORS_SCHEMA which allows any HTML to be used
        // even if it is invalid!
        ButtonComponent,
        LinkComponent,
        FooDirective,
        BarPipe,
      ],
      providers: [
        MyService
      ]
    }).compileComponents().then(() => {
      let myService = TestBed.get(MyService); // Not type safe
      spyOn(myService, 'foo').and.returnValue('mocked foo');
    });
  });
  it('renders a link with the provided label text', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.labelText = 'my text';
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a'));

    expect(a.nativeElement.innerText).toBe('my text');
  });
  
  it('sends "foo" to bound click events', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    spyOn(fixture.componentInstance, 'handleClick');
    fixture.detectChanges();
    const myComponentElement = fixture.debugElement.query(By.directive(MyComponent));
    myComponentElement.click();
    
    expect(fixture.componentInstance.handleClick).toHaveBeenCalledWith('foo');
  });});

@Component({
  template: `
    <my-component [linkText]="linkText" (click)="handleClick($event)">
    </my-component>
  `
})
class TestHostComponent {
  linkLabel: string;
  handleClick() {}
}
```

Whew!!! That was a lot of boilerplate. Here's just some of the issues:
* Our TestBed module looks very similar if not identical to the `NgModule` I've probably already added `MyComponent` to.  Total module duplication.
* Since I've duplicated my module in my spec, I'm not actually sure the real module was setup correctly.
* I've used REAL components and services in my spec which means I have not isolated the component I'm interested in testing.
	* This also means I have to follow, and provide all the dependencies of those real components to the `TestBed` module.
* I had to create a `TestHostComponent` so I could pass bindings into my actual component.
* My `TestBed` boilerplate code-length exceeded my actual test code-length.

## The Solution
We should mock everything we can except for the component in test and that should be **EASY**. Our modules already define the environment in which our components live. They should be *reused*, not *rebuilt* in our specs.

Here's the same specs using `shallow-render`:
```typescript
describe('MyComponent', () => {
  let shallow: Shallow<MyComponent>;
  
  beforeEach(() => {
    shallow = new Shallow(MyComponent, MyModule);
  });

  it('renders a link with the provided label text', async () => {
    const {find} = await shallow.render(`<my-component linkText="my text"></my-component>`);
    const link = find('a');

    expect(link.nativeElement.innerText).toBe('my text');
  });

  it('sends "foo" to bound click events', async () => {
    const {element, bindings} = await shallow.render(
      `<my-component (click)="handleClick($event)"></my-component>`,
      { bind: { handleClick: () => {} } }
    );
    element.click();

    expect(bindings.handleClick).toHaveBeenCalledWith('foo');
  });
});
```

Here's the difference:
* Reuses (and verifies) `MyModule` contains your component and all its dependencies.
* All components inside `MyModule` are mocked using the awesome [ng-mocks](https://github.com/ike18t/ng-mocks) library. This is what makes the rendering "shallow".
* The tests have much less boilerplate which makes the specs easier to follow.
* The HTML used to render the component is IN THE SPEC and easy to find.
	* This means specs now double examples of how to use your component.

## API
### `Shallow` class:
This class is used to setup your test module. It's constructor accepts two arguments:
* `testComponent` - the component you wish to test
* `testModule`  - the Angular module that the `testComponent` belongs to

Behind the scenes, it breaks down the `testModule` into its' bare elements and mocks everything along the way. All your components, directives and pipes are run through [`ng-mocks`](https://github.com/ike18t/ng-mocks). All your providers are mocked with a simple object `{}`.

#### Service or Injection Token Mocking
You have control over your `provider` mocks  by using `shallow.mock`. For example, let's say your component uses `FooService` to get data:
```typescript
@Injectable()
class FooService {
  constructor(private _httpClient: HttpClient) {}
  
  async getFoo() {  
    return await this._httpClient.get<string>('http://foo.service.com').toPromise();
  }
  
  async postFoo() {  
    return await this._httpClient.post<string>('http://foo.service.com').toPromise();
  }
}
```
Shallow will automatically provide an empty mock for this service when you render your component. If your component calls the `getFoo` method, you'll need to provide a stub and return the data your component needs to pass your test. To prevent mistyping, all stubs are type-safe and *must* match the types on the service you're mocking.

```typescript
shallow.mock(FooService, {getFoo: () => 'mocked foo get'});
```

Have multiple services? It's chain-able so you can stack them.
```typescript
shallow
  .mock(FooService, {getFoo: () => 'mocked foo get'})
  .mock(BarService, {getBar: () => 'mocked bar get'});
 ```

`InjectionToken`s work too. Stubs are double-checked against your token's interface to make sure you're using the correct types.
```typescript
shallow
  .mock(FooService, {getFoo: () => 'mocked foo get'})
  .mock(BarService, {getBar: () => 'mocked bar get'});
 ```

If all your specs need the same mock, you can do this in your `beforeEach` block so you only need to do it once. Your individual specs may override the initial mocks if they need to.

```typescript
let shallow: Shallow<MyComponent>;
beforeEach(() => {
  shallow = new Shallow(MyComponent, MyModule)
    .mock(FooService, {getFoo: () => 'mocked foo get'})
    .mock(BarService, {getBar: () => 'mocked bar get'});
})

it('uses the mock', async () => {
  const rendered = await shallow.render();
  // ...
});

it('can override previously defined mocks', async () => {
  const rendered = await shallow
    .mock(FooService, {getFoo: () => 'custom foo'})
    .render()
});
```

#####  Skip mocking with `dontMock`
Have a service/injection token/component/directive/pipe, etc that you don't want to be mocked? Use `dontMock` to bypass the automatic mocking of things in your module (or things imported by your module).
****NOTE: Angular's `coreModule` and `browserModule` are never mocked by this process.***

```typescript
shallow.dontMock(FooService, FooComponent);
```
Tells Shallow to use the *real* `FooService` and `FooComponent` in your spec.

##### Skip mocking globally with `neverMock`
Some components/directives/pipes you may want to always use the real thing. You may choose to "never mock" in your Karma shim them for all specs.

*in karma-test-shim (also notice `neverMock` is a static method on the class)*
```javascript
Shallow.neverMock(FooService, FooPipe);
```

Tells Shallow to always use the *real* `FooService` and `FooPipe` in all your specs.

##### Global mocks with `alwaysMock`
Sometimes you will have things that you're constantly re-mocking for a spec. You can setup global mocks for these things by using `alwaysMock` in your Karma shim and shallow will always provide your mock in modules that use the provider you specified. Note that doing `alwaysMock` is *NOT* a mock-once for all your specs solution. Use this feature sparingly, remember your specs should generally be self-contained as far as mock data goes. Using `alwaysMock` is just as bad as using global variables. TL;DR; Use sparingly or not-at-all.

*in karma-test-shim (also notice `alwaysMock` is a static method on the class)*
```javascript
Shallow.alwaysMock(FooService, {
  getFoo: () => 'foo get',
  postFoo: () => 'foo post',
});
```
##### Global providers with `alwaysProvide`
There are some use cases when your Angular app provides something (usually a configuration) at the top-level of your application. These instance usually follow the [`forRoot`](https://angular.io/guide/singleton-services) pattern. For these cases, you may want your specs to have a similar environment setup where the 'root' providers are globally provided to all specs. This can be accomplished by using `Shallow.alwaysProvide`.

*in karma-test-shim (also notice `alwaysProvide` is a static method on the class)*
```javascript
Shallow.alwaysProvide(MyGlobalService);
```
Now, all specs will receive a *REAL* `MyGlobalService` when requested for injection.

If you use the `forRoot` pattern, you may provide your root providers like so:
```javascript
Shallow.alwaysProvide(MyCoreModule.forRoot().providers);
```

You may also provide a mocked version by chaining `alwaysProvide` with `alwaysMock`:
```javascript
Shallow
  .alwaysProvide(MyGlobalService)
  .alwaysMock(MyGlobalService, {getSomeValue: () => 'Globally mocked value'});
```
Now, all specs will receive a *MOCKED* `MyGlobalService` when requested for injection.

#### Using Pipes with `mockPipe`
Angular pipes are a little special. They are used to transform data in your templates. By default, Shallow will mock all pipes to have no output. Your specs may want to provide mocks for these transforms to allow validation that a pipe received the correct input data.

```typescript
shallow.mockPipe(MyPipe, input => `MyPipe: ${input}`);
```
Tells Shallow to have the `MyPipe` always perform the following action on input data. This lets you inspect your templates and controls for your Pipe's side-effects.

#### Rendering with `render`
Once you've completed your setup, the final step is rendering. Render takes two arguments:
* `html` (optional) -  This will be the HTML that exercises your component.
* `renderOptions` (optional)
	* `detectChanges`: Defaults to true. Automatically run change detection after render.
	* `bind` (optional) - an object that provides your bindings to the `html` template  (see more below).

***NOTE: `render` returns a promise, `async`/`await` are your friends***

Components come in different flavors, some have inputs, some have outputs, some transclude, some are entry components, etc.

##### Basic rendering with HTML
The simplest form of rendering uses a basic HTML template with simple inputs:
```typescript
shallow.render('<my-component name="My Name"></my-component>');
```
This renders `MyComponent` and passes a single `name` input of `"My Name"`.

##### HTML templates with complex input bindings
Some components require complex types as their inputs:

```typescript
shallow.render(
  '<my-component [person]="testPerson"></my-component>',
  {bind: {testPerson: {firstName: 'Brandon', lastName: 'Domingue'}}}
 )
```

Notice we pass in the `bind` render option and hand it a `testPerson` object. This will render the component and pass the `testPerson` into the component's `person` input property.

##### Entry Components
Entry components in Angular don't have selectors. They can't take inputs. You can render these with shallow too. Just omit the HTML template or pass in the entry component class.
```typescript
shallow.render(MyComponent); // Must be the shallow testComponent
// -- or --
shallow.render(); // Automatically renders the testComponent
```

### Rendering and Querying
A [`Rendering`](lib/models/rendering.ts) is returned from the `shallow.render()` method call.

| Property                                                             | Description                                        | type or return type                               |
|----------------------------------------------------------------------|----------------------------------------------------|---------------------------------------------------|
| `instance`                                                           | Instance of the rendered `TestComponent`           |                                                   |
| `element`                                                            | The `DebugElement` of the rendered `TestComponent` |                                                   |
| `TestBed`                                                            | Easy access to `TestBed`                           |                                                   |
| `fixture`                                                            | The `TestBed` fixture from rendering the component |                                                   |
| `bindings`                                                           | The bindings object used in your render (if any)   |                                                   |
| [`find(CSS/Directive/Component)`](#find--querymatchdebugelement)     | Finds elements by CSS or Directive/Component       | [`QueryMatch<DebugElement>`](#querymatch-objects) |
| [`findComponent(Component)`](#findcomponent--querymatchtcomponent)   | Finds and returns all matches for a Component      | [`QueryMatch<TComponent>`](#querymatch-objects)   |
| [`findDirective(Directive)`](#finddirective--querymatchtdirective)   | Finds and returns all matches for a Directive      | [`QueryMatch<TDirective>`](#querymatch-objects)   |
| [`get(Token/Provider)`](#get--provider-instance)                     | Type-safe version of `TestBed.get`                 | `TProvider`                                       |

#### `find` => `QueryMatch<DebugElement>`

```typescript
find(CSSSelector | Directive | Component) => QueryMatch<DebugElement>
```

Accepts a CSS selector, Component class or Directive class and returns all the resulting `DebugElements` wrapped in a [`QueryMatch`](#querymatch-objects) object.

```typescript
const {find} = await shallow.render('<my-component name="foo"></my-component');
const result = find('my-component'); // Find all elements that match this css selector

// Expect a single result like so:
expect(result.length).toBe(1);
// For single results, you can use it like any flat DebugElement
expect(result.componentInstance.name).toBe('foo');
```

You may also pass in the Component class of the thing you are querying for:
```typescript
find(MyComponent); // Finds all instances of MyComponent
```

#### `findComponent` => `QueryMatch<TComponent>`

```typescript
findComponent(Component) => QueryMatch<TComponent>
```

`findComponent` differs from `find` in that it will return the *instances* of the component, not the `DebugElement` returned by `find`. The returned instance(s) are wrapped in a [`QueryMatch`](#querymatch-objects) object.

```typescript
const {findComponent} = await shallow.render('<my-component name="foo"></my-component>');
const result = findComponent(MyComponent);

expect(result.name).is('foo');
```

#### `findDirective` => `QueryMatch<TDirective>`

```typescript
findDirective(Directive) => QueryMatch<TDirective>
```

`findDirective` is similar to `findComponent` except it returns directive instances wrapped in a [`QueryMatch`](#querymatch-objects) object.

```typescript
const {findDirective} = await shallow.render('<div myDirective="foo"/>');
const result = findDirective(MyDirective);

expect(result.myDirective).is('foo');
```

#### `get` => provider instance

```typescript
get(ProvidedClass | InjectionToken) => QueryMatch<TProvider>
```

This is a type-safe version of `TestBed.get()`.

```typescript
const {get} = await shallow.render();
const service = get(MyService); // Returns an instance of MyService (or the mock if it's mocked) from the injector

expect(service.getFoo).toHaveBeenCalled();
```

You may also use `get` to pull service instances and add more mocks/spys on them *AFTER* rendering. (This is usually done *before* rendering by using `shallow.mock()` but sometimes you need to alter mocks after the initial rendering. I recommend a type-safe mocking library like [ts-mocks](https://www.npmjs.com/package/ts-mocks) to do your mocking.

```typescript
const {get, find} = await shallow
  .mock(MyService, {getFoo: () => 'FIRST FOO'})
  .render();
const service = get(MyService);
new Mock(service).extend({getFoo: () => 'SECOND FOO'}); // <-- Using ts-mocks here to re-mock a method
find('button').triggerEventHandler('click', {});
const responseLabel = find('label');

expect(responseLabel.nativeElement.innerText).toBe('SECOND FOO');
```

#### `QueryMatch` objects
Queries return a special `QueryMatch` object. This object is a mash-up of a single object that may be used when the query yields a single result, or an array of objects for when your query yields multiple results.

This lets us use the same object semantically in our tests.

If you expect a single item in your response just use it like a single item:
```typescript
const match = find('foo');
expect(match.nativeElement.tagName).toBe('foo');
``` 
If your query found multiple items, and you try to use the match as if it were a single item, Shallow will throw an error letting you know multiple items were found when you expected only one.

If you expect multiple items, use `Array` methods on the matches:
```typescript
const matches = find('foo');
matches.forEach(match => { 
  expect(match.nativeElement.tagName).toBe('foo'));
});
```

## Need more examples?
Check out the [examples](lib/examples) folder for more specific use cases including:
* [Simple component](lib/examples/simple-component.spec.ts)
* [Component with bindings](lib/examples/component-with-bindings.spec.ts)
* [Component with directive](lib/examples/component-with-directive.spec.ts)
* [Component with a service](lib/examples/component-with-service.spec.ts)
* [Component with custom providers](lib/examples/component-with-custom-providers.spec.ts)
* [Testing directives](lib/examples/directive-only-test.spec.ts)
* [Using custom Pipe mocks](lib/examples/mocking-pipes.spec.ts)
* [Using Injection Tokens](lib/examples/mocking-injection-tokens.spec.ts)
* [Multiple components](lib/examples/multiple-components.spec.ts)
* [Multiple modules](lib/examples/multiple-modules.spec.ts)
* [Using dontMock to bypass mocking in a spec](lib/examples/using-dont-mock.spec.ts)
* [Using alwaysMock to globally mock things](lib/examples/using-always-mock.spec.ts)
* [Using alwaysProvide to globally provide things](lib/examples/using-always-provide.spec.ts)
* [Using neverMock to bypass mocking globally](lib/examples/using-never-mock.spec.ts)
