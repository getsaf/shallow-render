import { APP_BASE_HREF, Location } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Shallow } from '../shallow';

//////////////////////////////////////////////////////////////
// See Angular docs here:
// https://angular.io/api/router/testing/RouterTestingModule
//////////////////////////////////////////////////////////////

////// Module Setup //////
@Component({
  selector: 'go-home-link',
  template: '<a (click)="goHome()">Go somewhere</a>',
})
class GoHomeLinkComponent {
  labelText: string;

  constructor(public router: Router) {}

  goHome() {
    this.router.navigate(['home']);
  }
}
const routes: Routes = [
  {path: 'home', component: class DummyComponent {}}
];

// You probabaly want to export this ref from your module
// so we can give Shallow specs access to it too.
const routerModuleRef = RouterModule.forRoot(routes);
@NgModule({
  imports: [routerModuleRef],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}],
  declarations: [GoHomeLinkComponent],
})
class GoHomeModule {}
//////////////////////////

describe('component with routing', () => {
  let shallow: Shallow<GoHomeLinkComponent>;

  beforeEach(() => {
    shallow = new Shallow(GoHomeLinkComponent, GoHomeModule)
      //////////////////////////
      // These are good candidates for global setup
      // using `neverMock` and `alwaysProvide`
      .dontMock(routerModuleRef)
      .provide({provide: APP_BASE_HREF, useValue: '/'})
      .dontMock(APP_BASE_HREF)
      ///////////////////////////
      .replaceModule(
        routerModuleRef,
        RouterTestingModule.withRoutes(routes)
      );
  });

  it('uses the route', async () => {
    const {fixture, find, get} = await shallow.render();
    const location = get(Location);
    find('a').triggerEventHandler('click', {});
    await fixture.whenStable();

    expect(location.path()).toBe('/home');
  });
});
