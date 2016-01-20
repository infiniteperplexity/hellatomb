/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class DefaultCritterAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myEnemy;
    
    public DefaultCritterAI(Critter c) {
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
        else if (myCritter.getHitPoints() < myCritter.getMaxHitPoints()/3 &&myEnemy!=null) {
            return new FearfulAI(myCritter,myEnemy);
        }
        else if (current instanceof MeleeAssaultAI && !current.isFinished())
            return current;
        else if (myEnemy!=null && myCritter.canSee(myEnemy.getSquare()))
            return new MeleeAssaultAI(myCritter, myEnemy);
        else if (current instanceof PathFollowingAI && !current.isFinished())
            return current;
        else {
            DungeonSquare d = myCritter.getLevel().randomClearSquare();
            return new PathFollowingAI(myCritter, d);
        }
    }
    
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent || c instanceof CritterShakeTargetEvent) {
            myEnemy.removeCritterListener(this);
            myEnemy = null;
       }
    
       else if (c instanceof CritterPolymorphEvent) {
            CritterPolymorphEvent cp = (CritterPolymorphEvent) c;;
            myEnemy.removeCritterListener(this);
            myEnemy = null;
            //focusCritter = cp.getNewCritter();
            //focusCritter.addCritterListener(this);
       }
   }
}*/
