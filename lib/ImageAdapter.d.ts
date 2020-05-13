export = _;
declare class _ {
    constructor(props: any);
    _props: any;
    get props(): any;
    process(image: any): Promise<any>;
}
declare namespace _ {
    export namespace ERRORS {
        export function CANNOT_PROCESS(reason: any): string;
    }
    export const TYPES: string[];
    export namespace MESSAGES {
        export const NO_IMAGE: string;
        export const BAD_STATUS_CODE: string;
        export const WRONG_IMAGE_FORMAT: string;
        export const WRONG_EXTENSION_FORMAT: string;
    }
}
