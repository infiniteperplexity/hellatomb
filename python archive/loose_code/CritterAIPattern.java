package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

//nothing for now
public abstract class CritterAIPattern{
    Critter myCritter;
    
    public CritterAIPattern(Critter c) {
        myCritter = c;
    }
    
    public void runAI() {
    }
}
