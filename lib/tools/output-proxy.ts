import { EventEmitter } from '@angular/core';
import { CustomError } from '../models/custom-error';
import { directiveResolver } from './reflect';

const className = (object: any) => (
    object
    && object.constructor
    && object.constructor.name
  )
  || '<UnknownClass>';

export type KeysOfType<TObject, TPropertyType> = {
  [K in keyof TObject]: TObject[K] extends TPropertyType ? K : never;
}[keyof TObject];

export type PickByType<TObject, TPropertyType> = Pick<TObject, KeysOfType<TObject, TPropertyType>>;

export class PropertyNotMarkedAsOutputError extends CustomError {
  constructor(key: string | symbol | number, component: any) {
    super(
      `${key} is not marked with the @Output() decorator. `
      + `Check that it is properly defined and set on the ${className(component)} class`
    );
  }
}

export class PropertyNotAnEventEmitterError extends CustomError {
  constructor(key: string | symbol | number, component: any) {
    super(
      `${key} is not an instance of an EventEmitter. `
      + `Check that it is properly defined and set on the ${className(component)} class`
    );
  }
}

export const outputProxy = <TComponent>(component: TComponent): PickByType<TComponent, EventEmitter<any>> => {
  const directive = component
    && 'constructor' in component
    && directiveResolver.resolve((component as any).constructor);

  const outputs = ((directive && directive.outputs) || [])
    .map(output => output.split(':')[0]);

  return new Proxy(
    {},
    {
      get: (_, key: keyof TComponent) => {
        if (!outputs.includes(key)) {
          throw new PropertyNotMarkedAsOutputError(key, component);
        }
        if (!(component[key] instanceof EventEmitter)) {
          throw new PropertyNotAnEventEmitterError(key, component);
        }

        return component[key];
      }
    }
  ) as any;
};
