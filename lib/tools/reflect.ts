import { Component, Directive, Input, NgModule, Output, Pipe, PipeTransform } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

type DirectiveResolver = {
  resolve(directiveOrComponent: any): Directive | null;
};
type ComponentResolver = {
  resolve(component: any): Component | null;
};

type ModuleResolver = {
  resolve(module: any): NgModule | null;
};

type PipeResolver = {
  resolve(pipe: any): Pipe | null;
};

type Resolvers = {
  directive: DirectiveResolver;
  module: ModuleResolver;
  component: ComponentResolver;
  pipe: PipeResolver;
};

const resolvers = (getTestBed() as any)._compiler.resolvers as Resolvers;

type IODefinition = { propertyName: string; alias: string };

type InputsAndOutputs = {
  inputs: IODefinition[];
  outputs: IODefinition[];
};

type PropDecorators = Record<
  string,
  {
    type: any;
    args?: any[];
  }[]
>;

const getInputsAndOutputs = (componentOrDirective: any): InputsAndOutputs => {
  return Object.entries((componentOrDirective.propDecorators || {}) as PropDecorators).reduce<InputsAndOutputs>(
    (acc, [key, value]) => {
      const input = value.find(v => v.type === Input);
      if (input) {
        return {
          ...acc,
          inputs: [...acc.inputs, { propertyName: key, alias: input.args?.[0] || key }],
        };
      }

      const output = value.find(v => v.type === Output);
      if (output) {
        return {
          ...acc,
          outputs: [...acc.outputs, { propertyName: key, alias: output.args?.[0] || key }],
        };
      }
      return acc;
    },
    { inputs: [], outputs: [] }
  );
};

const isComponent = (thing: any) => !!resolvers.component.resolve(thing);
const isDirective = (thing: any) => !!resolvers.directive.resolve(thing);
const isNgModule = (thing: any) => !!resolvers.module.resolve(thing);
const isPipe = (thing: any): thing is PipeTransform => !!resolvers.pipe.resolve(thing);

export const reflect = {
  component: resolvers.component,
  directive: resolvers.directive,
  module: resolvers.module,
  pipe: resolvers.pipe,
  isComponent,
  isDirective,
  isNgModule,
  isPipe,
  getInputsAndOutputs,
};
