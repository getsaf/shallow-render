export interface Schema {
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