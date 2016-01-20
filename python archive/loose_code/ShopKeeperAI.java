/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class ShopKeeperAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myEnemy;
    ShopKeeperCritter myShopKeeper;
    
    public ShopKeeperAI(ShopKeeperCritter c) {
        super(c);
        myShopKeeper = c;
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
        else if (myCritter.getHitPoints() < myCritter.getMaxHitPoints() &&myEnemy!=null) {
            return new FearfulAI(myCritter,myEnemy);
        }
        else if (current instanceof PathFollowingAI &&!current.isFinished())
            return current;
        else if (myCritter.getSquare().getFeatures().contains(myShopKeeper.getShop()))
            return new RandomWalkAI(myCritter);
        else {
            DungeonSquare d = myShopKeeper.getShop().randomInsideSquare();
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
