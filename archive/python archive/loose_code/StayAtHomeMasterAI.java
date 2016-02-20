package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class StayAtHomeMasterAI extends CritterMasterAI {
    
    
    public StayAtHomeMasterAI(Critter c) {
        super(c);
    }
    
    public void runAI() {
        Critter myEnemy = myCritter.getEnemy();
        if (myEnemy==null || !myCritter.isHostile(myEnemy)) {
            Critter enemy = myCritter.searchForEnemy();
            if (enemy!=null)
                myCritter.setEnemy(enemy);
        }
        //if (myPack!= null)
            //do something cool;
        if (myCritter.getEnemy()==null) {
            if (myCritter.getMaster()==null) {
                myActivePattern = myWanderPattern;
            }
            else {
                myActivePattern = myWanderPattern;
            }
        }
        else {
            if (this.inDanger()) {
                myActivePattern = myFleePattern;
            }
            else {
                myActivePattern = myWanderPattern;
            }
        }
        
        myActivePattern.runAI();
    }
}
