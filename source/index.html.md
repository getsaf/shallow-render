---
title: Shallow Render

toc_footers:
  - <a href='https://github.com/getsaf/shallow-render'>View Project on GitHub</a>
  - <a href='https://github.com/slatedocs/slate'>Documentation Powered by Slate</a>

search: true
---

<!--
# Example MarkDown

<aside class="success">
Remember — a happy kitten is an authenticated kitten!
</aside>

<aside class="notice">
You must replace <code>meowmeowmeow</code> with your personal API key.
</aside>

<aside class="warning">Inside HTML code blocks like this one, you can't use Markdown, so use <code>&lt;code&gt;</code> blocks to denote code.</aside>

> To authorize, use this code:

-->

# shallow-render

[![Build Status](https://travis-ci.org/getsaf/shallow-render.svg?branch=master)](https://travis-ci.org/getsaf/shallow-render)
[![npm version](https://badge.fury.io/js/shallow-render.svg)](https://www.npmjs.com/package/shallow-render)

Angular testing made easy with shallow rendering and easy mocking.

## Resources

- [GitHub Project](https://github.com/getsaf/shallow-render)
- [StackBlitz Playground](https://stackblitz.com/github/getsaf/shallow-render-stackblitz)
- [Release Notes](https://github.com/getsaf/shallow-render/releases)

## Articles

- [Testing Angular Components With shallow-render](https://medium.com/@getsaf/testing-angular-components-with-shallow-render-9334d16dc2e3?source=friends_link&sk=5c72c2bf4ce91da656916dc680f8b1cf)
- [Advanced shallow-render Testing](https://medium.com/@getsaf/advanced-shallow-render-testing-for-angular-components-452ce74d5f88?source=friends_link&sk=91d48511b60871c7b34b1bbb231ce1a5)
- [Why Shallow Rendering is Important](https://medium.com/@getsaf/why-shallow-rendering-is-import-in-angular-unit-tests-84569d571b72?source=friends_link&sk=4576570c948a531036cc8fe9e2dc9a19)

## Angular Version Support

| Angular | shallow-render |
| ------- | -------------- |
| 9x      | 9x             |
| 6x-8x   | 8x             |
| 5x      | <= 7.2.0       |

## Super Simple Tests

```typescript
describe("ColorLinkComponent", () => {
  let shallow: Shallow<ColorLinkComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLinkComponent, MyModule);
  });

  it("renders a link with the name of the color", async () => {
    const { find } = await shallow.render({ bind: { color: "Blue" } });
    // or shallow.render(`<color-link color="Blue"></color-link>`);

    expect(find("a").nativeElement.innerText).toBe("Blue");
  });

  it("emits color when clicked", async () => {
    const { element, outputs } = await shallow.render({
      bind: { color: "Red" }
    });
    element.click();

    expect(outputs.handleClick.emit).toHaveBeenCalledWith("Red");
  });
});
```

## The problem

Testing in Angular is **HARD**. TestBed is powerful but its use in component specs ends with lots of duplication.

Here's a standard TestBed spec for a component that uses a few other components, a directive and a pipe and handles click events:

```typescript
describe("MyComponent", () => {
  beforeEach(async => {
    return TestBed.configureTestModule({
      imports: [SomeModuleWithDependencies],
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
        BarPipe
      ],
      providers: [MyService]
    })
      .compileComponents()
      .then(() => {
        let myService = TestBed.get(MyService); // Not type safe
        spyOn(myService, "foo").and.returnValue("mocked foo");
      });
  });

  it("renders a link with the provided label text", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.labelText = "my text";
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css("a"));

    expect(a.nativeElement.innerText).toBe("my text");
  });

  it('sends "foo" to bound click events', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    spyOn(fixture.componentInstance, "handleClick");
    fixture.detectChanges();
    const myComponentElement = fixture.debugElement.query(
      By.directive(MyComponent)
    );
    myComponentElement.click();

    expect(fixture.componentInstance.handleClick).toHaveBeenCalledWith("foo");
  });
});

@Component({
  template: `
    <my-component
      [linkText]="linkText"
      (click)="handleClick($event)"
    ></my-component>
  `
})
class TestHostComponent {
  linkLabel: string;
  handleClick() {}
}
```

Whew!!! That was a lot of boilerplate. Here's just some of the issues:

- Our TestBed module looks very similar if not identical to the `NgModule` I've probably already added `MyComponent` too. Total module duplication.
- Since I've duplicated my module in my spec, I'm not actually sure the real module was setup correctly.
- I've used REAL components and services in my spec which means I have not isolated the component I'm interested in testing.
  - This also means I have to follow, and provide all the dependencies of those real components to the `TestBed` module.
- I had to create a `TestHostComponent` so I could pass bindings into my actual component.
- My `TestBed` boilerplate code-length exceeded my actual test code-length.

## The Solution

We should mock everything we can except for the component in test and that should be **EASY**. Our modules already define the environment in which our components live. They should be _reused_, not _rebuilt_ in our specs.

Here's the same specs using `shallow-render`:

```typescript
describe("MyComponent", () => {
  let shallow: Shallow<MyComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, MyModule);
  });

  it("renders a link with the provided label text", async () => {
    const { find } = await shallow.render({ bind: { linkText: "my text" } });
    // or shallow.render(`<my-component linkText="my text"></my-component>`);

    expect(find("a").nativeElement.innerText).toBe("my text");
  });

  it('sends "foo" to bound click events', async () => {
    const { element, outputs } = await shallow.render();
    element.click();

    expect(outputs.handleClick).toHaveBeenCalledWith("foo");
  });
});
```

Here's the difference:

- Reuses (and verifies) `MyModule` contains your component and all its dependencies.
- All components inside `MyModule` are mocked using the awesome [ng-mocks](https://github.com/ike18t/ng-mocks) library. This is what makes the rendering "shallow".
- The tests have much less boilerplate which makes the specs easier to follow.
- The HTML used to render the component is IN THE SPEC and easy to find.
  - This means specs now double examples of how to use your component.

# Why not just use TestBed?

In a nutshell, I wanted to make component isolation easy for Angular component tests. I thought it was too difficult with the out-of-the-box solution. Even the Angular docs don't solve for type-safety and component isolation without adding duplication.

I want a few things from my unit tests that fall into two categories:

## How trustworthy is the test

- It should fail when:
  - If a type changes and my component _directly_ misuses that type, I want my tests to fail for that component.
  - If my test uses a mock that does not match the contract of the service it is mocking.
  - If I mistype a component tag.
  - If I use a component that is not accessible from my module.
  - If I mistype an input/output on a child-component.

## How brittle is the test

- It should _not_ fail when:
  - A child component adds a private dependency but the public contract does not change.
  - A child component's dependency changes but the public contract does not change.
  - A service/injectable's dependency changes but the public contract does not change.
  - A child component's internal DOM structure changes.

TestBed alone struggles with a lot of things on this list. I'll run through the standard options, all of which can be found in various places in the Angular docs.

## Demo Test Components

Say you have a component you want to test:

```typescript
@Component({
  selector: "dashboard",
  template: `
    <hello [person]="person"></hello>
    <person-details [person]="person"></person-details>
  `
})
class DashboardComponent {
  @Input() person: Person;
}
```

And my child components look like this:

```typescript
@Component({
  selector: "hello",
  template: `
    <h1>Hello {{ person.name }}</h1>
    <last-login [person]="person"></last-login>
  `
})
class HelloComponent {
  @Input() person: Person;
}
```

The last-login child component which uses a service...

```typescript
@Component({
  selector: "last-login",
  template: `
    <div *ngIf="loaded">Your last login was {{ lastLogin | date }}</div>
  `
})
class LastLoginComponent extends NgOnInit {
  @Input() person: Person;
  lastLogin: Date;
  constructor(private loginDetailsService: LoginDetailsService) {}
  async onInit() {
    this.lastLogin = await this.loginDetailsService.getLastLoginFor(
      this.person
    );
  }
}
```

The person-details component which also uses a service...

```typescript
@Component({
  selector: "person-details",
  template: `
    <ul *ngIf="details">
      <li *ngFor="let detail of details">
        {{ detail.name }}: {{ detail.value }}
      </li>
    </ul>
  `
})
class PersonDetailsComponent implements NgOnInit {
  @Input() person: Person;
  constructor(private personDetailsService: PersonDetailsService) {}
  async onInit() {
    this.details = await this.personDetailsService.getDetailsFor(this.person);
  }
}
```

## The testing options

Ok, now we want to write a unit test for the `DashboardComponent`. With TestBed alone, this becomes pretty difficult to do while maintaining type-safety and template-safety. Here are our options.

### Import the whole module

```typescript
describe("DashboardComponent", () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule] // Take the whole thing
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  /* tests...*/
});
```

The problem here is that we're only intending to render the `DashboardComponent` but since we pulled in the actual module, it rendered the _real_ `HelloComponent` and the _real_ `PersonDetailsComponent` which depend on external services. When those child components `onInit` methods fire, they'll blow up on the network calls. I don't want any actual network calls to go out in my `DashboardComponent` test because my `DashboardComponent` doesn't directly depend on those services, they're implementation details of the child components (which would be covered in the child component's specs).

### Import the whole module and mock child/grandchild dependencies

I _could_ keep going with my TestBed setup here and mock those services out:

```typescript
describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule],
      provide: [
        // There is no type-safety with this mock.
        {provide: PersonDetailsService, useValue: {getDetailsFor: () => Promise.resolve({address: '123 Foo St'})}
        // No type-safety here either.
        {provide: LastLoginService, useValue: {getLastLoginFor: () => Promise.resolve(new Date())}
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  /* tests...*/
});
```

Now, my `DashboardComponent` spec has all these mock services in its spec just to satisfy the child component's dependencies. This tightly couples the `DashboardComponent`'s spec to the private implementation of its dependencies. Bad, right? Our spec doesn't even appear to use these services and if I look in the `DashboardComponent` it's difficult to understand why they were even added to this spec in the first place.

Imagine the TestBed setup for a component that renders a thing that renders another thing that renders the Dashboard component. The higher up the chain you go the more mocking boilerplate you have to provide for the dependencies all-the-way down. This also makes it very difficult to change the `PersonDetailsComponent`'s internals down the road. Ideally, if the contract for the `PersonDetailsService` needed a change in the future, you only need to change the `PersonDetailsComponent` to update your app but if you're writing tests like this, you'd be on the hook for changing ALL the specs for all the components that render the `PersonDetailsComponent` AND all specs for things that render parents of things that render the `PersonDetailsComponent` even though the only component that actually needed changing was the `PersonDetailsComponent`. In a large project, this could mean hundreds of specs change for a single component's change.

### Manual Component Mocks

You can combat the dependency-hell by manually breaking down your test module and manually creating mock components with TestBed but even that has drawbacks because you're duplicating your child components' interfaces and you now have to keep them in sync and maintain a ton of those mock components.

Here's a small taste of that approach:

```typescript
@Component({ selector: "hello", template: "" })
class MockHelloComponent {
  @Input() person: Person;
}

@Component({ selector: "person-details", template: "person-details" })
class MockPersonDetailsComponent {
  @Input() person: Person;
}

describe("DashboardComponent", () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        MockHelloComponent,
        MockPersonDetailsComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  /* tests...*/
});
```

Not bad, but if you have hundreds of components, you have hundreds of mock components that you gotta keep in sync. The compiler won't help you much here either, you can very easily mess up a mock component and make a test pass when it shouldn't.

### What about `NO_ERRORS_SCHEMA` or `CUSTOM_ELEMENTS_SCHEMA`?

See the [`NO_ERRORS_SCHEMA` docs](https://angular.io/api/core/NO_ERRORS_SCHEMA) or the [`CUSTOM_ELEMENTS_SCHEMA` docs](https://angular.io/api/core/CUSTOM_ELEMENTS_SCHEMA) and you'll see that adding these to your tests explicitly _allows errors_. I'm not sure why Angular created this hack. It'll definitely make your tests pass but they pass because errors are not reported, not cool.

```typescript
describe("DashboardComponent", () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  /* tests...*/
});
```

Unfortunately, this allows your component to be riddled with template errors while your unit tests still pass.

### The Shallow rendering alternative

Alternatively, with `shallow-render`, your test module setup and isolation is easy.

```typescript
let shallow: Shallow<DashboardComponent>;
beforeEach(() => {
  shallow = new Shallow(DashboardComponent, DashboardModule);
});
/* tests... */
```

All the child components/directives are automatically mocked with the appropriate in/outputs. Your `DashboardComponent` is completely isolated from the git-go. When you render, _ONLY_ the `DashboardComponent` is rendered but your template is _still checked for errors_ and any child components you use in your component are verified to exist in your module. This means if you forgot to import something in your component's module, your test fails so not only is your component tested, your module is verified!

### Add in type-safe mocks

If we wanted to write a test for the `PersonDetailsComponent`, which uses a service directly, it's pretty easy to mock the service.

```typescript
let shallow: Shallow<DashboardComponent>;
beforeEach(() => {
  shallow = new Shallow(PersonDetailsComponent, DashboardModule)
    // the mock below is type-checked so the result of getDetailsFor must match the signature of the PersonDetailsService
    .mock(PersonDetailsService, {
      getDetailsFor: () => Promise.resolve({ address: "123 Foo St" })
    });
});
/* tests... */
```

Your mock is _fully type-safe_ so if you try to return a mismatching type, the compiler complains.

# Getting Started

First, install `shallow-render`:

`npm install -D shallow-render`

That's it, you're be ready to write a test!

---

## Your first test

Start by identifying the component you want to test, and the Angular module that component lives in.

For this example, we have `FooComponent` which lives in the `FooModule` like so:

> foo.component.ts

```typescript
@Component({
  selector: "foo",
  template: "<h1>{{label}}</h1>"
})
export class FooComponent {
  @Input() label = "FOO!!";
}
```

> foo.module.ts

```typescript
@NgModule({
  declarations: [FooComponent],
  exports: [FooComponent]
})
export class FooModule {}
```

We want to write tests to cover the functionality of the `FooComponent` to make sure it renders the right thing.

> foo.component.spec.ts

```typescript
import { Shallow } from "shallow-render";
import { FooComponent } from "./foo.component";
import { FooModule } from "./foo.module";

describe("FooComponent", () => {
  let shallow: Shallow<FooComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooModule);
  });

  it("displays a default when no label is set", async () => {
    const { find } = await shallow.render(`<foo></foo>`);

    expect(find("h1").nativeElement.textContent).toBe("FOO!!");
  });

  it("displays provided label", async () => {
    const { find } = await shallow.render(`<foo label="My Label"></foo>`);

    expect(find("h1").nativeElement.textContent).toBe("My Label");
  });
});
```

Let's break this down starting with the `shallow` variable:

```typescript
let shallow: Shallow<FooComponent>;
```

This creates a [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) that allows all of our specs access the shallow renderer.

Next, our `beforeEach` fires before each test and sets up a fresh shallow renderer for every test. This means every script gets a clean renderer with fresh mocks.

```typescript
beforeEach(() => {
  shallow = new Shallow(FooComponent, FooModule);
});
```

Notice, we pass two items into the `Shallow` constructor, first, the component we wish to test, in this case the `FooComponent`. Next, we pass in the module that our test component lives in (the `NgModule` we `declare` our component to be a part of). We pass in the module because our Angular module should provide all the dependencies our component needs to render itself including providers, pipes, directives and other components that our component may need. `Shallow` will mock any child providers and components so they stay out of our way while testing the `FooComponent`.

Now let's look at one of the tests, take note of a few things:

```typescript
it("displays provided label", async () => {
  const { find } = await shallow.render(`<foo label="My Label"></foo>`);

  expect(find("h1").nativeElement.textContent).toBe("My Label");
});
```

We use [`async`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) functions.

```typescript
async () => {
```

When we render with `Shallow`, part of the process involves compiling templates with `TestBed`. This is an asynchronous process, so we use the `async` keyword to allow us to use the easier-to-read syntax when dealing with promises.

Then we render our component:

```typescript
const { find } = await shallow.render(`<foo label="My Label"></foo>`);
```

When we render with `Shallow`, we use the **exact same template HTML style** that we would use when we write Angular HTML. You can even [bind variables and events](https://github.com/getsaf/shallow-render/blob/master/lib/examples/component-with-bindings.spec.ts) if you want. Notice we're setting the `label` input to `My Label` in the test.

If the `const {find}` looks weird, it's another bit of ES6 syntactic sugar called [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment). It's not necessary to destructure, but I like it so you can do it with `Shallow`.

Once we're done rendering, we make our assertion:

```typescript
expect(find("h1").nativeElement.textContent).toBe("My Label");
```

This is a pretty standard expectation, just make sure that our `FooComponent` accepted and rendered our label value properly.

That's it! There are lots of [examples](https://github.com/getsaf/shallow-render/blob/master/lib/examples) for all kinds of scenarios.

# Pro Tips

## Optional Templates

You aren't _required_ to use template HTML to render your components if you don't want to!

For example, the sample above:

```typescript
const { find } = await shallow.render(`<foo label="My Label"></foo>`);
```

could be simplified as:

```typescript
const { find } = await shallow.render({ bind: { label: "My Label" } });
```

In this case, `Shallow` will force the `bind` properties to match the names and types of the inputs for your component. If you want to use HTML templates, that's cool too. This is just a type-safe alternative.

## RecursivePartial mocks

Shallow allows you to provide partials of many arguments. For example:

```typescript
type Car = {
  year: number;
  vin: string;
  engine: {
    cylinders: number;
    displacement: number;
  };
};
```

When testing a component that accepts a `Car` type, you're not required to send in **all** the properties of a car all-the-way down. You can supply only what your component needs for your test.

```typescript
class CarComponent {
  @Input() car: Car;
}
// can be rendered with just the stuff you want to provide in your test
shallow.render({ bind: { car: { year: 2000, engine: { cylinders: 6 } } } });
```

This type is exported so you may also use it in other ways in your test:

```typescript
describe("CarComponent", () => {
  let testCar: RecursivePartial<Car>;
  beforeEach(() => {
    testCar = { year: 2000, engine: { cylinders: 6 } };
  });

  it("displays the year", async () => {
    const { find } = await shallow.render({ bind: { car: testCar } });

    expect(find("h1").nativeElement.textContent).toContain("2000");
  });
});
```

# Mocking

When writing a spec, you generally want to isolate the component as much as possible and stub/mock out everything else. This lets you really hone in on just the component and reduce the noise of things the component depends on. Mocking in Angular can be tricky, you want to mock things in the most type-safe manner possible.

Shallow will automatically provide an empty mock for injected providers, components, directives and pipes. If the component calls a method on a provider, you'll need to provide a stub and return the data the component needs to pass the test. All stubs are type-safe and _must_ match the types on the service you're mocking.

<aside class="notice">
  Many of Angular's <code>coreModule</code>, <code>commonModule</code> and forms modules never mocked by shallow because they are dependency free and generally helpful to include the real modules in your tests. See the full list of modules <a href="https://github.com/getsaf/shallow-render/blob/master/lib/shallow.ts#L11-L17">here</a>.
</aside>

Let's say you have a component that depends on a service, that service depends on 4 other services. You don't really care about all 5 services for the test, you are only concerned with the one that gives the component data.

Here's an example of a component that uses a web service to get some data.

```typescript
@Component(...)
class MyComponent {
  chanceOfRain: number
  constructor(rainService: RainService) {
     rainService.getChanceOfRainForToday()
       .then(chance => this.chanceOfRain = chance);
  }
}
```

When testing this component, you really don't care about _how_ the `RainService` does its job, (HTTP, WebSocket, LocalStorage, etc.) you only care about what it gives you back. In this instance it's just a number.

You can mock this service when testing `MyComponent` with a single line in a test

```typescript
it("displays the chance of rain", async () => {
  const { fixture, find } = await shallow
    .mock(RainService, { getChanceOfRain: () => Promise.resolve(94.2) })
    .render();
  await fixture.whenStable(); // Waits for all promises to resolve

  expect(find("label").nativeElement.textContent).toBe(
    "There is a 94.2% chance of rain today"
  );
});
```

If there are multiple services, mocks are chain-able so you they can be stacked:

```typescript
shallow
  .mock(FooService, {
    get: () => Promise.resolve("foo"),
    post: () => Promise.reject("Fail!")
  })
  .mock(BarService, { doBar: () => Promise.resolve(true) });
```

`InjectionToken`s work the same way. Stubs are double-checked against the token's interface to make sure you're using the correct types.

If all the specs need the same mock, you can do this in the `beforeEach` block so you only need to do it once. The individual specs may override the initial mocks if they need to.

```typescript
let shallow: Shallow<MyComponent>;
beforeEach(() => {
  shallow = new Shallow(MyComponent, MyModule)
    .mock(FooService, {getFoo: () => 'mocked foo get'})
    .mock(BarService, {getBar: () => 'mocked bar get'});
})

it('displays the foo response', async () => {
  const {find} = await shallow.render();

  expect(find('label').nativeComponent).innerText)
    .toContain('mocked foo get');
});

it('can override previously defined mocks', async () => {
  const {find} = await shallow
    // Re-mock the same service just for this one spec!!
    .mock(FooService, {getFoo: () => 'custom foo'})
    .render()

  expect(find('label').nativeComponent).innerText)
    .toContain('custom foo');
});
```

## Mocking component instance properties

When a component is written using the template-hash pattern, we sometimes need to mock methods on these components when we use them. For example:

in `MyComponent` we may render something like this:

```html
<list-container #container>
  <list-item (click)="container.collapse()">Collapse the parent!</list-item>
</list-container>
```

Shallow will provide us a mock of `list-container` and `list-item`, but if we want to write a test that ensures we hooked up the `click` handler correctly, we'll have to call the `collapse` method on the `list-container` component so we'll need to mock that method out. Shallow will apply mock properties to component instances in the same manner as we mock services or other injectables.

```typescript
const { find } = await shallow
  .mock(ListContainerComponent, { collapse: () => undefnied })
  .render();
find("list-item").triggerEventHandler("click", {});
expect(findComponent(ListContainerComponent).collapse).toHaveBeenCalled();
```

## Skip mocking with `dontMock`

Have a service/injection token/component/directive/pipe, etc. that you don't want to be mocked? Use `dontMock` to bypass automatic mocking.

```typescript
shallow.dontMock(FooService, FooComponent);
```

Configures `Shallow` to use the _real_ `FooService` and `FooComponent` in the spec.

## Skip mocking globally with `neverMock`

Some components/directives/pipes you may want to always use the real thing. You may choose to "never mock" in the global test setup for all specs.

_in the global test setup_

```javascript
Shallow.neverMock(FooService, FooPipe);
```

Configures `Shallow` to always use the _real_ `FooService` and `FooPipe` in all specs.

## Use a manual mock instance or class

Sometimes, you may want to use a custom mock class or factory for your tests. This can be done in a few ways.

### With a single-line `provideMock`

This automatically issues a `provide` and `dontMock` in a simple short-hand:

```typescript
shallow.provideMock({ provide: MyService, useClass: MyMockService });
```

### Combining `provide` and `dontMock`

This tells Shallow, to provide this mock service-class but don't run it though Shallow's auto-mocking.

```typescript
shallow
  .provide({ provide: MyService, useClass: MyMockService })
  .dontMock(MyService);
```

## Global mocks with `alwaysMock`

Sometimes you will have things that you're constantly re-mocking for a spec. You can setup global mocks for these things by using `alwaysMock` in the global test setup and shallow will always provide the mock in modules that use the provider you specified. Note that doing `alwaysMock` is _NOT_ a mock-once-for-all-specs solution. Use this feature sparingly, remember specs should generally be self-contained as far as mock data goes. Using `alwaysMock` is just as bad as using global variables. TL;DR; Use sparingly or not-at-all.

_in global test setup_

```javascript
Shallow.alwaysMock(FooService, {
  getFoo: () => "foo get",
  postFoo: () => "foo post"
});
```

## Global providers with `alwaysProvide`

There are some use cases when an Angular app provides something (usually a configuration) at the top-level of the application. These instances should follow the [`forRoot`](https://angular.io/guide/singleton-services) pattern. For these cases, you may want specs to have a similar environment setup where the 'root' providers are globally provided to all specs. This can be accomplished by using `Shallow.alwaysProvide`.

_in global test setup_

```javascript
Shallow.alwaysProvide(MyGlobalService);
```

Now, all specs will receive a _REAL_ `MyGlobalService` when requested for injection.

If you use the [`forRoot`](https://angular.io/guide/singleton-services) pattern, you may provide root providers like so:

```javascript
Shallow.alwaysProvide(MyCoreModule.forRoot().providers);
```

You may also provide a mocked version by chaining `alwaysProvide` with `alwaysMock`:

```javascript
Shallow.alwaysProvide(MyGlobalService).alwaysMock(MyGlobalService, {
  getSomeValue: () => "Globally mocked value"
});
```

Now, all specs will receive a _MOCKED_ `MyGlobalService` when requested for injection.

## Mocking Pipes with `mockPipe`

Angular pipes are a little special. They are used to transform data in your templates. By default, Shallow will mock all pipes to have no output. Your specs may want to provide mocks for these transforms to allow validation that a pipe received the correct input data.

```typescript
shallow.mockPipe(MyPipe, input => `MyPipe: ${input}`);
```

Configures `Shallow` to have the `MyPipe` always perform the following action on input data. This lets you inspect your templates and controls for your Pipe's side-effects.

## Replace a module with a test module

Angular has a pattern in which they provide full-module replacements specifically designed for testing (see: [HttpClientTestingModule](https://angular.io/api/common/http/testing/HttpClientTestingModule)). These testing modules can be used in `Shallow` tests by replacing the original module with the test module.

```typescript
shallow.replaceModule(HttpClientModule, HttpClientTestingModule);
```

This can also be done globally, you can use `alwaysReplaceModule` in your global test setup.

```typescript
Shallow.alwaysReplaceModule(HttpClientModule, HttpClientTestingModule);
```

## Static Function Mocks

```typescript
class MyClass {
  static reverse(thing: string) {
    return thing.split("").reverse();
  }
}
```

can be mocked with:

```typescript
shallow.mockStatic(MyClass, { reverse: () => "mock reverse" });
```

Regular objects can be mocked in this manner too:

```typescript
const FOO = {
  bar: () => "bar"
};
```

Can be mocked with:

```typescript
shallow.mockStatic(FOO, { bar: () => "mocked bar" });
```

Due to Jasmine spy limitations, **only methods are supported**. If you try to mock a non-method property, an error is thrown. When we begin supporting other test frameworks this limitation may go away (or only exist when using Jasmine).

```typescript
class MyClass {
  static foo = "FOO";
}
```

If you try to mock non-method property `MyClass.foo` will throw an error:

```typescript
shallow.mockStatic(MyClass, { foo: "MOCK FOO" }); // throws: InvalidStaticPropertyMockError
```

# Querying

## `find`

```typescript
find(CSSSelector | Type<Directive> | Type<Component>) => QueryMatch<DebugElement>
```

Accepts a CSS selector, Component class or Directive class and returns all the resulting `DebugElements` wrapped in a [`QueryMatch`](#querymatch-class) object.

### Example

```typescript
@Component({
  selector: "my-component",
  template: `
    <h1 *ngIf="big" class="large">{{ label }}</h1>
    <label *ngIf="!big">{{ label }}</label>
  `
})
class MyComponent {
  @Input() label: string;
  @Input() big = false;
}
```

```typescript
it("renders an H1 when big is true", async () => {
  const { find } = await shallow.render(
    '<my-component label="foo" [big]="true"></my-component'
  );
  const result = find("h1.large"); // result is a single H1 DebugElement

  expect(result.componentInstance.label).toBe("foo");
  expect(find("label")).toHaveFound(0);
});
```

You may also pass in the Component class of the thing you are querying for:

```typescript
find(MyComponent); // Returns DebugElements for all occurrences of MyComponent
```

## `findComponent`

```typescript
findComponent(Type<Component>) => QueryMatch<TComponent>
```

`findComponent` differs from `find` in that it will return the _instances_ of the component, not the `DebugElement` returned by `find`. The returned instance(s) are wrapped in a [`QueryMatch`](#querymatch-class) object.

### Example

```typescript
class Person {
  constructor(public name: string) {}
}

@Component({
  selector: "person",
  template: "<li>{{person.name}}</li>"
})
class PersonComponent {
  @Input() person: Person;
}

@Component({
  selector: "people",
  template: `
    <person *ngFor="let p of people" [person]="p"></person>
  `
})
class PeopleComponent {
  @Input() people: Person[];
}
```

```typescript
it('renders one item per person', async () => {
  const {findComponent} = await shallow.render(
    '<people [people]="testPeople"></people>',
    {bind: {testPeople: [new Person('Foo'), new Person('Bar')}}
  );
  const results = findComponent(PersonComponent); // results is an array of PersonComponent

  expect(results).toHaveFound(2);
  expect(results.map(p => p.name)).toEqual('Foo', 'Bar');
});
```

## `findDirective`

```typescript
findDirective(Type<Directive>) => QueryMatch<TDirective>
```

`findDirective` is similar to `findComponent` except it returns directive instances wrapped in a [`QueryMatch`](#querymatch-class) object.

### Example

```typescript
@Directive({selector: 'size'})
class SizeDirective {
  @Input() size: 'sm' | 'md' | 'lg';
  ...
}

@Component({
  selector: 'my-component',
  template: '<div size="lg"/>'
})
class MyComponent {}
```

```typescript
it("is large", async () => {
  const { findDirective } = await shallow.render();
  const result = findDirective(SizeDirective); // result is an instance of SizeDirective

  expect(result.size).is("lg");
});
```

## `findStructuralDirective`

See [Structural Directives](#querying-structural-directives)

## `QueryMatch` Class

All shallow-render queries return a `QueryMatch` object. When a query returns a single item, you may just use the result as a that item. However, if your query yielded multiple items, the result acts like an array and can be used in a `forEach`, `map`, etc just like any other array.

This lets us use the same object semantically in our tests.

### Single Result

If you expect a single item in your response just use it like a single item:

> html

```html
<foo class="bold">Bold Foo!</foo>
```

> test

```typescript
const match = find("foo.bold");
expect(match.nativeElement.innerText).toBe("Bold Foo!");
```

### Multiple Results

If you expect multiple items, use `Array` methods on the matches:

> html

```html
<foo>One</foo>
<foo>Two</foo>
<foo>Three</foo>
```

> test

```typescript
const matches = find("foo");
expect(matches.map(match => match.nativeElement.innerText)).toEqual([
  "One",
  "Two",
  "Three"
]);
```

<aside class="warning">
  If your query finds multiple items, and you try to use the results as if it were a single item, <b>Shallow will throw an error</b> letting you know multiple items were found when you expected only one. This extra check makes your tests more reliable and more readable.
</aside>

# Structural Directives

Structural directive mocks are not rendered by default. You may configure this setting globally or per-test.

## Global Configuration

### Enable ALL structural directives to be rendered globally

```typescript
Shallow.alwaysRenderStructuralDirectives();
```

### Enable _certain_ structural directives to be rendered globally

```typescript
Shallow.withStructuralDirective(FooDirective).withStructuralDirective(
  BarDirective
);
```

### Enable ALL structural directives except certain ones globally

```typescript
Shallow.alwaysRenderStructuralDirectives().withStructuralDirective(
  FooDirective,
  false
);
```

## Per-test Configuration

You may also address this per-test. There are two ways to handle structural directives in a test:

### During the shallow configuration (before the render)

You may instruct shallow to always render a particular directive with `withStructuralDirective`.

> This will render _ALL_ instances of the directive.

```typescript
it("can render structural directives", async () => {
  const { find } = await shallow.withStructuralDirective(FooDirective).render();

  expect(find(".myThing")).toHaveFoundOne();
});
```

### After the render (fine grained control)

Here, we render all of the `FooDirective` instances:

```typescript
it("can render structural directives", async () => {
  const { renderStructuralDirective, find } = await shallow.render();
  renderStructuralDirective(FooDirective);

  expect(find(".myThing")).toHaveFoundOne();
});
```

If you have multiple instances, and you wish to render just one of them, you may query for a specific one and render it directly:

```typescript
it("can render structural directives", async () => {
  const {
    findStructuralDirective,
    renderStructuralDirective,
    find
  } = await shallow.render();

  // Find one that has a particular input property assigned to 'first-foo'
  const firstFoo = findStructuralDirective(
    FooDirective,
    d => d.inputOnDirective === "first-foo"
  );
  renderStructuralDirective(firstFoo);

  // Or, just render the n-th one
  const fooDirecives = findStructuralDirective(FooDirective);
  renderStructuralDirective(fooDirectives[0]);

  expect(find(".myThing")).toHaveFoundOne();
});
```

## Querying Structural Directives

Structural directives that are not rendered will NOT be available in the DOM. You can still query for them using shallow-render:

```typescript
it("can find structural directives", async () => {
  const { findStructuralDirective } = await shallow.render();

  expect(findStructuralDirective(FooDirective)).toHaveFoundOne();
});
```

If you are dealing with multiple instances of the same directive, your search may yield multiple results. You can narrow them down with a predicate as the second argument to `findStructuralDirective`:

Say, your template looks like this:

```html
<div>
  <label *whenEven="age" class="age">
    Age is an even value {{age}}
  </label>
  <label *whenEven="streetNumber" class="street">
    Street number is an even value {{street}}
  </label>
</div>
```

Let's test only the age label

```typescript
it("can find structural directives", async () => {
  const {
    find,
    findStructuralDirective,
    renderStructuralDirective
  } = await shallow.render({ bind: { age: 37, streetNumber: 50 } });
  const ageDirective = findStructuralDirective(
    WhenEvenDirective,
    d => d.whenEven === 37
  );
  renderStructuralDirective(ageDirective);

  expect(find(".age")).toHaveFoundOne();
  expect(find(".street")).not.toHaveFoundOne();
});
```

<aside class="notice">
  This is a totally contrived example, in reality, the <code>WhenEvenDirective</code> is pure and we can likely just use the actual directive with <code>shallow.dontMock(WhenEvenDirective)</code>.
</aside>

# Custom Matchers

To help with test readability, `Shallow` comes pre-packaged with some custom matchers for Jasmine and Jest.

`toHaveFound(count: number)` - Expect a query to have found an exact number of items.

```typescript
expect(find("h1")).toHaveFound(3);
```

`toHaveFoundOne()` - Expect a query to have found exactly one items.

```typescript
expect(find("h1")).toHaveFoundOne();
```

`toHaveFoundMoreThan(count: number)` - Expect a query to have found more than x items.

```typescript
expect(find("h1")).toHaveFoundMoreThan(0); // 1 or more
```

`toHaveFoundLessThan(count: number)` - Expect a query to have found fewer than x items.

```typescript
expect(find("h1")).toHaveFoundLessThan(3); // 2 or fewer
```

# Configuration

## Global Configuration

In your karma test init, you may setup mocks, providers, etc. globally. These settings will automatically apply to _all_ shallow-render tests. Any mocks you provide directly in your spec will override the global mocks so you still have total control over your mocks.

```typescript
Shallow.alwaysMock(WeatherService, {
  willItRain: async () => true
}).alwaysReplaceModule(HttpClientModule, HttpClientTestingModule);
```

## Per-spec Configuration

Most of the time, you will configure shallow specs via your `beforeEach` block. These settings will only apply to the tests in your `describe` block. Any mocks you provide directly in your spec will override the mocks from your `beforeEach` setup so you still have total control.

# `Shallow` class

## Static Properties

Shallow has some global configuration options. These can be applied in your top-level test setup (the same place where TestBed is initialized).

| Property                                         | Description                            |
| ------------------------------------------------ | -------------------------------------- |
| alwaysMock(provider, stubs)                      | Mocks a provider for all tests         |
| neverMock(provider/component/directive/pipe)     | Prevents mocking a thing for all tests |
| alwaysProvide(provider)                          | Provides an `Injectable` for all tests |
| alwaysReplaceModule(ngModule, replacementModule) | Replaces a module in all tests         |
| alwaysImport(ngModule)                           | Imports a module in all tests          |

## Instance Properties

Setup mocks and other options for your test. Usually used in your `beforeEach` or directly in your test.

| Property                                   | Description                                                              | Returns                             |
| ------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------- |
| render(template?, options?)                | Renders your `TestComponent`                                             | `Promise<Rendering<TestComponent>>` |
| mock(provider, stubs)                      | Sets up mock properties/functions for providers to your test component   | self (chainable)                    |
| mockPipe(pipe, transformStub)              | Mocks a pipe transform to a custom function                              | self (chainable)                    |
| dontMock(...provider/component/pipe)       | Prevents a provider from being mocked (uses the real thing in your test) | self (chainable)                    |
| provide(...providers)                      | Adds a provider to your test module (this provider is not mocked)        | self (chainable)                    |
| provideMock(...providers)                  | Adds an empty mock for a provider to your test module                    | self (chainable)                    |
| replaceModule(ngModule, replacementModule) | Replaces an imported module with a replacement                           | self (chainable)                    |
| import(...ngModules)                       | Imports an additional module into your test module                       | self (chainable)                    |
| declare(...components)                     | Adds components to the test module's declarations and entryComponents    | self (chainable)                    |

# Frequently Asked Questions

The most complete list of issues/resolutions for popular frameworks will be in the [issues](https://github.com/getsaf/shallow-render/issues) list for the project, but this is a list of especially popular difficulties.

## Routing

Angular supplies the [`RouterTestingModule`](https://angular.io/api/router/testing/RouterTestingModule) as a drop-in replacement for the actual `RouterModule`. To use this in your tests, you can simply "replace" the `RouterModule` with the `RouterTestingModule` in your global test setup:

```typescript
Shallow.alwaysReplaceModule(
  RouterModule,
  RouterTestingModule.withRoutes({
    path: "**",
    component: class DummyComponent {}
  })
);
```

<aside class="notice">
 See <a href="https://github.com/getsaf/shallow-render/blob/master/lib/examples/component-with-routing.spec.ts">this example test</a> for the full usage.
</aside>

## Entry Components

When rendering "normal" components, Angular looks for "selectors" in the template and searches in the module-tree for a component that matches the selector. In testing, we have total control over the module so we can swap out dummy components to match up with selectors and our tests are happy.

EntryComponents bypass this and are referenced directly by their class object instead of being plucked out of the module by their selectors. This can make components that render EntryComponents hard to test.

Here's what I mean:

```typescript
@Injectable()
class ComponentService {
  getDynamicComponent() {
    return Math.random() === 1 ? FooComponent : BarComponent;
  }
}
```

```typescript
@Component({
  selector: "foo",
  template:
    '<ng-container *ngComponentOutlet="componentService.getDynamicComponent()" />'
})
class MyComponent {
  constructor(public componentService: ComponentService) {}
}
```

If we want to test `MyComponent`, we have two options:

1. Use the _real_ `ComponentService` and render the _real_ `FooComponent` or `BarComponent`. This is typically undesirable because Foo or Bar components could be complex which would require the tests for `MyComponent` to provide setup/mocks/etc to satisfy Foo and Bar components requirements.
2. Mock the `ComponentService` and provide _dummy_ entry components. 😎

Here's an example of option 2:

```typescript
describe("option 2", () => {
  let shallow: Shallow<MyComponent>;
  @Component({ selector: "dummy", template: "<i></i>" })
  class DummyComponent {}

  beforeEach(() => {
    shallow = new Shallow(MyComponent, MyModule)
      .declare(DummyComponent)
      // We cannot mock the DummyComponent because the getDynamicComponent method below
      // will return the *REAL* component so the *actual* DummyComponent must exist in our test setup!
      .dontMock(DummyComponent)
      .mock(ComponentService, { getDynamicComponent: () => DummyComponent });
  });

  it("renders the component from the ComponentSevice", async () => {
    const { find } = await shallow.render();

    expect(find(DummyComponent)).toHaveFoundOne();
  });
});
```

This means that if we want to test an EntryComponent that is provided by an external service, we will be required to mock the service that provides the component **and** we will have to declare a suitable dummy component to render.

## Bindings on EntryComponents

EntryComponents are not rendered with an HTML Template string like a normal component. Therefore, you cannot have `@Input` properties on an EntryComponent and bind to them with shallow-render. If you need to manipulate properties on an EntryComponent in your test, you may access the `instance` directly or better-yet, refactor your component to have the values you need passed in with injection to avoid direct interaction with the `instance`.

```typescript
it("does something funky if funk is set to true", async () => {
  const { instance, fixture, find } = await shallow.render();
  instance.funk = true;
  fixture.detectChanges();

  expect(find(".funkiness")).toHaveFound(1);
});
```

```typescript
it("does something funky if the FunkService is funky", async () => {
  const { instance, fixture, find } = await shallow
    .mock(FunkService, { isFunky: true })
    .render();

  expect(find(".funkiness")).toHaveFound(1);
});
```

# Examples

Check out the [examples](https://github.com/getsaf/shallow-render/tree/master/lib/examples) folder for more specific use cases.

Many of these examples live in the [StackBlitz project](https://stackblitz.com/edit/shallow-render?file=examples%2Findex.ts), so you can try it in real-time.
