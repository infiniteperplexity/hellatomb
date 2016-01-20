/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class PatrolInstructions extends CritterInstructions{
    Critter me;
    SuperDungeonEntity target;

    public PatrolInstructions(Critter c, SuperDungeonEntity t) {
        me = c;
        target = t;
        specialInstructions.add(new SeekTargetInstructions(c,t));
    }
    
    public boolean tryInstructions() { 
        for (int i=specialInstructions.size()-1; i>=0;i--) {
                CritterInstructions ci = (CritterInstructions) specialInstructions.get(i);
                if (ci.tryInstructions())
                    return true;
        }
        return false;
    }
}*/
