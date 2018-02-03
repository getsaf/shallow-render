import { ExampleComponent } from './ExampleComponent';
import { ExampleDirective } from './ExampleDirective';
import { ExampleModule } from './ExampleModule';
import { Shallow } from './Shallow';

describe('Shallow', () => {
  describe('rendering a component', () => {
    const shallow = new Shallow(ExampleComponent, ExampleModule);

    it('returns the instance of the test component', async () => {
      const {instance} = await shallow.render('<example></example>');

      expect(instance instanceof ExampleComponent);
    });

    it('returns the debugElement of the test component', async () => {
      const {element} = await shallow.render('<example label="foo"></example>');

      expect(element.nativeElement.innerText).toBe('foo');
    });

    it('detects changes automatically by default', async () => {
      const {instance} = await shallow.render('<example label="foo"></example>');

      expect(instance.label).toBe('foo');
    });

    it('skips detectChanges when asked', async () => {
      const {instance} = await shallow.render('<example label="not set"></example>', {skipDetectChanges: true});

      expect(instance.label).not.toBeDefined();
    });

    it('can find by css', async () => {
      const {find} = await shallow.render('<example label="foo"></example>');
      const h1 = find('h1');

      expect(h1.nativeElement.innerText).toBe('foo');
    });

    it('can find by directive', async () => {
      const {instance, find} = await shallow.render('<example></example>');
      const found = find(ExampleComponent);

      expect(found.componentInstance).toBe(instance);
    });
  });

  describe('rendering a directive', () => {
    const shallow = new Shallow(ExampleDirective, ExampleModule);

    it('returns the instance of the test directive', async () => {
      const {instance} = await shallow.render('<label exampleDirective="foo"></label>');

      expect(instance instanceof ExampleDirective).toBe(true);
      expect(instance.exampleDirective).toBe('foo');
    });

    it('returns the debugElement of the test directive', async () => {
      const {element} = await shallow.render('<label exampleDirective></label>');

      expect(element.nativeElement.tagName).toBe('LABEL');
    });
  });
});
