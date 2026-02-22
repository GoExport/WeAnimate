export interface Params {
	flashvars: Flashvars,
	allowScriptAccess: "always",
	allowFullScreen?: "true",
	movie?: string,
	wmode?: string,
}
export type Flashvars = Record<string, string>;
export const apiServer = `${import.meta.env.VITE_API_SERVER_HOST}:${import.meta.env.VITE_API_SERVER_PORT}`;
export const staticServer = `${import.meta.env.VITE_STATIC_SERVER_HOST}:${import.meta.env.VITE_STATIC_SERVER_PORT}`;
export const staticPaths = {
	//@ts-ignore
	swfUrl: import.meta.env.VITE_SWF_URL,
	//@ts-ignore
	storeUrl: import.meta.env.VITE_STORE_URL,
	//@ts-ignore
	clientUrl: import.meta.env.VITE_CLIENT_URL,
};
export const swfUrlBase = staticServer + staticPaths.swfUrl;
export const wrapperVer = import.meta.env.VITE_WRAPPER_VER;
export function toAttrString(table:Record<string, string> | string) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
