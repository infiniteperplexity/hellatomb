/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import java.util.*;

public class QueenSpiderEggLayingAI extends CritterAI implements CritterListener{
    
    Critter targetCritter;
    CritterSeekingAI critterSeek;
    RandomWalkAI myRandomWalker;
    
    public QueenSpiderEggLayingAI(Criiter c,Critter t) {
        super(c);
        targetCritter = t;
        t.addCritterListener(this);
        critterSeek = new CritterSeekingAI(c,t);
        myRandomWalker = new RandomWalkAI(c);
    }
    
    public boolean isFinished(Critter c) {
        if (c.canSee(targetCritter.getSquare())==false)
            return true;
        else return false;
    }
        
    public void runAI(Critter c) {
        int n = DungeonDice.rollTheDice(1,4);
        if (n==1) {
            c.getSquare().addItem(new SpiderEggItem());
            System.out.println(c+" laid an egg.");
        }
        ArrayList distanceCheck = RayCaster.castRay(c.getSquare(), ThePlayer.getInstance().getSquare());
        if (distanceCheck.size()==2) {
            critterSeek.runAI(c);
        }
        else {
            myRandomWalker.runAI(c);
        }
    }  
   
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent) {
            targetCritter.removeCritterListener(this);
            targetCritter = null;
       }
    }
    
}*/
