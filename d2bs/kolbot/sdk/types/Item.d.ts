export {};
declare global {
	const Item: {
		hasTier(item: any): void
		canEquip(item: any): void
		equip(item: any, bodyLoc: any): void
		getEquippedItem(bodyLoc: any): void
		getBodyLoc(item: any): void
		autoEquipCheck(item: any): boolean
		autoEquip(): void
	}
}
