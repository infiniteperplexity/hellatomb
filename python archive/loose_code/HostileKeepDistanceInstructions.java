/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;

public class HostileKeepDistanceInstructions extends CritterInstructions{
    Critter me;
    Critter target;
    PathSeekingAI targetSeek;
    CritterFleeingAI critterFlee;
    TryDisciplineInstructions myBlinker;
    TryDisciplineInstructions myDisplacer;
    TryDisciplineInstructions myTimeStopper;
    
    public HostileKeepDistanceInstructions(Critter c, Critter t) {
        me = c;
        target = t;
        targetSeek = new PathSeekingAI(c,t);
        critterFlee = new CritterFleeingAI(c,t);
        myBlinker = new TryDisciplineInstructions(c,t,BlinkDiscipline.class);
        myDisplacer = new TryDisciplineInstructions(c,t,HexOfDisplacementDiscipline.class);
        myTimeStopper = new TryDisciplineInstructions(c,t,TimeStopDiscipline.class);
    }
    
    public boolean tryInstructions() {
        if (me.distanceTo(target) > 5) {
            targetSeek.runAI();
            return true;  
        }
        else if (me.distanceTo(target) <= 2) {
            if(myTimeStopper.tryInstructions())
                return true;  
            else if(myDisplacer.tryInstructions())
                return true;  
            else if(myBlinker.tryInstructions())
                return true;  
            else {
                critterFlee.tryFlee();
                return true;  
            }
        }
        else if (me.distanceTo(target) <= 4) {
            critterFlee.runAI();
            return true;  
        }
        else return false;
    }
}*/
