import { Component, Directive, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  standalone: false,
  selector: 'heading',
  template: `
    <ng-container *ngIf="withTooltip">
      <h1 tooltip="My tooltip text"><ng-content></ng-content></h1>
    </ng-container>
    <ng-container *ngIf="!withTooltip">
      <h1><ng-content></ng-content></h1>
    </ng-container>
  `,
})
class HeadingComponent {
  @Input() withTooltip = false;
}

@Directive({
  standalone: false,
  selector: '[tooltip]',
})
class TooltipDirective {
  @Input() tooltip: string;

  constructor() {
    throw new Error('THIS SHOULD BE MOCKED');
  }
}

@NgModule({
  declarations: [HeadingComponent, TooltipDirective],
})
class HeadingModule {}
//////////////////////////

describe('component with directive', () => {
  let shallow: Shallow<HeadingComponent>;

  beforeEach(() => {
    shallow = new Shallow(HeadingComponent, HeadingModule);
  });

  it('renders with a tooltip when tooltip = true', async () => {
    const { find } = await shallow.render({ bind: { withTooltip: true } });

    expect(find('h1[tooltip]')).toHaveFoundOne();
  });

  it('renders with tooltip text when tooltip = true', async () => {
    const { findDirective } = await shallow.render({ bind: { withTooltip: true } });
    const tooltipDirective = findDirective(TooltipDirective);

    expect(tooltipDirective && tooltipDirective.tooltip).toBe('My tooltip text');
  });

  it('renders without tooltip by default', async () => {
    const { find } = await shallow.render();
    const tooltip = find('h1[tooltip]');
    const noTooltip = find('h1');

    expect(tooltip).toHaveFound(0);
    expect(noTooltip).toHaveFoundOne();
  });
});
