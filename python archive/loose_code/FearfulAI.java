/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class FearfulAI extends CritterAI implements CritterListener{
    Critter scaryCritter;
    CritterFleeingAI critterFlee;

    public FearfulAI(Critter c, Critter t) {
        super(c);
        scaryCritter = t;
        scaryCritter.addCritterListener(this);
        critterFlee = new CritterFleeingAI(c,t);
    }
    
    public boolean isFinished() {
        //also maybe if the scaryCritter is far away?
        if (scaryCritter == null)
            return true;
        if (myCritter.getHitPoints()>myCritter.getMaxHitPoints()/3)
            return true;
        else return false;
    }
    
    public void runAI() {
        critterFlee.tryFlee();
    }
    
    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDeathEvent) {
            scaryCritter.removeCritterListener(this);
            scaryCritter = null;
       }
    }
    
}*/
