/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class StayCloseAI extends CritterAI implements CritterListener{
    Critter myTarget;
    PathSeekingAI critterSeek;
    CritterFleeingAI critterFlee;
    RandomWalkAI randomWalk;

    public StayCloseAI(Critter c, Critter t) {
        super(c);
        randomWalk = new RandomWalkAI(c);
        critterSeek = new PathSeekingAI(c,t);
        critterFlee = new CritterFleeingAI(c,t);
        myTarget = t;
        myTarget.addCritterListener(this);
    }
    
    public boolean isFinished() {
        if (myTarget == null)
            return true;
        if (myCritter.canSee(myTarget.getSquare())==false)
            return true;
        else return false;
    }
    
    public void runAI() {
        int xChange = 0;
        int yChange = 0;
        if (myCritter.distanceTo(myTarget)<5)
            randomWalk.runAI();
        if (myCritter.distanceTo(myTarget)<=2 || (myCritter instanceof LongCritter && myCritter.distanceTo(myTarget)<=4) || (myCritter instanceof LargeCritter && myCritter.distanceTo(myTarget)<=3) || (myCritter instanceof BlobCritter && myCritter.distanceTo(myTarget)<=4))
            critterFlee.tryFlee();
        else critterSeek.runAI();
    }
              
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent) {
            myTarget.removeCritterListener(this);
            myTarget = null;
       }
    }
    
}*/
