export {};
declare global {
	type PickitResult = {
			UNID: -1,
			UNWANTED: 0,
			WANTED: 1,
			CUBING: 2,
			RUNEWORD: 3,
			TRASH: 4,
			CRAFTING: 5,
			UTILITY: 6
	};
	const Pickit: {
		gidList: number[],
		invoLocked: boolean,
		beltSize: 1 | 2 | 3 | 4,
		ignoreLog: number[], // Ignored item types for item logging
		Result: PickitResult,
		tkable: number[],
		essentials: number[],

		init: (notify: any) => void
		itemEvent: (gid?: number, mode?: number, code?: number, global?: number) => void
		sortItems: (unitA: Unit, unitB: Unit) => number
		sortFastPickItems: (unitA: Unit, unitB: Unit) => number
		checkBelt: () => boolean
		canPick: (unit: ItemUnit) => boolean
		checkItem: (unit: ItemUnit) => { result: PickitResult, line: null | number }
		pickItem: (unit: ItemUnit, status?: PickitResult, keptLine?: any, retry?: number) => { result: PickitResult, line: string | null };
		canMakeRoom: () => boolean
		pickItems: (range?: number) => boolean
		fastPick: () => boolean
	}
}
