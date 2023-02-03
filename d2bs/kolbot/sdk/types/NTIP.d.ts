export {};
declare global {
	const NTIP: {
		OpenFile(string, boolean);
		CheckItem(unit: Unit, entryList?: [] | false, verbose?: boolean)
	}
}
