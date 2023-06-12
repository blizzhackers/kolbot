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
    function doCubing(): void;
    function cursorCheck(): void;
    function openCube(): void;
    function closeCube(): void;
    function emptyCube(): void;
    function makeRevPots(): void;
  }
}
