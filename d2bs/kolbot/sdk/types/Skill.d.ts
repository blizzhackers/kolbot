export {};
declare global {
	function SkillData(skillId: number): void;
	class SkillData {
			constructor(skillId: number);
			hardpoints: boolean;
			checked: boolean;
			manaCost: any;
			condition: Function;
			have(skill: number): any;
	}
	namespace Skill {
		let usePvpRange: boolean;
		const manaCostList: object;
		const needFloor: number[];
		const missileSkills: number[];
		const charges: any[];
		const haveTK: boolean;

		namespace skills {
			const all: {
				[x: number]: SkillData;
			};
			let initialized: boolean;
			function init(): void;
			function have(skill: number): boolean;
			function reset(): void;
		}
		function init(): void;
		function canUse(skillId: number): boolean;
		function getDuration(skillId: number): number;
		function getMaxSummonCount(skillId: number): number;
		function getRange(skillId: any): number;
		function getHand(skillId: any): number;
		function cast(skillId: number, hand?: number, x?: number, y?: number, item?: ItemUnit | undefined): boolean;
		function cast(skillId: number, hand?: number, unit?: Unit): boolean;
		function setSkill(skillId: any, hand?: any, item?: any): boolean;
		function isTimed(skillId: any): boolean;
		function wereFormCheck(skillId: any): boolean;
		function townSkill(skillId: any): boolean;
		function getManaCost(skillId: any): number;
		function useTK(unit: Unit): boolean;
	}
}
