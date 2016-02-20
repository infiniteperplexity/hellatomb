package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class FleeTargetInstructions extends CritterInstructions{
    Critter me;
    Critter target;
    CritterFleeingAI targetFlee;
    
    public FleeTargetInstructions(Critter c, Critter t) {
        me = c;
        target = t;
        targetFlee = new CritterFleeingAI(c,t);
    }
    
    public boolean tryInstructions() {
        targetFlee.tryFlee();
        return true;
    }
}
