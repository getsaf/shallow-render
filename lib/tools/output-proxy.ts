import { EventEmitter, OutputEmitterRef } from '@angular/core';
import { CustomError } from '../models/custom-error';
import { reflect } from './reflect';

const className = (object: any) => (object && object.constructor && object.constructor.name) || '<UnknownClass>';

export type KeysOfType<TObject, TPropertyType> = {
  [K in keyof TObject]: TObject[K] extends TPropertyType ? K : never;
}[keyof TObject];

export type PickByType<TObject, TPropertyType> = Pick<TObject, KeysOfType<TObject, TPropertyType>>;

export type OutputTypes = EventEmitter<any> | OutputEmitterRef<any>;

export class PropertyNotMarkedAsOutputError extends CustomError {
  constructor(key: string | symbol | number, component: any) {
    super(
      `${String(key)} is not marked with the @Output() decorator. ` +
        `Check that it is properly defined and set on the ${className(component)} class`,
    );
  }
}

export class PropertyNotAnEventEmitterOrSignalOutputError extends CustomError {
  constructor(key: string | symbol | number, component: any) {
    super(
      `${String(key)} is not an instance of an EventEmitter or a Signal Output. ` +
        `Check that it is properly defined and set on the ${className(component)} class`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const outputProxy = <TComponent extends Object>(component: TComponent): PickByType<TComponent, OutputTypes> => {
  const outputs = reflect.getInputsAndOutputs(component.constructor).outputs.map(o => o.propertyName);

  return new Proxy(
    {},
    {
      get: (_, key) => {
        if (!outputs.includes(String(key))) {
          throw new PropertyNotMarkedAsOutputError(key, component);
        }
        const maybeOutput = (component as any)[key];
        if (!(maybeOutput instanceof EventEmitter) && !(maybeOutput instanceof OutputEmitterRef)) {
          throw new PropertyNotAnEventEmitterOrSignalOutputError(key, component);
        }

        return maybeOutput;
      },
    },
  ) as any;
};
