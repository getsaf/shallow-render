import { Component, Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  template: '<h1>Step</h1>',
  selector: 'step',
})
class StepComponent {}

@Injectable()
class StepService {
  getSteps() {
    return [StepComponent];
  }
}

@Component({
  selector: 'step-display',
  template: `
    <div *ngFor="let step of stepService.getSteps()">
      <ng-template *ngComponentOutlet="step"></ng-template>
    </div>
  `,
})
class StepDisplayComponent {
  constructor(public stepService: StepService) {}
}

@NgModule({
  declarations: [StepDisplayComponent, StepComponent],
  providers: [StepService],
  entryComponents: [StepComponent],
})
class StepModule {}
//////////////////////////

describe('component with ngComponentOutlet and entry component', () => {
  let shallow: Shallow<StepDisplayComponent>;
  @Component({ selector: 'dummy-step-one', template: '<i></i>' })
  class DummyStepOne {}

  @Component({ selector: 'dummy-step-two', template: '<i></i>' })
  class DummyStepTwo {}

  beforeEach(() => {
    shallow = new Shallow(StepDisplayComponent, StepModule)
      .declare(DummyStepOne, DummyStepTwo)
      .dontMock(DummyStepOne, DummyStepTwo)
      .mock(StepService, { getSteps: () => [DummyStepOne, DummyStepTwo] });
  });

  it('renders dynamic steps', async () => {
    const { find } = await shallow.render();

    expect(find(DummyStepOne)).toHaveFoundOne();
    expect(find(DummyStepTwo)).toHaveFoundOne();
  });
});
