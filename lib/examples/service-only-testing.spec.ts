import { Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

////// Module Setup //////

type WeatherServiceResults = {
  chanceOfRain: number;
  temperature: number;
};

@Injectable()
class WeatherService {
  constructor(private _http: HttpClient) {}

  getTemperatureForZip(zipcode: string) {
    return this._http
      .get<WeatherServiceResults>('https://my-weather-api.com', { params: { zipcode } })
      .toPromise()
      .then(result => result.temperature);
  }
}

@NgModule({
  providers: [WeatherService],
  imports: [HttpClientModule],
})
class WeatherModule {}
//////////////////////////

describe('WeatherService', () => {
  let shallow: Shallow<WeatherService>;

  beforeEach(() => {
    shallow = new Shallow(WeatherService, WeatherModule);
  });

  describe('getTemperatureForZip', () => {
    ////////////////////////
    // With Standard Mocks
    ////////////////////////
    it('returns the temperature for the given zipcode', async () => {
      const { inject, instance } = shallow.mock(HttpClient, { get: () => of({ temperature: 20 }) }).createService();
      const temperature = await instance.getTemperatureForZip('12345');

      expect(inject(HttpClient).get).toHaveBeenCalledWith(jasmine.stringMatching('my-weather-api.com'), {
        params: { zipcode: '12345' },
      });
      expect(temperature).toBe(20);
    });

    /////////////////////////////////
    // With HttpClientTestingModule
    /////////////////////////////////
    it('returns the temperature for the given zipcode', async () => {
      const { inject, instance } = shallow.replaceModule(HttpClientModule, HttpClientTestingModule).createService();
      const http = inject(HttpTestingController);
      const requestPromise = instance.getTemperatureForZip('12345');
      const mock = http.expectOne('https://my-weather-api.com?zipcode=12345');

      expect(mock.request.method).toBe('GET');
      mock.flush({ temperature: 20 });
      expect(await requestPromise).toBe(20);
      http.verify();
    });
  });
});
