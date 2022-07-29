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
		if (!item || item.type !== sdk.unittype.Item || !item.identified) return false;
		// Higher requirements
		if (item.getStat(sdk.stats.LevelReq) > me.getStat(sdk.stats.Level) || item.dexreq > me.getStat(sdk.stats.Dexterity) || item.strreq > me.getStat(sdk.stats.Strength)) return false;

		return true;
	},

	// Equips an item and throws away the old equipped item
	equip: function (item, bodyLoc) {
		if (!this.canEquip(item)) return false;

		// Already equipped in the right slot
		if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
		if (item.isInStash && !Town.openStash()) return false;

		for (let i = 0; i < 3; i += 1) {
			if (item.toCursor()) {
				clickItemAndWait(sdk.clicktypes.click.Left, bodyLoc);

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
		case sdk.items.type.Shield:
		case sdk.items.type.AuricShields:
		case sdk.items.type.VoodooHeads:
		case sdk.items.type.BowQuiver:
		case sdk.items.type.CrossbowQuiver:
			bodyLoc = sdk.body.LeftArm;

			break;
		case sdk.items.type.Armor:
			bodyLoc = sdk.body.Armor;

			break;
		case sdk.items.type.Ring:
			bodyLoc = [sdk.body.RingRight, sdk.body.RingLeft];

			break;
		case sdk.items.type.Amulet:
			bodyLoc = sdk.body.Neck;

			break;
		case sdk.items.type.Boots:
			bodyLoc = sdk.body.Feet;

			break;
		case sdk.items.type.Gloves:
			bodyLoc = sdk.body.Gloves;

			break;
		case sdk.items.type.Belt:
			bodyLoc = sdk.body.Belt;

			break;
		case sdk.items.type.Helm:
		case sdk.items.type.PrimalHelm:
		case sdk.items.type.Circlet:
		case sdk.items.type.Pelt:
			bodyLoc = sdk.body.Head;

			break;
		case sdk.items.type.Scepter:
		case sdk.items.type.Wand:
		case sdk.items.type.Staff:
		case sdk.items.type.Bow:
		case sdk.items.type.Axe:
		case sdk.items.type.Club:
		case sdk.items.type.Sword:
		case sdk.items.type.Hammer:
		case sdk.items.type.Knife:
		case sdk.items.type.Spear:
		case sdk.items.type.Polearm:
		case sdk.items.type.Crossbow:
		case sdk.items.type.Mace:
		case sdk.items.type.ThrowingKnife:
		case sdk.items.type.ThrowingAxe:
		case sdk.items.type.Javelin:
		case sdk.items.type.Orb:
		case sdk.items.type.AmazonBow:
		case sdk.items.type.AmazonSpear:
		case sdk.items.type.AmazonJavelin:
		case sdk.items.type.MissilePotion:
			bodyLoc = me.barbarian ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;

			break;
		case sdk.items.type.HandtoHand:
		case sdk.items.type.AssassinClaw:
			bodyLoc = me.assassin ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;

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
				if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.getFlag(sdk.items.flags.Identified))) {
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

		let items = me.findItems(-1, sdk.items.mode.inStorage);

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
					const equippedItem = this.getEquippedItem(bodyLoc[j]);
					if (items[0].isInStorage && tier > equippedItem.tier && equippedItem.classid !== sdk.items.quest.KhalimsWill) {
						if (!items[0].identified) {
							let tome = me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

							if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
								items[0].isInStash && Town.openStash();
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
