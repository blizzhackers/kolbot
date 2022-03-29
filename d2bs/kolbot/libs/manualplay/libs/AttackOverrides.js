/*
*	@filename	AttackOverrides.js
*	@author		theBGuy
*	@desc		Attack.js fixes to improve functionality for map mode
*/

if (!isIncluded("common/Attack.js")) { include("common/Attack.js"); }

Attack.init = function (notify = false) {
	if (Config.Wereform) {
		include("common/Attacks/wereform.js");
	} else if (Config.CustomClassAttack && FileTools.exists('libs/common/Attacks/' + Config.CustomClassAttack + '.js')) {
		print('Loading custom attack file');
		include('common/Attacks/' + Config.CustomClassAttack + '.js');
	} else {
		include("common/Attacks/" + sdk.charclass.nameOf(me.classid) + ".js");
	}

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		notify && print("ÿc1Bad attack config. Don't expect your bot to attack.");
	}

	if (me.expansion) {
		this.checkInfinity();
		this.getPrimarySlot();
	}
};

