package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class RandomWalkAI extends CritterAI{
    
    public RandomWalkAI(Critter c) {
        super(c);
    }
    
    public void runAI() {
        int n = DungeonDice.rollTheDice(1,8);
        switch(n) {
            case 1: myCritter.moveCritter(1,1);
                    break;
            case 2: myCritter.moveCritter(1,0);
                    break;
            case 3: myCritter.moveCritter(1,-1);
                    break;
            case 4: myCritter.moveCritter(0,-1);
                    break;
            case 5: myCritter.moveCritter(-1,-1);
                    break;
            case 6: myCritter.moveCritter(-1,0);
                    break;
            case 7: myCritter.moveCritter(-1,1);
                    break;
            case 8: myCritter.moveCritter(0,1);
                    break;  
        }
    }
}
