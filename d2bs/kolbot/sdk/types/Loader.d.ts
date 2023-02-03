export {};
declare global {
	const Loader: {
		fileList: string[],
		scriptList: string[],
		scriptIndex: number,
		skipTown: string[],

		init: () => void,
		getScripts: () => void,
		clone: (obj: any) => void,
		copy: (from: any, to: any) => void,
		loadScripts: () => void,
		scriptName: (offset?: number) => void,
	}
}
