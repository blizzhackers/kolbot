export {};
declare global {
	const Cubing: {
		init(): void
		buildGemList(): void
		getCube(): void
		buildRecipes(): void
		buildLists(): void
		clearSubRecipes(): void
		update(): void
		checkRecipe(recipe: any): void
		getRecipeNeeds(index: any): void
		checkItem(unit: any): boolean
		keepItem(unit: any): boolean
		validItem(unit: any, recipe: any): void
		doCubing(): void
		cursorCheck(): void
		openCube(): void
		closeCube(): void
		emptyCube(): void
		makeRevPots(): void
	}
}
