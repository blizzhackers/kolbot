/**
 *	@filename	ClassicChaosAssistant.js
 *	@author		YGM
 *	@desc		Assistant to help sorcs in public chaos runs games on classic.
 */
function Idle() {
	let stargo, infgo, seisgo, vizgo, infseal, seisseal, vizseal, diablopickup, normalpickup = false;

	addEventListener("keyup",
		function (key) {
			switch (key) {
			case 97: // Numpad 1
				stargo = true;
					
				break;
			case 98: // Numpad 2
				infgo = true;
					
				break;
			case 99: // Numpad 3
				infseal = true;
					
				break;
			case 100: // Numpad 4
				seisgo = true;
					
				break;
			case 101: // Numpad 5
				seisseal = true;
					
				break;
			case 102: // Numpad 6
				vizgo = true;
					
				break;
			case 103: // Numpad 7
				vizseal = true;
					
				break;
			case 104: // Numpad 8 (Open last seal, teleport to star and pickup for 30 seconds)
				diablopickup = true;
					
				break;
			case 105: // Numpad 9 (Pickup at current location)
				normalpickup = true;
					
				break;
			default:
				break;
			}
		});

	while (true) {
		if (stargo) {
			if (me.area === 107) {
				Precast.doPrecast(true);
				Pather.moveToPreset(108, 2, 255);
				Common.Diablo.initLayout();
				break;
			}
			stargo = false;
		}

		if (infgo) {
			if (me.area === 108) {
				Common.Diablo.infLayout === 1 ? Pather.moveTo(7893, 5306) : Pather.moveTo(7929, 5294);
				Pather.makePortal();
				say("Infector of Souls TP Up!");
			}
			infgo = false;
		}

		if (seisgo) {
			if (me.area === 108) {
				Common.Diablo.seisLayout === 1 ? Pather.moveTo(7773, 5191) : Pather.moveTo(7794, 5189);
				Pather.makePortal();
				say("Lord De Seis TP Up!");
			}
			seisgo = false;
		}

		if (vizgo) {
			if (me.area === 108) {
				Common.Diablo.vizLayout === 1 ? Pather.moveTo(7681, 5302) : Pather.moveTo(7675, 5305);
				Pather.makePortal();
				say("Grand Vizier of Chaos TP Up!");
			}
			vizgo = false;
		}

		if (infseal) {
			if (me.area === 108) {
				Common.Diablo.openSeal(393);
				Common.Diablo.openSeal(392);
				say("Infector of Souls spawned!");
				Common.Diablo.infLayout === 1 ? Pather.moveTo(7893, 5306) : Pather.moveTo(7929, 5294);
			}
			infseal = false;
		}

		if (seisseal) {
			if (me.area === 108) {
				Common.Diablo.openSeal(394);
				say("Lord De Seis spawned!");
				Common.Diablo.seisLayout === 1 ? Pather.moveTo(7773, 5191) : Pather.moveTo(7794, 5189);
			}
			seisseal = false;
		}

		if (vizseal) {
			if (me.area === 108) {
				Common.Diablo.openSeal(396);
				say("Grand Vizier of Chaos spawned!");
				Common.Diablo.vizLayout === 1 ? Pather.moveTo(7681, 5302) : Pather.moveTo(7675, 5305);
			}
			vizseal = false;
		}

		if (diablopickup) {
			if (me.area === 108) {
				Common.Diablo.openSeal(395);
				Pather.moveToPreset(108, 2, 255);
				for (let i = 0; i < 300; i += 1) {
					Pickit.pickItems();
					delay(100);
				}
			}
			diablopickup = false;
		}

		if (normalpickup) {
			if (me.area === 108) {
				Pickit.pickItems();
			}
			normalpickup = false;
		}

		delay(10);
	}
}
