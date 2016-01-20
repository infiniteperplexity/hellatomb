package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class PacifistMasterAI extends CritterMasterAI {
    
    
    public PacifistMasterAI(Critter c) {
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
                myActivePattern = mySubmissivePattern;
            }
        }
        else {
            if (this.inDanger()) {
                myActivePattern = myFleePattern;
            }
            else {
                myActivePattern = mySubmissivePattern;
            }
        }
        
        myActivePattern.runAI();
    }
        
    protected boolean inDanger() {
        int SAFEDISTANCE = 3;
        if (myCritter.distanceTo(myCritter.getEnemy())<=SAFEDISTANCE || myCritter.getLifePoints()<=(myCritter.getMaxLifePoints()/2))
            return true;
        else return false;
    }
}
