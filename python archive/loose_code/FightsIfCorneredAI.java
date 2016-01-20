/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class FightsIfCorneredAI extends FearfulAI {
    boolean didMove;

    public FightsIfCorneredAI(Critter c, Critter t) {
        super(c,t);
        didMove = true;
    }
    
    public boolean isFinished() {
        //also maybe if the scaryCritter is far away?
        if (myCritter.getHitPoints()>myCritter.getMaxHitPoints()/3 || scaryCritter==null || didMove==false)
            return true;
        else return false;
    }
    
    public void runAI() {
        //critterFlee.runAI(c);
        didMove = critterFlee.tryFlee();
    }
}*/
