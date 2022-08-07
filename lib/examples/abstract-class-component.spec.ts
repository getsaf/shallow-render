import { Component, Input, NgModule } from "@angular/core";
import { Shallow } from "../shallow";

export abstract class BaseClass {
  @Input() public enabled = false;
}

@Component({
  'selector': 'my-component'
})
class MyComponent extends BaseClass {
  //code here
}

@NgModule({
  declarations: [MyComponent]
})
class MyModule { }


describe('abstract class component', () => {
  let shallow: Shallow<MyComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, MyModule);
  })

  it('binds to abstract class properties', async () => {
    const { instance } = await shallow.render({ bind: { enabled: true } });
    expect(instance.enabled).toBe(true);
  })

});