package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class CowardlyMasterAI extends CritterMasterAI{

    
    
    public CowardlyMasterAI(Critter c) {
        super(c);
    }
    

    
    public void runAI() {
        if (myCritter.getEnemy()==null) {
            Critter enemy = myCritter.searchForEnemy();
            if (enemy!=null)
                myCritter.setEnemy(enemy);
        }
        
        if (myCritter.getEnemy()==null) {
            if (myCritter.getMaster()==null) {
                myActivePattern = myWanderPattern;
            }
            else {
                myActivePattern = mySubmissivePattern;
            }
        }
        else {
                myActivePattern = myFleePattern;
        }
        
        myActivePattern.runAI();
    }
}
