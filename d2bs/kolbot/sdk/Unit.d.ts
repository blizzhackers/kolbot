/*************************************
 *          Unit description         *
 *          Needs expansion          *
 *************************************/
type ItemType = 4;
declare class Item extends Unit {
    public type: ItemType;
    getFlags() :number;
    getFlag(flag: number) :boolean;
    shop():boolean;
    getItemCost() :number;
}

type UnitType = 0 | 1 | 2 | 3 | 4 | 5;
type MonsterType = 1;

declare class Monster extends Unit{
    public type: MonsterType;
    getEnchant(type: number):boolean;
}

declare class Merc extends Monster{

}
declare class Unit {
    type : UnitType;
    getNext() : Unit|false;
    cancel() : void;
    repair() : boolean;
    useMenu() : boolean;
    interact() : boolean;
    interact(area: number) : boolean;
    getItem(classId?: number,mode?: number, unitId?: number) : Unit|false;
    getItem(name?: string,mode?: number, unitId?: number) : Unit|false;
    getItems() : Item[]|false;
    getMerc() : Merc ;
    getMercHP() : number| false;

    // me.getSkill(0-4); //
    getSkill(type: 0|1|2|3|4) : number;
    getSkill(skillId: number,type: 0 | 1, item?: Item) : number;

    getParent() : Unit|false ;
    overhead(msg: string) : void ;

    getStat(index: number,subid?: number):number[]|number|false ;
    getState(index: number,subid?: number):number[]|number|false ;

    setSkill() ;
    move(x: number, y: number) ;
    getQuest(quest:number, subid: number) ;
    getMinionCount() : number ;
}

declare class me {
    revive() : void;
    getRepairCost() :number;
}

