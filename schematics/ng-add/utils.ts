import * as fs from 'fs';
import { Tree, Rule } from '@angular-devkit/schematics';

export function getLibraryVersion() {
    return JSON.parse(
        fs.readFileSync('./package.json', 'utf8')
    ).version;
}

export function readJsonInTree(host: Tree, filePath: string) {
    if (!host.exists(filePath)) {
        throw new Error(`Cannot find ${filePath}`);
    }

    const json = JSON.parse((host.read(filePath) as any).toString('utf-8'));
    return json;
}

export function updateJsonInTree(
    filePath: string,
    callback: (json: any) => any
): Rule {
    return (host: Tree): Tree => {
        const updatedJson = callback(readJsonInTree(host, filePath));
        host.overwrite(filePath, JSON.stringify(updatedJson, undefined, 2));
        return host;
    };
}
