package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
/*import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import org.glenn.images.GameImages;
import java.awt.*;

public class RogueAssaultAI extends CritterAI implements CritterListener{
    Critter targetCritter;
    PathSeekingAI critterSeek;
    CritterFleeingAI critterFlee;
    StealItemDiscipline myStealer;
    
    public RogueAssaultAI(Critter c, Critter t) {
        super(c);
        targetCritter = t;
        t.addCritterListener(this);
        critterSeek = new PathSeekingAI(c,t);
        critterFlee= new CritterFleeingAI(c,t);
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof StealItemDiscipline)
                myStealer = (StealItemDiscipline) c.getDisciplines().get(i);
        } 
    }
    
    public boolean isFinished() {
        if(targetCritter==null)
            return true;
        if (myCritter.canSee(targetCritter.getSquare())==false)
            return true;
        else return false;
    }
        
    public void runAI() {
        if(myStealer.isReady()) {
            if (myCritter.distanceTo(targetCritter.getSquare())>2) {
                critterSeek.runAI();
                if (myCritter.getSquare().isVisible()) {
                    for(int wait = 0; wait<100;wait++);
                        GameFrame.getInstance().paintAt(myCritter.getSquare().getXCoord(),myCritter.getSquare().getYCoord(),GameImages.getImage("greenOrcRogue.GIF"));
                }
            }
        //not an "else", this is intentional
            if(myCritter.distanceTo(targetCritter.getSquare())<=2) {
                myCritter.setMissileTarget(targetCritter);
                myStealer.useDiscipline();
            }
        }
        //fights back if cornered and can't steal
        else if(!critterFlee.tryFlee() && myCritter.distanceTo(targetCritter)<=2)
            critterSeek.runAI();
    }  
    
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent) {
            targetCritter.removeCritterListener(this);
            targetCritter = null;
       }
    }
    
    
}*/
