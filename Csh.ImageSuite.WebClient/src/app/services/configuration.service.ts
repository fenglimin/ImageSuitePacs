import { Injectable } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

    baseUrl: string;
  constructor(private locationStrategy: LocationStrategy) {
      this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
