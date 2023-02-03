export {};
declare global {
	export const Runewords: {
		init(): void
		validItem(item: any): void
		buildLists(): void
		update(classid: any, gid: any): void
		checkRunewords(): void
		checkItem(unit: any): boolean
		keepItem(unit: any): boolean
		getBase(runeword: any, base: any, ethFlag: any, reroll: any): void
		socketItem(base: any, rune: any): void
		getScroll(): void
		makeRunewords(): void
		rerollRunewords(): void
	}

	export const Runeword: {
		AncientsPledge: number[];
		Black: number[];
		Fury: number[];
		HolyThunder: number[];
		Honor: number[];
		KingsGrace: number[];
		Leaf: number[];
		Lionheart: number[];
		Lore: number[];
		Malice: number[];
		Melody: number[];
		Memory: number[];
		Nadir: number[];
		Radiance: number[];
		Rhyme: number[];
		Silence: number[];
		Smoke: number[];
		Stealth: number[];
		Steel: number[];
		Strength: number[];
		Venom: number[];
		Wealth: number[];
		White: number[];
		Zephyr: number[];
		Beast: number[];
		Bramble: number[];
		BreathoftheDying: number[];
		CallToArms: number[];
		ChainsofHonor: number[];
		Chaos: number[];
		CrescentMoon: number[];
		Delirium: number[];
		Doom: number[];
		Duress: number[];
		Enigma: number[];
		Eternity: number[];
		Exile: number[];
		Famine: number[];
		Gloom: number[];
		HandofJustice: number[];
		HeartoftheOak: number[];
		Kingslayer: number[];
		Passion: number[];
		Prudence: number[];
		Sanctuary: number[];
		Splendor: number[];
		Stone: number[];
		Wind: number[];
		Brand: number[];
		Death: number[];
		Destruction: number[];
		Dragon: number[];
		Dream: number[];
		Edge: number[];
		Faith: number[];
		Fortitude: number[];
		Grief: number[];
		Harmony: number[];
		Ice: number[];
		Infinity: number[];
		Insight: number[];
		LastWish: number[];
		Lawbringer: number[];
		Oath: number[];
		Obedience: number[];
		Phoenix: number[];
		Pride: number[];
		Rift: number[];
		Spirit: number[];
		VoiceofReason: number[];
		Wrath: number[];
		Bone: number[];
		Enlightenment: number[];
		Myth: number[];
		Peace: number[];
		Principle: number[];
		Rain: number[];
		Treachery: number[];
		Test: number[];
	}

	export const Roll: {
		All: 0,
		Eth: 1,
		NonEth: 2
	}
}
