import { Input, Output, EventEmitter, Component, NgModule } from '@angular/core';
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
    <label (click)="handleClick()">{{person.firstName}} {{person.lastName}} was born in {{person.birthDate.getFullYear()}}</label>
  `,
})
class BornInComponent {
  @Input() person: Person;
  @Output() select = new EventEmitter<Person>();

  handleClick() {
    this.select.emit(this.person);
  }
}

@NgModule({
  declarations: [BornInComponent]
})
class PersonModule {}
//////////////////////////

describe('component with bindings', () => {
  const shallow = new Shallow(BornInComponent, PersonModule);
  const testPerson: Person = {
    firstName: 'Brandon',
    lastName: 'Domingue',
    birthDate: new Date('1982-05-11')
  };

  it('displays the name and year the person was born', async () => {
    const {element} = await shallow.render(
      '<born-in [person]="testPerson"></born-in>',
      {bind: {testPerson}}
    );

    expect(element.nativeElement.innerText)
      .toBe('Brandon Domingue was born in 1982');
  });

  it('emits the person when clicked', async () => {
    const {find, bindings} = await shallow.render(
      '<born-in [person]="testPerson" (select)="handleSelect($event)"></born-in>',
      {bind: {testPerson, handleSelect: () => undefined}}
    );
    find('label').triggerEventHandler('click', {});

    expect(bindings.handleSelect).toHaveBeenCalledWith(testPerson);
  });
});

