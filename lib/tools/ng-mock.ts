import { MockComponent, MockDirective, MockPipe } from 'ng-mocks';
import { mockModule } from '../tools/mock-module';
import { MockCache } from '../models/mock-cache';
import { isModuleWithProviders } from '../tools/type-checkers';

const getType = (klass: any) => {
  if (Array.isArray(klass.__annotations__)
    && klass.__annotations__[0]
    && klass.__annotations__[0].__proto__
    && klass.__annotations__[0].__proto__.ngMetadataName
  ) {
    return klass.__annotations__[0].__proto__.ngMetadataName;
  }

  if (Array.isArray(klass.decorators)) {
    const fount = klass.decorators.find((d: any) => d.type && d.type.prototype && d.type.prototype.ngMetadataName);
    if (fount) {
      return fount.type.prototype.ngMetadataName;
    }
  }

  if (isModuleWithProviders(klass)) {
    return 'NgModule';
  }
  throw new Error(`Cannot find the declaration type for class ${klass.name || klass}`);
};

export function ngMock<TThing>(thing: TThing, mockCache: MockCache, dontMock: any[]): TThing {
  const cached = mockCache.find(thing);

  if (cached) {
    return cached;
  }

  if (Array.isArray(thing)) {
    return mockCache.add(thing, thing.map(t => ngMock(t, mockCache, dontMock))) as any; // Recursion
  }

  if (dontMock.includes(thing)) {
    return thing;
  }

  let mock: any;
  const type = getType(thing);
  switch (type) {
    case 'Component':
      mock = MockComponent(thing as any);
      break;
    case 'Directive':
      mock = MockDirective(thing as any);
      break;
    case 'Pipe':
      mock = MockPipe(thing as any);
      break;
    case 'NgModule':
      mock = mockModule(thing as any, mockCache, dontMock);
      break;
    default:
      throw new Error(`Don't know how to mock type: ${type}`);
  }
  return mockCache.add(thing, mock);
}
