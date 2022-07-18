/**
*  @filename    Item.js
*  @author      kolton, theBGuy
*  @desc        handle item and autoequip related things
*
*/

// torn on if this should be broken up in two classes Item and AutoEquip, for now leaving as is
const Item = {
	hasTier: function (item) {
		return Config.AutoEquip && NTIP.GetTier(item) > 0;
	},

	canEquip: function (item) {
		// Not an item or unid
		if (item.type !== 4 || !item.identified) return false;
		// Higher requirements
		if (item.getStat(92) > me.getStat(12) || item.dexreq > me.getStat(sdk.stats.Dexterity) || item.strreq > me.getStat(0)) return false;

		return true;
	},

	// Equips an item and throws away the old equipped item
	equip: function (item, bodyLoc) {
		if (!this.canEquip(item)) return false;

		// Already equipped in the right slot
		if (item.mode === 1 && item.bodylocation === bodyLoc) return true;
		if (item.location === 7 && !Town.openStash()) return false;

		for (let i = 0; i < 3; i += 1) {
			if (item.toCursor()) {
				clickItemAndWait(0, bodyLoc);


				if (item.bodylocation === bodyLoc) {
					if (getCursorType() === 3) {
						let cursorItem = Game.getCursorUnit();

						if (cursorItem) {
							if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
								cursorItem.drop();
							}
						}
					}

					return true;
				}
			}
		}

		return false;
	},

	getEquippedItem: function (bodyLoc) {
		let item = me.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc) {
					return {
						classid: item.classid,
						tier: NTIP.GetTier(item)
					};
				}
			} while (item.getNext());
		}

		// Don't have anything equipped in there
		return {
			classid: -1,
			tier: -1
		};
	},

	getBodyLoc: function (item) {
		let bodyLoc;

		switch (item.itemType) {
		case sdk.itemtype.Shield:
		case sdk.itemtype.AuricShields:
		case sdk.itemtype.VoodooHeads:
		case sdk.itemtype.BowQuiver:
		case sdk.itemtype.CrossbowQuiver:
			bodyLoc = 5;

			break;
		case sdk.itemtype.Armor:
			bodyLoc = 3;

			break;
		case sdk.itemtype.Ring:
			bodyLoc = [6, 7];

			break;
		case sdk.itemtype.Amulet:
			bodyLoc = 2;

			break;
		case sdk.itemtype.Boots:
			bodyLoc = 9;

			break;
		case sdk.itemtype.Gloves:
			bodyLoc = 10;

			break;
		case sdk.itemtype.Belt:
			bodyLoc = 8;

			break;
		case sdk.itemtype.Helm:
		case sdk.itemtype.PrimalHelm:
		case sdk.itemtype.Circlet:
		case sdk.itemtype.Pelt:
			bodyLoc = 1;

			break;
		case sdk.itemtype.Scepter:
		case sdk.itemtype.Wand:
		case sdk.itemtype.Staff:
		case sdk.itemtype.Bow:
		case sdk.itemtype.Axe:
		case sdk.itemtype.Club:
		case sdk.itemtype.Sword:
		case sdk.itemtype.Hammer:
		case sdk.itemtype.Knife:
		case sdk.itemtype.Spear:
		case sdk.itemtype.Polearm:
		case sdk.itemtype.Crossbow:
		case sdk.itemtype.Mace:
		case sdk.itemtype.ThrowingKnife:
		case sdk.itemtype.ThrowingAxe:
		case sdk.itemtype.Javelin:
		case sdk.itemtype.Orb:
		case sdk.itemtype.AmazonBow:
		case sdk.itemtype.AmazonSpear:
		case sdk.itemtype.AmazonJavelin:
		case sdk.itemtype.MissilePotion:
			bodyLoc = me.barbarian ? [4, 5] : 4;

			break;
		case sdk.itemtype.HandtoHand:
		case sdk.itemtype.AssassinClaw:
			bodyLoc = me.assassin ? [4, 5] : 4;

			break;
		default:
			return false;
		}

		!Array.isArray(bodyLoc) && (bodyLoc = [bodyLoc]);

		return bodyLoc;
	},

	autoEquipCheck: function (item) {
		if (!Config.AutoEquip) return true;

		let tier = NTIP.GetTier(item);
		let bodyLoc = this.getBodyLoc(item);

		if (tier > 0 && bodyLoc) {
			for (let i = 0; i < bodyLoc.length; i += 1) {
				// Low tier items shouldn't be kept if they can't be equipped
				if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.getFlag(0x10))) {
					return true;
				}
			}
		}

		// Sell/ignore low tier items, keep high tier
		if (tier > 0 && tier < 100) return false;

		return true;
	},

	// returns true if the item should be kept+logged, false if not
	autoEquip: function () {
		if (!Config.AutoEquip) return true;

		let items = me.findItems(-1, 0);

		if (!items) return false;

		function sortEq(a, b) {
			if (Item.canEquip(a)) return -1;
			if (Item.canEquip(b)) return 1;

			return 0;
		}

		me.cancel();

		// Remove items without tier
		for (let i = 0; i < items.length; i += 1) {
			if (NTIP.GetTier(items[i]) === 0) {
				items.splice(i, 1);

				i -= 1;
			}
		}

		while (items.length > 0) {
			items.sort(sortEq);

			let tier = NTIP.GetTier(items[0]);
			let bodyLoc = this.getBodyLoc(items[0]);

			if (tier > 0 && bodyLoc) {
				for (let j = 0; j < bodyLoc.length; j += 1) {
					// khalim's will adjustment
					if ([3, 7].indexOf(items[0].location) > -1 && tier > this.getEquippedItem(bodyLoc[j]).tier && this.getEquippedItem(bodyLoc[j]).classid !== 174) {
						if (!items[0].getFlag(0x10)) { // unid
							let tome = me.findItem(519, 0, 3);

							if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
								if (items[0].location === 7) {
									Town.openStash();
								}

								Town.identifyItem(items[0], tome);
							}
						}

						let gid = items[0].gid;
						console.log(items[0].name);

						if (this.equip(items[0], bodyLoc[j])) {
							Misc.logItem("Equipped", me.getItem(-1, -1, gid));
						}

						break;
					}
				}
			}

			items.shift();
		}

		return true;
	}
};
