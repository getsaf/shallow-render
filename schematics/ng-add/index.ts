
import { Rule, SchematicContext, Tree, chain, noop } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getLibraryVersion, updateJsonInTree } from './utils';

import { Schema as NgAddOptions } from './schema';

const packageName = 'shallow-render';

function addShallowRenderDependency() {
    return updateJsonInTree('package.json', packageJson => {
        const version = getLibraryVersion();

        if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
        }

        if (!packageJson.devDependencies[packageName]) {
            const sortObjectByKeys = (obj: any) => Object.keys(obj)
                .sort()
                .reduce((result: any, key) => {
                result[key] = obj[key];
                return result;
                },      {});

            packageJson.devDependencies[packageName] = `^${version}`;
            packageJson.devDependencies = sortObjectByKeys(packageJson.devDependencies);
        }
        return packageJson;
    });
}

function setDefaultCollection(options: NgAddOptions) {
    if (options.setAsDefaultCollection) {
        return updateJsonInTree('angular.json', angularJson =>
            ({
                ...angularJson,
                cli: {
                    defaultCollection: packageName
                }
            })
        );
    }

    return noop();
  }

function addInstallTask(options: NgAddOptions) {
    return (host: Tree, context: SchematicContext) => {
        if (!options.skipInstall) {
            context.addTask(new NodePackageInstallTask());
        } else {
            context.logger.warn(`Do not forget to run 'npm install'`);
        }
        return host;
    };
}

// tslint:disable-next-line:no-default-export
export default function(options: NgAddOptions): Rule {
    return chain([
        addShallowRenderDependency(),
        setDefaultCollection(options),
        addInstallTask(options)
    ]);
}
