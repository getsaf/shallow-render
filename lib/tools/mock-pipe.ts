import { Pipe, PipeTransform, Type } from '@angular/core';
import { pipeResolver } from './reflect';
import { getProviderName } from './get-provider-name';
import { MockOf } from './mock-of.directive';

export const mockPipe = <TPipe extends Type<PipeTransform>>(
  pipe: TPipe,
  transform: TPipe['prototype']['transform'] = () => undefined
): TPipe => {
  const meta = pipeResolver.resolve(pipe);
  if (!meta) {
    throw new Error(`Cannot mock pipe ${getProviderName(pipe)}`);
  }

  @MockOf(pipe)
  @Pipe({ name: meta.name })
  class Mock implements PipeTransform {
    transform = transform;
  }
  return Mock as TPipe;
};
