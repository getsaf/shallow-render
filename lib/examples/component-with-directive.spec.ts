import { Input, Component, Directive, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
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
  selector: '[tooltip]',
})
class TooltipDirective {
  @Input() tooltip: string;

  constructor() {
    throw new Error('THIS SHOULD BE MOCKED');
  }
}

@NgModule({
  declarations: [HeadingComponent, TooltipDirective]
})
class HeadingModule {}
//////////////////////////

describe('component with directive', () => {
  const shallow = new Shallow(HeadingComponent, HeadingModule);

  it('renders with a tooltip when tooltip = true', async () => {
    const {find} = await shallow.render('<heading [withTooltip]="true"></heading>');

    expect(find('h1[tooltip]').length).toBe(1);
  });

  it('renders with tooltip text when tooltip = true', async () => {
    const {findDirective} = await shallow.render('<heading [withTooltip]="true"></heading>');

    // TODO: For some reason, this directive query won't return a match?
    const tooltipDirective = findDirective(TooltipDirective);

    expect(tooltipDirective && tooltipDirective.tooltip).toBe('My tooltip text');
  });

  it('renders without tooltip by default', async () => {
    const {find} = await shallow.render('<heading></heading>');
    const tooltip = find('h1[tooltip]');
    const noTooltip = find('h1');

    expect(tooltip.length).toBe(0);
    expect(noTooltip.length).toBe(1);
  });
});
