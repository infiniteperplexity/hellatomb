package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class SleepingAI extends CritterAI implements CritterListener{
    boolean wokeUp;
    
    public SleepingAI (Critter c) {
        super(c);
        c.addCritterListener(this);
        wokeUp = false;
    }
    
    public boolean isFinished() {
        //doesn't seem to work!
        //if (DungeonDice.rollTheDice(1,100)==1)
          //  return true;
        return wokeUp;
    }

    public void runAI() {
        if (myCritter.getEnemy()!=null) {
            int n = DungeonDice.rollTheDice(1,6,0);
            if (n<=1) {
                wokeUp = true;
                if (ThePlayer.getInstance().canSee(myCritter.getSquare()))
                    GameFrame.getInstance().printText(myCritter.getName("The") + " wakes up.");
            }
        }
        
    }
    
    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDamagedEvent) {
            //sleepyCritter.removeCritterListener(this);
            System.out.println("critter took damage");
            wokeUp = true;
        }
        
    }
    
}
