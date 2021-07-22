/*
*	@filename	NTIPOverrides.js
*	@author		isid0re
*	@desc		NTIPItemParser fixes to improve functionality and custom looping for performance
*/

if (!isIncluded("NTItemParser.dbl")) {
	include("NTItemParser.dbl");
}

var NTIP_CheckListNoTier = [];

NTIP.GetCharmTier = NTIP.generateTierFunc('Charmtier');

NTIP.addLine = function (itemString) {
	let info = {
		line: 1,
		file: "SoloLeveling",
		string: line
	};

	let line = NTIP.ParseLineInt(itemString, info);

	if (line) {
		if (!itemString.toLowerCase().includes("tier")) {
			NTIP_CheckListNoTier.push(line);
		} else {
			NTIP_CheckListNoTier.push([false, false]);
		}

		NTIP_CheckList.push(line);
		stringArray.push(info);
	}

	return true;
};

NTIP.arrayLooping = function (arraytoloop) {
	for (let q = 0; q < arraytoloop.length; q += 1) {
		NTIP.addLine(arraytoloop[q]);
	}

	return true;
};

NTIP.OpenFile = function (filepath, notify) {
	if (!FileTools.exists(filepath)) {
		if (notify) {
			Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
		}

		return false;
	}

	var i, nipfile, line, lines, info, tick = getTickCount(), entries = 0,
		filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

	try {
		nipfile = File.open(filepath, 0);
	} catch (fileError) {
		if (notify) {
			Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
		}
	}

	if (!nipfile) {
		return false;
	}

	lines = nipfile.readAllLines();

	nipfile.close();

	for (i = 0; i < lines.length; i += 1) {
		info = {
			line: i + 1,
			file: filename,
			string: lines[i]
		};

		line = NTIP.ParseLineInt(lines[i], info);

		if (line) {
			entries += 1;

			NTIP_CheckList.push(line);

			if (!lines[i].toLowerCase().match("tier")) {
				NTIP_CheckListNoTier.push(line);
			} else {
				NTIP_CheckListNoTier.push([false, false]);
			}

			stringArray.push(info);
		}
	}

	if (notify) {
		print("ÿc4Loaded NIP: ÿc2" + filename + "ÿc4. Lines: ÿc2" + lines.length + "ÿc4. Valid entries: ÿc2" + entries + ". ÿc4Time: ÿc2" + (getTickCount() - tick) + " ms");
	}

	return true;
};

