/**
 *	@filename	Bone.js
 *	@author		jaenster
 *	@desc		A optimized bone spear attack sequence
 */

var ClassAttack = (function () {

	const Result = {
		FAIL: 0,
		OK: 1,
		NO_VALID_SKILLS: 2,
		NEXT_TARGET: 3,
	};

	// I dont like magic numbers
	const sdk = require('../../modules/sdk');

	// Might add some generics in the future
	const Generics = {};

	const Bone = Object.create(Generics);

	// What we need to check?
	const commonChecks = () => {
		// 1) Our bone armor still up?
		if (me.getSkill(sdk.skills.BoneArmor, 1) && !me.getState(sdk.states.BoneArmor)) {
			Skill.cast(sdk.skills.BoneArmor);
		}
		// 2) Our merc still alive?
		if (Config.MercWatch && Town.needMerc()) {
			let [act, area] = [me.act, me.area];

			// I dont want to visit town and pot up and whatever, i just wanna revive merc and go
			Town.goToTown() && Town.reviveMerc() && Town.goToTown(act) && Town.move("portalspot");

			const portal = Pather.getPortal(area, me.name);
			if (!portal) throw new Error('Failed to go back after reviving merc');
			Pather.usePortal(undefined, undefined, portal);
		}
		// 3) Need to dim someone's vision?
		//ToDo actually write this properly
	};

	/**
	 * @param {Unit} unit
	 * @param {boolean} preattack
	 */
	Bone.doAttack = function (unit, preattack) {
		commonChecks();

		// 1) Explode corpses nearby for the monster we are attacking
		// get all corpses
		let corpse = getUnit(1, -1, 12);

		if (corpse) {
			let exploded = false;
			// calculate the range of your skill and loop trough them
			for (let range = ~~((me.getSkill(74, 1) + 7) / 3); corpse.getNext();) {

				// Check if monster in range
				if (getDistance(unit, corpse) <= range && corpse.checkCorpse) {

					// Check if it can be amp'd. ToDo; fix line of sight
					// Amp does -100% DR, and corpse explosion is 50% psy dmg. https://www.theamazonbasin.com/wiki/index.php?title=Amplify_Damage
					if (me.getSkill(sdk.skills.AmplifyDamage, 1) && !unit.getStat(sdk.states.AmplifyDamage) && unit.isCursable) {
						Skill.cast(sdk.skills.AmplifyDamage);
					}

					// Explode that corpse
					Skill.cast(sdk.skills.CorpseExplosion, 0, corpse);
					exploded = true;
				}
			}

			// Give some time back to kolbot system, telling we succeed
			return Result.OK;
		}

		// 2) Bone spear
		if (!me.getSkill(sdk.skills.BoneSpear, 1)) {
			return Result.NO_VALID_SKILLS;
		}

		// First calculate the damage of bone spear on this subject
		const dmgFields = [['MinDam', 'MinLevDam1', 'MinLevDam2', 'MinLevDam3', 'MinLevDam4', 'MinLevDam5', 'MaxDam', 'MaxLevDam1', 'MaxLevDam2', 'MaxLevDam3', 'MaxLevDam4', 'MaxLevDam5'], ['EMin', 'EMinLev1', 'EMinLev2', 'EMinLev3', 'EMinLev4', 'EMinLev5', 'EMax', 'EMaxLev1', 'EMaxLev2', 'EMaxLev3', 'EMaxLev4', 'EMaxLev5']],
			l = me.getSkill(84, 1);

		const damage = {
			min: stagedDmg(l, getBaseStat('skills', 84, dmgFields[1][0]), getBaseStat('skills', 84, dmgFields[1][1]), getBaseStat('skills', 84, dmgFields[1][2]), getBaseStat('skills', 84, dmgFields[1][3]), getBaseStat('skills', 84, dmgFields[1][4]), getBaseStat('skills', 84, dmgFields[1][5]), getBaseStat('skills', 84, 'HitShift'), 1),
			max: stagedDmg(l, getBaseStat('skills', 84, dmgFields[1][6]), getBaseStat('skills', 84, dmgFields[1][7]), getBaseStat('skills', 84, dmgFields[1][8]), getBaseStat('skills', 84, dmgFields[1][9]), getBaseStat('skills', 84, dmgFields[1][10]), getBaseStat('skills', 84, dmgFields[1][11]), getBaseStat('skills', 84, 'HitShift'), 1)
		};

		const baseSkills = [sdk.skills.BoneSpirit, sdk.skills.Teeth, sdk.skills.BoneArmor, sdk.skills.BonePrison].reduce((acc, cur) => acc + (me.getSkill(cur, 0/*hard skills*/)), 0);
		const bonus = 0.07 * baseSkills;

		// calculate the synergies
		damage.min *= 1 + bonus;
		damage.max *= 1 + bonus;


		// capped at -100 / 100
		let resist = Math.min(Math.max(/** @type number*/unit.getStat(sdk.stats.Magicresist), -100), 100);

		if (resist < 0) {
			// Instead of reducing, its amplifying damage
			damage.min *= 1 + (resist / 100);
		} else {
			// its holding back
			damage.min *= (100 - resist) / 100;
		}

		// calculate damage
		damage.max -= damage.max * (100 - resist) / 100;
		damage.min -= damage.min * (100 - resist) / 100;

		// So now that we know all that damage, findout the life of a monster
		const percentLeft = (unit.hp * 100 / unit.hpmax),
			maxReal = GameData.monsterMaxHP(unit.classid, unit.area, unit.charlvl - GameData.monsterLevel(unit.classid, unit.area)),
			hpReal = maxReal / 100 * percentLeft;

		Skill.cast(sdk.skills.BoneSpear, 1/* right skill */);

		if (damage.min > hpReal) {
			// We know for sure he gonna die of this attack
			return Result.NEXT_TARGET; // So tell kolbot we can move to the next target
		}

		return Result.OK;


	};

	Bone.afterAttack = function () {
		commonChecks();
	};

	// Some prototypes

	// A prototype i like to use for the isCursable field
	Unit.prototype.hasOwnProperty('isCursable') && Object.defineProperty(Unit.prototype, 'isCursable', {
		get: function () {
			return !((copyUnit(this).name === undefined || this.name.indexOf(getLocaleString(11086/*Possessed*/)) > -1))
				&& !this.getState(57) /*attract*/
				&& !(this.classid === 206 || this.classid === 258 || this.classid === 261 || this.classid === 266 || this.classid === 528);
		}
	});

	// A prototype to see if a corpse a valid one
	Unit.prototype.hasOwnProperty('checkCorpse') && Object.defineProperty(Unit.prototype, 'checkCorpse', {
		get: function () {
			if (this.mode !== 12) return false;

			const baseId = getBaseStat("monstats", this.classid, "baseid"),
				badList = [312, 571];

			if (
				(
					(this.spectype & 0x7)
					|| badList.indexOf(baseId) > -1
					|| (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3)
				) || !getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")
			) {
				return false;
			}

			return getDistance(me, this) <= 40 && !checkCollision(me, this, 0x4) &&
				!this.getState(1) && // freeze
				!this.getState(96) && // revive
				!this.getState(99) && // redeemed
				!this.getState(104) && // nodraw
				!this.getState(107) && // shatter
				!this.getState(118);
		}
	});

	/** @author Nishimura-Katsuo,
	 *  altered it a bit <3 */
	const stagedDmg = function (l, a, b, c, d, e, f, hitshift = 0, mult = 1) {
		[28, 22, 16, 8].some(g => {
			if (l > g) {
				a += f * (l - g);
				l = g;
			}

			return l > g;
		});

		a += b * (Math.max(0, l) - 1);

		return (mult * a) << hitshift;
	};

	return Bone;
}());