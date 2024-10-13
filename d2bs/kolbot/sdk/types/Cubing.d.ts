export {};
declare global {
  namespace Cubing {
    function init(): void;
    function buildGemList(): void;
    function getCube(): void;
    function buildRecipes(): void;
    function buildLists(): void;
    function clearSubRecipes(): void;
    function update(): void;
    function checkRecipe(recipe: any): void;
    function getRecipeNeeds(index: any): void;
    function checkItem(unit: any): boolean;
    function keepItem(unit: any): boolean;
    function validItem(unit: any, recipe: any): void;
    function doCubing(): boolean;
    function cursorCheck(): boolean;
    function openCube(): boolean;
    function closeCube(closeToStash: boolean): boolean;
    function emptyCube(): boolean;
    function makeRevPots(): void;
    function repairItem(item: ItemUnit): boolean;
  }
}
