import { AfterContentInit, Component, ContentChild, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'list-item',
  template: '<li [class.bold]="active"><ng-content></ng-content></li>',
})
class ListItemComponent {
  protected active = false;
  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
}

@Component({
  selector: 'list-container',
  template: '<ul><ng-content></ng-content></ul>',
})
class ListContainerComponent implements AfterContentInit {
  @ContentChild(ListItemComponent, { static: false }) listItem!: ListItemComponent;
  ngAfterContentInit() {
    if (this.listItem) {
      this.listItem.activate();
    }
  }
}

@NgModule({
  declarations: [ListContainerComponent, ListItemComponent],
})
class ListModule {}
//////////////////////////

describe('template content child', () => {
  let shallow: Shallow<ListContainerComponent>;

  beforeEach(() => {
    shallow = new Shallow(ListContainerComponent, ListModule);
  });

  it('activates the first item in the list', async () => {
    const { findComponent } = await shallow.mock(ListItemComponent, { activate: () => undefined }).render(`
        <list-container>
          <list-item>Foo</list-item>
          <list-item>Bar</list-item>
        </list-container>
      `);

    const listItems = findComponent(ListItemComponent);
    expect(listItems[0].activate).toHaveBeenCalled();
    expect(listItems[1].activate).not.toHaveBeenCalled();
  });
});
