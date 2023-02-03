// @ts-nocheck
declare global {
	type NPC = string;
	export namespace NPC {
		const Akara: string;
		const Gheed: string;
		const Charsi: string;
		const Kashya: string;
		const Warriv: string;
		const Fara: string;
		const Drognan: string;
		const Elzix: string;
		const Greiz: string;
		const Lysander: string;
		const Jerhyn: string;
		const Meshif: string;
		const Atma: string;
		const Ormus: string;
		const Alkor: string;
		const Hratli: string;
		const Asheara: string;
		const Jamella: string;
		const Halbu: string;
		const Tyrael: string;
		const Malah: string;
		const Anya: string;
		const Larzuk: string;
		const Qual_Kehk: string;
		const Nihlathak: string;
		const Cain: string;
	}
	export namespace Town {
		const telekinesis: boolean;
		const sellTimer: number;
		export namespace lastInteractedNPC {
			const unit: Unit;
			const tick: number;
			function set(npc: Unit): void;
			function get(): any;
			function reset(): void;
		}
		const tasks: {
			Heal: NPC;
			Shop: NPC;
			Gamble: NPC;
			Repair: NPC;
			Merc: NPC;
			Key: NPC;
			CainID: NPC;
		}[];
		const ignoredItemTypes: any[];
		function needPotions(): boolean;
		function doChores(repair?: boolean): boolean;
		function npcInteract(name?: string, cancel?: boolean): boolean | Unit;
		function checkQuestItems(): void;
		function getTpTool(): ItemUnit;
		function getIdTool(): ItemUnit;
		function canTpToTown(): boolean;
		function initNPC(task?: string, reason?: string): boolean | Unit;
		function heal(): boolean;
		function needHealing(): boolean;
		function buyPotions(): boolean;
		function shiftCheck(col: number, beltSize: 0 | 2 | 1 | 4 | 3): boolean;
		function checkColumns(beltSize: 0 | 2 | 1 | 4 | 3): [number, number, number, number];
		function getPotion(npc: Unit, type: "hp" | "mp", highestPot?: 2 | 1 | 4 | 3 | 5): boolean | ItemUnit;
		function fillTome(classid: number): boolean;
		function checkScrolls(id: number): number;
		function identify(): boolean;
		function cainID(): boolean;
		function fieldID(): boolean;
		function getUnids(): false | ItemUnit[];
		function identifyItem(unit: ItemUnit, tome: ItemUnit, packetID?: boolean): boolean;
		function shopItems(): boolean;
		const gambleIds: any[];
		function gamble(): boolean;
		function needGamble(): boolean;
		function getGambledItem(list?: any[]): false | ItemUnit;
		function buyPots(quantity?: number, type?: string | number, drink?: boolean, force?: boolean, npc?: Unit): boolean;
		function drinkPots(type?: string | number, log?: boolean): {
			potName: string;
			quantity: number;
		};
		function buyKeys(): boolean;
		function checkKeys(): number;
		function needKeys(): boolean;
		function wantKeys(): boolean;
		function repairIngredientCheck(item: ItemUnit): boolean;
		function cubeRepair(): boolean;
		function cubeRepairItem(item: ItemUnit): boolean;
		function repair(force?: boolean): boolean;
		function needRepair(): string[];
		function getItemsForRepair(repairPercent: number, chargedItems: boolean): ItemUnit[];
		function reviveMerc(): boolean;
		function needMerc(): boolean;
		function canStash(item: ItemUnit): boolean;
		function stash(stashGold?: boolean): boolean;
		function needStash(): boolean;
		function openStash(): boolean;
		function getCorpse(): boolean;
		function checkShard(): boolean;
		function clearBelt(): boolean;
		function clearScrolls(): boolean;
		function clearInventory(): boolean;
		const act: {}[];
		function initialize(): boolean;
		function getDistance(spot?: string): number;
		function move(spot?: string, allowTK?: boolean): boolean;
		function moveToSpot(spot?: string, allowTK?: boolean): boolean;
		function goToTown(act?: 2 | 1 | 4 | 3 | 5, wpmenu?: boolean): boolean;
		function visitTown(repair?: boolean): boolean;
	}
}
export {};
