/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import java.util.*;

public class old_ArcherAssaultAI extends CritterAI implements CritterListener{
    Critter targetCritter;
    PathSeekingAI critterSeek;
    CritterFleeingAI critterFlee;
    MissileCasterItem myCaster;
    ArrowsItem myArrows;
    
    public old_ArcherAssaultAI(Critter c, Critter t) {
        super(c);
        targetCritter = t;
        t.addCritterListener(this);
        c.setMissileTarget(t);
        critterSeek = new PathSeekingAI(c,t);
        critterFlee = new CritterFleeingAI(c,t);
        myCaster = c.getEquipment().getBow();
        myArrows = c.getEquipment().getArrows();
    }
    
    
    
    public boolean isFinished() {
        
        if (targetCritter==null)
            return true;
        else if (myCritter.canSee(targetCritter.getSquare())==false) {
            return true;
        }
        else return false;
    }
    
    public void runAI() {
        //should know how to pick up arrows
        if (myCritter.canSee(targetCritter.getSquare())) {
            if (myCritter.distanceTo(targetCritter) > 5)
                critterSeek.runAI();
            else if (myCritter.distanceTo(targetCritter) <= 2)
                critterSeek.runAI();
            else if (myCritter.distanceTo(targetCritter) <= 4) {
                //note: doing this test runs the routine!  this is intentional.
                if(!critterFlee.tryFlee()) {
                    myCaster.fireMissile(myCritter,myArrows.takeAmmo(1),myCritter.getTargetSquare());
                GameFrame.getInstance().printText(myCritter.getName("The") + " fires an arrow at " + targetCritter.getName("the"));
                }
                    
            }
            else {
                myCaster.fireMissile(myCritter,myArrows.takeAmmo(1),myCritter.getTargetSquare());
                GameFrame.getInstance().printText(myCritter.getName("The") + " fires an arrow at " + targetCritter.getName("the"));
            }
        }
    }  
    
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent || c instanceof CritterShakeTargetEvent) {
            targetCritter.removeCritterListener(this);
            targetCritter = null;
       }
    
       else if (c instanceof CritterPolymorphEvent) {
            targetCritter.removeCritterListener(this);
            targetCritter = null;  
       }
    }
}*/
