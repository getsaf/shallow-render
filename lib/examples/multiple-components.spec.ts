import { Component, Input, NgModule, Output, EventEmitter } from '@angular/core';
import { Shallow } from '../shallow';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

////// Module Setup //////
@Component({
  selector: 'list-container',
  template: '<ul><ng-content></ng-content></ul>'
})
class ListContainerComponent {}

@Component({
  selector: 'list-item',
  template: '<li [class.bold]="bold" (click)="select.emit(true)"><ng-content></ng-content></li>'
})
class ListItemComponent {
  @Input() bold = false;
  @Output() select = new EventEmitter<boolean>();
}

@Component({
  selector: 'awesome-list',
  template: `
    <div id="chuck-report">Selected Chuck: {{ selected }}</div>
    <list-container>
      <list-item class="top-item" *ngIf="topItem !== undefined" [bold]="boldTopItem">{{ topItem }}</list-item>
      <list-item id="chuck" [bold]="true" (select)="chuckSelected($event)">Chuck Norris</list-item>
      <list-item>Tom Hanks</list-item>
    </list-container>
  `
})
class AwesomeListComponent {
  @Input() topItem!: string;
  @Input() boldTopItem = false;
  selected = false;
  chuckSelected(selected: boolean) {
    this.selected = selected;
  }
}

@NgModule({
  declarations: [ListContainerComponent, ListItemComponent, AwesomeListComponent]
})
class ListModule {}
//////////////////////////

describe('multiple components', () => {
  let shallow: Shallow<AwesomeListComponent>;

  beforeEach(() => {
    shallow = new Shallow(AwesomeListComponent, ListModule);
  });

  it('renders Chuck and Tom', async () => {
    const { find } = await shallow.render('<awesome-list></awesome-list>');

    // Note we query by the component here
    expect(find(ListItemComponent).map(li => li.nativeElement.innerText.trim())).toEqual(['Chuck Norris', 'Tom Hanks']);
  });

  it('reports when Chuck is pressed', async () => {
    const { find, findComponent, fixture } = await shallow
      .mock(ListItemComponent, {})
      .render('<awesome-list></awesome-list>');
    findComponent(ListItemComponent, { query: '#chuck' }).select.emit(true);
    fixture.detectChanges();

    expect(find('#chuck-report').nativeElement.innerText).toBe('Selected Chuck: true');
  });

  it('renders a top-item when provided', async () => {
    const { find } = await shallow.render('<awesome-list topItem="Brandon"></awesome-list>');

    expect(find('.top-item').nativeElement.innerText.trim()).toBe('Brandon');
  });

  it('renders the top-item as bold', async () => {
    const { find } = await shallow.render(`
      <awesome-list [boldTopItem]="true" topItem="Bolded"></awesome-list>
    `);

    expect(find('.top-item').componentInstance.bold).toBe(true);
  });

  it('does not add a top-item when not provided', async () => {
    const { find } = await shallow.render('<awesome-list></awesome-list>');

    const li = find('list-item');
    expect(li).toHaveFound(2);
    expect(find('.top-item')).toHaveFound(0);
  });
});
