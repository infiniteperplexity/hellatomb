package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public abstract class CritterAI {
    Critter myCritter;
    boolean isDone;
    
    public CritterAI (Critter c) {
        myCritter = c;
        isDone = false;
    }
    
    public boolean isFinished() {
        if (false)
            return false;
        else return true;
    }
    
    public CritterAI nextAI(CritterAI current) {
        return this;
    }
    
    public void runAI() {
    }
    
    public void setAI(CritterAI newAI) {
    }
    
    public CritterAI getCurrentAI() {
        return null;
    }
    
    public void setCurrentAI(CritterAI newAI) {
    }
}
