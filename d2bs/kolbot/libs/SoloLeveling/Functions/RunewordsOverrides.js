/*
*	@filename	RunewordsOverrides.js
*	@author		isid0re
*	@desc		Runewords.js patch for offline ladder runewords
*	@credits	kolton
*/

var Runeword = {
	// 1.09
	AncientsPledge: [617, 618, 616], // Ral + Ort + Tal
	Black: [619, 625, 613], // Thul + Io + Nef
	Fury: [640, 634, 614], // Jah + Gul + Eth
	HolyThunder: [614, 617, 618, 616], // Eth + Ral + Ort + Tal
	Honor: [620, 610, 615, 612, 621], // Amn + El + Ith + Tir + Sol
	KingsGrace: [620, 617, 619], // Amn + Ral + Thul
	Leaf: [612, 617], // Tir + Ral
	Lionheart: [624, 626, 628], // Hel + Lum + Fal
	Lore: [618, 621], // Ort + Sol
	Malice: [615, 610, 614], // Ith + El + Eth
	Melody: [622, 627, 613], // Shael + Ko + Nef
	Memory: [626, 625, 621, 614], // Lum + Io + Sol + Eth
	Nadir: [613, 612], // Nef + Tir
	Radiance: [613, 621, 615], // Nef + Sol + Ith
	Rhyme: [622, 614], // Shael + Eth
	Silence: [623, 611, 624, 633, 612, 635], // Dol + Eld + Hel + Ist + Tir + Vex
	Smoke: [613, 626], // Nef + Lum
	Stealth: [616, 614], // Tal + Eth
	Steel: [612, 610], // Tir + El
	Strength: [620, 612], // Amn + Tir
	Venom: [616, 623, 632], // Tal + Dol + Mal
	Wealth: [629, 627, 612], // Lem + Ko + Tir
	White: [623, 625], // Dol + Io
	Zephyr: [618, 614], // Ort + Eth

	// 1.10
	Beast: [639, 612, 631, 632, 626], // Ber + Tir + Um + Mal + Lum
	Bramble: [617, 636, 638, 614], // Ral + Ohm + Sur + Eth
	BreathoftheDying: [635, 624, 610, 611, 642, 614], // Vex + Hel + El + Eld + Zod + Eth
	CallToArms: [620, 617, 632, 633, 636], // Amn + Ral + Mal + Ist + Ohm
	ChainsofHonor: [623, 631, 639, 633], // Dol + Um + Ber + Ist
	Chaos: [628, 636, 631], // Fal + Ohm + Um
	CrescentMoon: [622, 631, 612], // Shael + Um + Tir
	Delirium: [629, 633, 625], // Lem + Ist + Io
	Doom: [624, 636, 631, 637, 641], // Hel + Ohm + Um + Lo + Cham
	Duress: [622, 631, 619], // Shael + Um + Thul
	Enigma: [640, 615, 639], // Jah + Ith + Ber
	Eternity: [620, 639, 633, 621, 638], // Amn + Ber + Ist + Sol + Sur
	Exile: [635, 636, 633, 623], // Vex + Ohm + Ist + Dol
	Famine: [628, 636, 618, 640], // Fal + Ohm + Ort + Jah
	Gloom: [628, 631, 630], // Fal + Um + Pul
	HandofJustice: [638, 641, 620, 637], // Sur + Cham + Amn + Lo
	HeartoftheOak: [627, 635, 630, 619], // Ko + Vex + Pul + Thul
	Kingslayer: [632, 631, 634, 628], // Mal + Um + Gul + Fal
	Passion: [623, 618, 611, 629], // Dol + Ort + Eld + Lem
	Prudence: [632, 612], // Mal + Tir
	Sanctuary: [627, 627, 632], // Ko + Ko + Mal
	Splendor: [614, 626], // Eth + Lum
	Stone: [622, 631, 630, 626], // Shael + Um + Pul + Lum
	Wind: [638, 610], // Sur + El

	// Don't use ladder-only on NL
	Brand: (me.ladder || Developer.addLadderRW) ? [640, 637, 632, 634] : false, // Jah + Lo + Mal + Gul
	Death: (me.ladder || Developer.addLadderRW) ? [624, 610, 635, 618, 634] : false, // Hel + El + Vex + Ort + Gul
	Destruction: (me.ladder || Developer.addLadderRW) ? [635, 637, 639, 640, 627] : false, // Vex + Lo + Ber + Jah + Ko
	Dragon: (me.ladder || Developer.addLadderRW) ? [638, 637, 621] : false, // Sur + Lo + Sol
	Dream: (me.ladder || Developer.addLadderRW) ? [625, 640, 630] : false, // Io + Jah + Pul
	Edge: (me.ladder || Developer.addLadderRW) ? [612, 616, 620] : false, // Tir + Tal + Amn
	Faith: (me.ladder || Developer.addLadderRW) ? [636, 640, 629, 611] : false, // Ohm + Jah + Lem + Eld
	Fortitude: (me.ladder || Developer.addLadderRW) ? [610, 621, 623, 637] : false, // El + Sol + Dol + Lo
	Grief: (me.ladder || Developer.addLadderRW) ? [614, 612, 637, 632, 617] : false, // Eth + Tir + Lo + Mal + Ral
	Harmony: (me.ladder || Developer.addLadderRW) ? [612, 615, 621, 627] : false, // Tir + Ith + Sol + Ko
	Ice: (me.ladder || Developer.addLadderRW) ? [620, 622, 640, 637] : false, // Amn + Shael + Jah + Lo
	"Infinity": (me.ladder || Developer.addLadderRW) ? [639, 632, 639, 633] : false, // Ber + Mal + Ber + Ist
	Insight: (me.ladder || Developer.addLadderRW) ? [617, 612, 616, 621] : false, // Ral + Tir + Tal + Sol
	LastWish: (me.ladder || Developer.addLadderRW) ? [640, 632, 640, 638, 640, 639] : false, // Jah + Mal + Jah + Sur + Jah + Ber
	Lawbringer: (me.ladder || Developer.addLadderRW) ? [620, 629, 627] : false, // Amn + Lem + Ko
	Oath: (me.ladder || Developer.addLadderRW) ? [622, 630, 632, 626] : false, // Shael + Pul + Mal + Lum
	Obedience: (me.ladder || Developer.addLadderRW) ? [624, 627, 619, 614, 628] : false, // Hel + Ko + Thul + Eth + Fal
	Phoenix: (me.ladder || Developer.addLadderRW) ? [635, 635, 637, 640] : false, // Vex + Vex + Lo + Jah
	Pride: (me.ladder || Developer.addLadderRW) ? [641, 638, 625, 637] : false, // Cham + Sur + Io + Lo
	Rift: (me.ladder || Developer.addLadderRW) ? [624, 627, 629, 634] : false, // Hel + Ko + Lem + Gul
	Spirit: (me.ladder || Developer.addLadderRW) ? [616, 619, 618, 620] : false, // Tal + Thul + Ort + Amn
	VoiceofReason: (me.ladder || Developer.addLadderRW) ? [629, 627, 610, 611] : false, // Lem + Ko + El + Eld
	Wrath: (me.ladder || Developer.addLadderRW) ? [630, 626, 639, 632] : false, // Pul + Lum + Ber + Mal

	// 1.11
	Bone: [621, 631, 631], // Sol + Um + Um
	Enlightenment: [630, 617, 621], // Pul + Ral + Sol
	Myth: [624, 620, 613], // Hel + Amn + Nef
	Peace: [622, 619, 620], // Shael + Thul + Amn
	Principle: [617, 634, 611], // Ral + Gul + Eld
	Rain: [618, 632, 615], // Ort + Mal + Ith
	Treachery: [622, 619, 629], // Shael + Thul + Lem

	Test: [624, 624, 624]
};
