import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // tslint:disable-line no-implicit-dependencies
import { Shallow } from '../shallow';

////// Module Setup //////

@Component({
  selector: 'custom-form',
  template: `
      <input id="customInput" [formControl]="myControl">
  `,
})
class CustomFormComponent implements OnInit, OnDestroy {
  myControl = new FormControl('I am complete');
  subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
        this.myControl.valueChanges.subscribe(change => this.inputHandler(change))
    );
  }

  inputHandler(text: string) {
  //  implementation
    return 2 + 2;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [CustomFormComponent]
})
class CustomInputModule {}
//////////////////////////

describe('component with reactive input', () => {
  let shallow: Shallow<CustomFormComponent>;

  beforeEach(() => {
    shallow = new Shallow(CustomFormComponent, CustomInputModule);
  });

  it('displays an input with default value', async () => {
    const {find} = await shallow.render();

    expect(find('#customInput').nativeElement.value)
      .toBe('I am complete');
  });

  it('destroy cancel subscriptions', async () => {
    const {instance} = await shallow.render();
    spyOn(instance.subscription, 'unsubscribe');

    instance.ngOnDestroy();

    expect(instance.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('input change calls inputHandler', async () => {
    const {find, instance} = await shallow.dontMock(ReactiveFormsModule).render();
    spyOn(instance, 'inputHandler');

    const input = find('#customInput');
    input.nativeElement.value = 'It works!';
    input.triggerEventHandler('input', {target: input.nativeElement});

    expect(instance.inputHandler).toHaveBeenCalledWith('It works!');
  });

});
