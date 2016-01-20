/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class QueenOfSpidersAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myEnemy;
    

    public QueenOfSpidersAI(Critter c) {
        super(c);
    }
    
    public CritterAI nextAI(CritterAI current) {
        if (myEnemy==null) {
            myEnemy = myCritter.getEnemy();
            if (myEnemy!=null)
                myEnemy.addCritterListener(this);
        }
        
        if (current instanceof SleepingAI&&!current.isFinished())
            return current;
        else if (current instanceof FearfulAI&&!current.isFinished())
            return current;
        else if (myCritter.getHitPoints() < myCritter.getMaxHitPoints()/3)
            return new FearfulAI(ThePlayer.getInstance());
        else if (current instanceof QueenSpiderEggLayingAI&&!current.isFinished(c))
            return current;
        else if (c.canSee(ThePlayer.getInstance().getSquare()))
            return new QueenSpiderEggLayingAI(ThePlayer.getInstance());
        else return new QueenSpiderEggLayingAI(ThePlayer.getInstance());
    }
    
    public void runAI(Critter c) {        
        myCurrentAI = this.nextAI(c, myCurrentAI);
        myCurrentAI.runAI(c);
    }
    
    public void setAI(CritterAI newAI) {
        myCurrentAI = newAI;
    }
    
    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDeathEvent) {
            myEnemy.removeCritterListener(this);
            myEnemy = null;
       }
    }
    
}
*/