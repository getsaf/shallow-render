import { Component, EventEmitter, Input, NgModule, OnChanges, Output } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
interface Person {
  firstName: string;
  lastName: string;
  birthDate: Date;
}

@Component({
  selector: 'born-in',
  template: `
    <label id="personLabel" (click)="selected.emit(person)">
      {{ person.firstName }} {{ person.lastName }} was born in {{ person.birthDate.getFullYear() }}
    </label>
    <label id="ngOnChangesCount">{{ ngOnChangesCount }}</label>
  `,
})
class BornInComponent implements OnChanges {
  @Input({ required: true }) person!: Person;
  @Output() selected = new EventEmitter<Person>();

  public ngOnChangesCount = 0;

  ngOnChanges() {
    this.ngOnChangesCount += 1;
  }
}

@NgModule({
  declarations: [BornInComponent],
})
class PersonModule {}
//////////////////////////

describe('component with bindings', () => {
  let shallow: Shallow<BornInComponent>;

  beforeEach(() => {
    shallow = new Shallow(BornInComponent, PersonModule);
  });

  const person: Person = {
    firstName: 'Brandon',
    lastName: 'Domingue',
    birthDate: new Date('1982-05-11'),
  };

  it('displays the name and year the person was born', async () => {
    const { find } = await shallow.render({ bind: { person } });

    expect(find('#personLabel').nativeElement.textContent).toContain('Brandon Domingue was born in 1982');
  });

  it('emits the person when clicked', async () => {
    const { find, outputs } = await shallow.render({ bind: { person } });
    find('#personLabel').nativeElement.click();

    expect(outputs.selected.emit).toHaveBeenCalledWith(person);
  });

  it('displays the number of times the person was updated', async () => {
    const { find, fixture, bindings } = await shallow.render({ bind: { person } });

    expect(find('#ngOnChangesCount').nativeElement.textContent).toBe('1');

    bindings.person = { firstName: 'Isaac', lastName: 'Datlof', birthDate: new Date('1983-08-24') };
    fixture.detectChanges();

    expect(find('#ngOnChangesCount').nativeElement.textContent).toBe('2');
  });
});
