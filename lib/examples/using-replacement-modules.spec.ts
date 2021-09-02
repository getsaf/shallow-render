import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Component, NgModule, OnInit } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'service-response-label',
  template: '<label>{{labelText}}</label>',
})
class FooLabelComponent implements OnInit {
  labelText?: string;

  constructor(private _httpClient: HttpClient) {}
  async ngOnInit() {
    this.labelText = await this._httpClient
      .get<string>('/foo/as/a/service')
      .toPromise()
      .catch(() => 'ERROR');
  }
}

@NgModule({
  imports: [HttpClientModule],
  declarations: [FooLabelComponent],
})
class FooLabelModule {}
//////////////////////////

describe('using replaceModule', () => {
  let shallow: Shallow<FooLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooLabelComponent, FooLabelModule).replaceModule(HttpClientModule, HttpClientTestingModule);
  });

  it('displays the response from the foo service', async () => {
    const { element, inject, fixture } = await shallow.render();
    const client = inject(HttpTestingController);
    client.expectOne('/foo/as/a/service').flush('foo response');
    await new Promise(resolve => setTimeout(resolve, 1));
    fixture.detectChanges();

    expect(element.nativeElement.innerText).toBe('foo response');
  });

  it('displays ERROR when a service error occurs', async () => {
    const { element, inject, fixture } = await shallow.render();
    const client = inject(HttpTestingController);
    client.expectOne('/foo/as/a/service').error(new ErrorEvent('BOOM'));
    await new Promise(resolve => setTimeout(resolve, 1));
    fixture.detectChanges();

    expect(element.nativeElement.innerText).toBe('ERROR');
  });
});
