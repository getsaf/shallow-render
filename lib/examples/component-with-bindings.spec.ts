import { Component, EventEmitter, input, Input, NgModule, OnChanges, Output } from '@angular/core';
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
    <label id="partnerLabel" (click)="selected.emit(partner())">
      {{ partner().firstName }} {{ partner().lastName }} was born in {{ partner().birthDate.getFullYear() }}
    </label>
    <div id="personAge">
      {{age()}}
    </div>
    <label id="ngOnChangesCount">{{ ngOnChangesCount }}</label>
  `,
})
class BornInComponent implements OnChanges {
  @Input({ required: true }) person!: Person;
  partner = input.required<Person>();
  age = input<string, number>("Age not provided", {
    transform: (value: number) => `${value} years old`
  });
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

  const partner: Person = {
    firstName: 'John',
    lastName: 'Doe',
    birthDate: new Date('1990-01-12'),
  };

  it('displays the name and year the person was born', async () => {
    const { find } = await shallow.render({ bind: { person, partner, age: 17 } });

    expect(find('#personLabel').nativeElement.textContent).toContain('Brandon Domingue was born in 1982');
    expect(find('#partnerLabel').nativeElement.textContent).toContain('John Doe was born in 1990');
    expect(find('#personAge').nativeElement.textContent).toContain('17 years old');
  });

  it('emits the person when clicked', async () => {
    const { find, outputs } = await shallow.render({ bind: { person, partner } });
    find('#personLabel').nativeElement.click();

    expect(outputs.selected.emit).toHaveBeenCalledWith(person);
  });

  it('emits the partner when clicked', async () => {
    const { find, outputs } = await shallow.render({ bind: { person, partner } });
    find('#partnerLabel').nativeElement.click();

    expect(outputs.selected.emit).toHaveBeenCalledWith(partner);
  });

  it('updates the age considering the transform function', async () => {
    const { find, fixture, bindings } = await shallow.render({ bind: { person: person, partner: partner, age: 7 } });

    // way 1: Update using the bindings
    bindings.age = 8;
    fixture.detectChanges();
    expect(find('#personAge').nativeElement.textContent).toContain('8 years old');

    // way 2: Update using `setInput` function, similar as it's done with `ComponentRef.setInput`
    fixture.componentInstance.setInput("age", 9);
    fixture.detectChanges();
    expect(find('#personAge').nativeElement.textContent).toContain('9 years old');
  });

  it('displays the number of times the person was updated', async () => {
    const { find, fixture, bindings } = await shallow.render({ bind: { person, partner } });

    expect(find('#ngOnChangesCount').nativeElement.textContent).toBe('1');

    bindings.person = { firstName: 'Isaac', lastName: 'Datlof', birthDate: new Date('1983-08-24') };
    fixture.detectChanges();

    expect(find('#ngOnChangesCount').nativeElement.textContent).toBe('2');
  });

  it('throws for missing required input signal', async () => {
    await expect(shallow.render({ bind: { person } })).rejects.toThrow(
      'Input is required but no value is available yet.',
    );
  });
});
