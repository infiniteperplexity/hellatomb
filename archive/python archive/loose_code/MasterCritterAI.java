package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public abstract class MasterCritterAI {
    CritterAI myCurrentAI;
    Critter myCritter;
    /** Creates a new instance of MasterCritterAI */
    public MasterCritterAI(Critter c) {
        myCritter = c;
    }
    
    public CritterAI nextAI(CritterAI current) {
        return current;
    }
    
    public void runAI() {
        myCurrentAI = this.nextAI(myCurrentAI);
        myCurrentAI.runAI();
    }
    
    public void setAI(CritterAI newAI) {
        myCurrentAI = newAI;
    }
    
    public CritterAI getCurrentAI() {
        return myCurrentAI;
    }
    
    public void setCritter(Critter c) {
        myCritter = c;
    }
    
}
