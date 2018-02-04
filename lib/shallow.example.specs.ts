import { Injectable, Input, Component, NgModule } from '@angular/core';
import { Shallow } from './shallow';

describe('Shallow', () => {
  ///////////////////////////////////
  // Simple component
  ///////////////////////////////////
  describe('can test a simple component', () => {
    ////// Module Setup //////
    @Component({
      selector: 'big-text',
      template: '<h1><ng-content></ng-content></h1>',
    })
    class BigTextComponent {}

    @NgModule({
      declarations: [BigTextComponent]
    })
    class BigTextModule {}
    //////////////////////////

    const shallow = new Shallow(BigTextComponent, BigTextModule);

    it('places content in an h1', async () => {
      const {find} = await shallow.render('<big-text>Woot!</big-text>');

      const h1 = find('h1');
      expect(h1.nativeElement.innerText).toBe('Woot!');
    });
  });

  ///////////////////////////////////
  // Component with a service
  ///////////////////////////////////
  describe('can test a component that uses a service', () => {
    ////// Module Setup //////
    @Injectable()
    class RedService {
      color() {
        return 'RED';
      }
    }

    @Component({
      selector: 'color-label',
      template: '<label>{{redService.color()}}</label>',
    })
    class ColorLabelComponent {
      constructor(public redService: RedService) {}
    }

    @NgModule({
      declarations: [ColorLabelComponent],
      providers: [RedService],
    })
    class ColorModule {}
    //////////////////////////

    const shallow = new Shallow(ColorLabelComponent, ColorModule)
      .mock(RedService, {color: () => 'MOCKED COLOR'});

    it('Uses the color from the RedService', async () => {
      const {element} = await shallow.render('<color-label></color-label>');

      expect(element.nativeElement.innerText).toBe('MOCKED COLOR');
    });
  });

  ///////////////////////////////////
  // Component that uses other components from the same module
  ///////////////////////////////////
  describe('can test rendering of other mocked components', () => {
    ////// Module Setup //////
    @Component({
      selector: 'list-container',
      template: '<ul><ng-content></ng-content></ul>',
    })
    class ListContainerComponent {}

    @Component({
      selector: 'list-item',
      template: '<li [class.bold]="bold"><ng-content></ng-content></li>',
    })
    class ListItemComponent {
      @Input() bold = false;
    }

    @Component({
      selector: 'awesome-list',
      template: `
        <list-container>
          <list-item class="top-item" *ngIf="topItem !== undefined" [bold]="boldTopItem">{{topItem}}</list-item>
          <list-item [bold]="true">Chuck Norris</list-item>
          <list-item>Tom Hanks</list-item>
        </list-container>
      `,
    })
    class AwesomeListComponent {
      @Input() topItem: string;
      @Input() boldTopItem = false;
    }

    @NgModule({
      declarations: [ListContainerComponent, ListItemComponent, AwesomeListComponent]
    })
    class ListModule {}
    //////////////////////////

    const shallow = new Shallow(AwesomeListComponent, ListModule);

    it('renders Chuck and Tom', async () => {
      const {find} = await shallow.render('<awesome-list></awesome-list>');

      expect(find('list-item').map(li => li.nativeElement.innerText.trim()))
        .toEqual(['Chuck Norris', 'Tom Hanks']);
    });

    it('renders a top-item when provided', async () => {
      const {find} = await shallow.render('<awesome-list topItem="Brandon"></awesome-list>');

      expect(find('.top-item').nativeElement.innerText.trim()).toBe('Brandon');
    });

    fit('renders the top-item as bold', async () => {
      const {find} = await shallow.render(`
        <awesome-list [boldTopItem]="true" topItem="Bolded"></awesome-list>
      `);

      expect(find('.top-item').componentInstance.bold).toBe(true);
    });

    it('does not add a top-item when not provided', async () => {
      const {find} = await shallow.render('<awesome-list></awesome-list>');

      const li = find('list-item');
      expect(li.length).toBe(2);
      expect(find('.top-item').length).toBe(0);
    });
  });
});
