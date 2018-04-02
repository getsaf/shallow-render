import { DirectiveResolver, NgModuleResolver, PipeResolver } from '@angular/compiler';
import { JitReflector } from './jit-reflector';

export const jitReflector = new JitReflector();
export const directiveResolver = new DirectiveResolver(jitReflector);
export const pipeResolver = new PipeResolver(jitReflector);
export const ngModuleResolver = new NgModuleResolver(jitReflector);
