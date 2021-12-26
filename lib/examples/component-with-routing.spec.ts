import { APP_BASE_HREF, Location } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
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
  constructor(public router: Router) {}

  async goHome() {
    await this.router.navigate(['home']);
  }
}
const routes: Routes = [{ path: 'home', component: class DummyComponent {} }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
  declarations: [GoHomeLinkComponent],
})
class GoHomeModule {}
//////////////////////////

describe('component with routing', () => {
  let shallow: Shallow<GoHomeLinkComponent>;

  beforeEach(() => {
    shallow = new Shallow(GoHomeLinkComponent, GoHomeModule).replaceModule(
      RouterModule,
      RouterTestingModule.withRoutes(routes)
    );
  });

  it('uses the route', async () => {
    const { fixture, find, inject } = await shallow.render();
    const location = inject(Location);
    find('a').triggerEventHandler('click', {});
    await fixture.whenStable();

    expect(location.path()).toBe('/home');
  });
});
