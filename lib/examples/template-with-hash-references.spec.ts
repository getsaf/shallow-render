import { Component, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'list-container',
  template: '<ul><ng-content *ngIf="!collapsed"></ng-content></ul>'
})
class ListContainerComponent {
  protected collapsed = false;

  collapse() {
    this.collapsed = true;
  }
  expand() {
    this.collapsed = false;
  }
}

@Component({
  selector: 'list-item',
  template: '<li [class.bold]="bold"><ng-content></ng-content></li>'
})
class ListItemComponent {
  @Input() bold = false;
}

@Component({
  selector: 'awesome-list',
  template: `
    <list-container #container>
      <list-item (click)="container.collapse()">Chuck Norris</list-item>
    </list-container>
  `
})
class AwesomeListComponent {}

@NgModule({
  declarations: [ListContainerComponent, ListItemComponent, AwesomeListComponent]
})
class ListModule {}
//////////////////////////

describe('template hash references', () => {
  let shallow: Shallow<AwesomeListComponent>;

  beforeEach(() => {
    shallow = new Shallow(AwesomeListComponent, ListModule);
  });

  it('collapses the parent when clicked', async () => {
    const { find, findComponent } = await shallow.mock(ListContainerComponent, { collapse: () => undefined }).render();

    const container = findComponent(ListContainerComponent);
    find(ListItemComponent).triggerEventHandler('click', {});
    expect(container.collapse).toHaveBeenCalled();
  });
});
