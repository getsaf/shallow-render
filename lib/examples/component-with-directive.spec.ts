import { Input, Component, Directive, NgModule } from '@angular/core';
import { Shallow } from '../shallow';
import { MockDirective } from 'mock-directive';

////// Module Setup //////
@Component({
  selector: 'heading',
  template: `
    <ng-container *ngIf="fancy">
      <h1 magic="abracadabra"><ng-content></ng-content></h1>
    </ng-container>
    <ng-container *ngIf="!fancy">
      <h1><ng-content></ng-content></h1>
    </ng-container>
  `,
})
class HeadingComponent {
  @Input() fancy = false;
}

@Directive({
  selector: 'magic',
})
class MagicDirective {
  @Input() magic: string;

  constructor() {
    throw new Error('THIS SHOULD BE MOCKED');
  }
}

@NgModule({
  declarations: [HeadingComponent, MagicDirective]
})
class HeadingModule {}
//////////////////////////

describe('component with directive', () => {
  const shallow = new Shallow(HeadingComponent, HeadingModule);

  it('renders with magic when fancy = true', async () => {
    const {find} = await shallow.render('<heading [fancy]="true"></heading>');

    expect(find('h1[magic]').length).toBe(1);
  });

  it('renders with magic=abracadabra when fancy = true', async () => {
    const {find} = await shallow.render('<heading [fancy]="true"></heading>');

    // TODO: For some reason, this directive query won't return a match?
    const magicElement = find(MagicDirective);
    const magicDirective = magicElement.injector.get(MockDirective(MagicDirective));

    expect(magicDirective.magic).toBe('abracadabra');
  });

  it('renders without magic by default', async () => {
    const {find} = await shallow.render('<heading></heading>');
    const magic = find('h1[magic]');
    const notMagic = find('h1');

    expect(magic.length).toBe(0);
    expect(notMagic.length).toBe(1);
  });
});