NTIP.ParseLineInt = function (input, info) {
	var i, property, p_start, p_end, p_section, p_keyword, p_result, value;

	p_end = input.indexOf("//");

	if (p_end !== -1) {
		input = input.substring(0, p_end);
	}

	input = input.replace(/\s+/g, "").toLowerCase();

	if (input.length < 5) {
		return null;
	}

	p_result = input.split("#");

	if (p_result[0] && p_result[0].length > 4) {
		p_section = p_result[0].split("[");

		p_result[0] = p_section[0];

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]") + 1;
			property = p_section[i].substring(0, p_end - 1);

			switch (property) {
			case 'color':
				p_result[0] += "item.getColor()";

				break;
			case 'type':
				p_result[0] += "item.itemType";

				break;
			case 'name':
				p_result[0] += "item.classid";

				break;
			case 'class':
				p_result[0] += "item.itemclass";

				break;
			case 'quality':
				p_result[0] += "item.quality";

				break;
			case 'flag':
				if (p_section[i][p_end] === '!') {
					p_result[0] += "!item.getFlag(";
				} else {
					p_result[0] += "item.getFlag(";
				}

				p_end += 2;

				break;
			case 'level':
				p_result[0] += "item.ilvl";

				break;
			case 'prefix':
				if (p_section[i][p_end] === '!') {
					p_result[0] += "!item.getPrefix(";
				} else {
					p_result[0] += "item.getPrefix(";
				}

				p_end += 2;

				break;
			case 'suffix':
				if (p_section[i][p_end] === '!') {
					p_result[0] += "!item.getSuffix(";
				} else {
					p_result[0] += "item.getSuffix(";
				}

				p_end += 2;

				break;
			case 'europe':
			case 'uswest':
			case 'useast':
			case 'asia':
				p_result[0] += '("' + me.realm.toLowerCase() + '"==="' + property.toLowerCase() + '")';

				break;
			case 'ladder':
				p_result[0] += "me.ladder";

				break;
			case 'hardcore':
				p_result[0] += "(!!me.playertype)";

				break;
			case 'classic':
				p_result[0] += "(!me.gametype)";

				break;
			default:
				Misc.errorReport("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);

				return false;
			}

			for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
				if (!NTIP.IsSyntaxInt(p_section[i][p_end])) {
					break;
				}
			}

			p_result[0] += p_section[i].substring(p_start, p_end);

			if (p_section[i].substring(p_start, p_end) === "=") {
				Misc.errorReport("Unexpected = at line " + info.line + " in " + info.file);

				return false;
			}

			for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
				if (NTIP.IsSyntaxInt(p_section[i][p_end])) {
					break;
				}
			}

			p_keyword = p_section[i].substring(p_start, p_end);

			if (isNaN(p_keyword)) {
				switch (property) {
				case 'color':
					if (NTIPAliasColor[p_keyword] === undefined) {
						Misc.errorReport("Unknown color: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasColor[p_keyword];

					break;
				case 'type':
					if (NTIPAliasType[p_keyword] === undefined) {
						Misc.errorReport("Unknown type: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasType[p_keyword];

					break;
				case 'name':
					if (NTIPAliasClassID[p_keyword] === undefined) {
						Misc.errorReport("Unknown name: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasClassID[p_keyword];

					break;
				case 'class':
					if (NTIPAliasClass[p_keyword] === undefined) {
						Misc.errorReport("Unknown class: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasClass[p_keyword];

					break;
				case 'quality':
					if (NTIPAliasQuality[p_keyword] === undefined) {
						Misc.errorReport("Unknown quality: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasQuality[p_keyword];

					break;
				case 'flag':
					if (NTIPAliasFlag[p_keyword] === undefined) {
						Misc.errorReport("Unknown flag: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasFlag[p_keyword] + ")";

					break;
				case 'prefix':
				case 'suffix':
					p_result[0] += "\"" + p_keyword + "\")";

					break;
				}
			} else {
				if (property === 'flag' || property === 'prefix' || property === 'suffix') {
					p_result[0] += p_keyword + ")";
				} else {
					p_result[0] += p_keyword;
				}
			}

			p_result[0] += p_section[i].substring(p_end);
		}
	} else {
		p_result[0] = "";
	}

	if (p_result[1] && p_result[1].length > 4) {
		p_section = p_result[1].split("[");
		p_result[1] = p_section[0];

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]");
			p_keyword = p_section[i].substring(0, p_end);

			if (isNaN(p_keyword)) {
				if (NTIPAliasStat[p_keyword] === undefined) {
					Misc.errorReport("Unknown stat: " + p_keyword + " File: " + info.file + " Line: " + info.line);

					return false;
				}

				p_result[1] += "item.getStatEx(" + NTIPAliasStat[p_keyword] + ")";
			} else {
				p_result[1] += "item.getStatEx(" + p_keyword + ")";
			}

			p_result[1] += p_section[i].substring(p_end + 1);
		}
	} else {
		p_result[1] = "";
	}

	if (p_result[2] && p_result[2].length > 0) {
		p_section = p_result[2].split("[");
		p_result[2] = {};

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]");
			p_keyword = p_section[i].substring(0, p_end);

			let keyword = p_keyword.toLowerCase();

			switch (keyword) {
			case "maxquantity":
				value = Number(p_section[i].split("==")[1].match(/\d+/g));

				if (!isNaN(value)) {
					p_result[2].MaxQuantity = value;
				}

				break;
			case "charmtier":
			case "merctier":
			case "tier":
				try {
					// p_result[2].Tier = function(item) { return value };
					p_result[2][keyword.charAt(0).toUpperCase() + keyword.slice(1)] = (new Function('return function(item) { return ' + p_section[i].split("==")[1] + ';}')).call(null); // generate function out of
				} catch (e) {
					Misc.errorReport("ÿc1Pickit Tier (" + keyword + ") error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);
				}

				break;
			default:
				Misc.errorReport("Unknown 3rd part keyword: " + p_keyword.toLowerCase() + " File: " + info.file + " Line: " + info.line);

				return false;
			}
		}
	}

	// Compile the line, to 1) remove the eval lines, and 2) increase the speed
	for (let i = 0, tmp; i < 2; i++) {
		tmp = p_result[i];

		if (p_result[i].length) {
			try {
				p_result[i] = (new Function('return function(item) { return ' + p_result[i] + ';}')).call(null); // generate function out of
			} catch (e) {
				Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);

				return null ; // failed load this line so return false
			}
		} else {
			p_result[i] = undefined;
		}

	}

	return p_result;
};
