export interface V13Options {
    company: string;
    jsonId: string;
    url?: string;
}

export function company(showLog?: boolean): Promise<any>;
export function get<T = any>(options?: V13Options): Promise<T>;
export function clean<T = any>(options?: V13Options): Promise<T>;
export function purchase(): Promise<any>;
export function purchaseFromXml(): Promise<any>;
export function daybook(): Promise<any>;

