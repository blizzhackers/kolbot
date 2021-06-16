/* Format:
	var CustomConfig = {
		"Config_Filename_Without_Extension": ["array", "of", "profiles"]

		Multiple entries are separated by commas


	};
*/

var CustomConfig;

if (getScript("D2BotMap.dbj")) {
	CustomConfig = {
		"ManualPlay": me.profile,
	};
}