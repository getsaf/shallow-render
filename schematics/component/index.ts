// tslint:disable:linebreak-style
import {
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  apply,
  url,
  template,
  move,
  MergeStrategy,
  chain,
  externalSchematic,
  SchematicsException
} from '@angular-devkit/schematics';

import { parseName } from '@schematics/angular/utility/parse-name';
import * as findModule from '@schematics/angular/utility/find-module';
import { strings, Path } from '@angular-devkit/core';
import {
  buildDefaultPath,
  getProject
} from '@schematics/angular/utility/project';

export interface ShallowComponentOptions {
  name: string;
  path?: string;
  project?: string;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: 'Emulated' | 'Native' | 'None';
  changeDetection?: 'Default' | 'OnPush';
  prefix?: string;
  styleext?: string;
  spec?: boolean;
  flat?: boolean;
  skipImport?: boolean;
  selector?: string;
  module?: string;
  export?: boolean;
}

interface ModuleDetails {
  moduleName: string;
  relativePath: string;
}

export const defaultModuleDetails: ModuleDetails = {
  moduleName: '',
  relativePath: ''
};

// tslint:disable-next-line:no-default-export
export default function(options: ShallowComponentOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.project) {
      throw new SchematicsException('Option (project) is required.');
    }

    // no reason to continue if spec file is not required
    if (!options.spec) {
      return externalSchematic('@schematics/angular', 'component', options);
    }

    const project = getProject(host, options.project);
    if (options.path === undefined) {
      options.path = buildDefaultPath(project);
    }

    const parsedPath = parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;

    const moduleDetails = options.skipImport
      ? defaultModuleDetails
      : getModuleDetails(options, host);

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        'if-flat': (s: string) => (options.flat ? '' : s),
        ...options,
        ...moduleDetails
      }),
      move(parsedPath.path)
    ]);

    const rule = chain([
      externalSchematic('@schematics/angular', 'component', {
        ...options,
        spec: false
      }),
      mergeWith(templateSource, MergeStrategy.Default)
    ]);

    return rule(host, context);
  };
}

function getModuleDetails(
  options: ShallowComponentOptions,
  host: Tree
): ModuleDetails {
  const modulePath = findModule.findModuleFromOptions(host, options) as Path;
  // tslint:disable-next-line:prefer-template
  const componentPath = `/${options.path}/`
                          + (options.flat ? '' : strings.dasherize(options.name) + '/')
                          + strings.dasherize(options.name)
                          + '.component';
  const relativePath = findModule.buildRelativePath(componentPath, modulePath);
  const moduleFileName = modulePath.split('/').pop() as string;

  const suffixLength = '.module.ts'.length;
  const moduleName = moduleFileName.slice(0, moduleFileName.length - suffixLength);
  const moduleRelativePath = relativePath.slice(0, relativePath.length - suffixLength);

  return { relativePath: moduleRelativePath, moduleName };
}
