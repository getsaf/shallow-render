import { Component, ModuleWithProviders, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////

// App configuration is not provided by the FooModule, instead
// we depend on the application root having this injected already.
// We may do this because configuration is dynamic and must be passed
// in from outside of our compiled appliation.

// Your AppModule may look like this:
// @NgModule({
//   imports: [FooModule]
// })
// class AppModule {
//   static forRoot(config: AppConfiguration): ModuleWithProviders {
//     return {
//       ngModule: AppModule,
//       providers: [
//         {provide: AppConfiguration, useValue: config}
//       ]
//     };
//   }
// }

class AppConfiguration {
  title: string;
  // ... other configuration here
}

@Component({
  selector: 'app-title',
  template: `<h1>{{config.title}}</h1>`,
})
class AppTitleComponent {
  constructor(public config: AppConfiguration) {}
}

@NgModule({
  declarations: [AppTitleComponent],
  exports: [AppTitleComponent],
})
class TitleModule { }

// In your Karma test shim:
Shallow
  .alwaysProvide(AppConfiguration);
// You may also alwaysMock the provider with your specific values
// Or you can leave this for your specs to mock
//.alwaysMock(AppConfiguration, {title: 'Always this title'})

//////////////////////////

describe('multi module', () => {
  let shallow: Shallow<AppTitleComponent>;

  beforeEach(() => {
    shallow = new Shallow(AppTitleComponent, TitleModule);
  });

  it('renders the configured title', async () => {
    const {find} = await shallow
      .mock(AppConfiguration, {title: 'Mocked title'})
      .render(`<app-title></app-title>`);

    expect(find('h1').nativeElement.innerText).toContain('Mocked title');
  });
});
