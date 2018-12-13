import * as path from 'path';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

import { Schema as NgAddOptions } from './schema';
import { getLibraryVersion } from './utils.js';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0'
};

const appOptions: ApplicationOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: 'css',
  skipTests: false,
  skipPackageJson: false
};

const defaultOptions: NgAddOptions = {
  skipInstall: false,
  setAsDefaultCollection: true
};

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);

let appTree: UnitTestTree;

describe('Schematic: ng-add', () => {

  const version = getLibraryVersion();

  beforeEach(() => {
    appTree = runner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
    appTree = runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    );
  });

  it('should add shallow-render to dependencies in package.json', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('ng-add', options, appTree);
    const contentAsObject = getContentAsObject(tree, '/package.json');

    expect(contentAsObject.devDependencies['shallow-render']).toBe(`^${version}`);
  });

  it('should set default collection in angular.json', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('ng-add', options, appTree);
    const contentAsObject = getContentAsObject(tree, '/angular.json');

    expect(contentAsObject.cli.defaultCollection).toBe('shallow-render');
  });

  it('should set default collection when set setAsDefaultCollection is false ', () => {
    const options = { ...defaultOptions, setAsDefaultCollection: false };

    const tree = runner.runSchematic('ng-add', options, appTree);
    const contentAsObject = getContentAsObject(tree, '/angular.json');

    expect(contentAsObject.cli).toBeFalsy();
  });

  it('should respect skipInstall flag', () => {
    const options = { ...defaultOptions, skipInstall: true, setAsDefaultCollection: false };

    runner.runSchematic('ng-add', options, appTree);
    expect(runner.tasks.length).toBe(0);
  });

  function getContentAsObject(tree: UnitTestTree, filePath: string) {
    return JSON.parse(tree.readContent(filePath));
  }
});
