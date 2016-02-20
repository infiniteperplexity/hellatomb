/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



import java.util.*;

public class RogueMasterAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myEnemy;
    

    public RogueMasterAI(Critter c) {
        super(c);
    }
    
    public CritterAI nextAI(CritterAI current) {
        if (myEnemy==null) {
            myEnemy = myCritter.getEnemy();
            if (myEnemy!=null)
                myEnemy.addCritterListener(this);
        }
        //pick up all non-corpse items;
        ArrayList tempArray=new ArrayList();
        for(int i=0; i<myCritter.getSquare().getItemRoster().size();i++) {
            if(!(myCritter.getSquare().getItemRoster().get(i) instanceof CorpseItem))
                tempArray.add(myCritter.getSquare().getItemRoster().get(i));      
        }
        for(int i=0; i<tempArray.size();i++) {
            myCritter.pickUpItem((Item) tempArray.get(i));     
        }
        
        if (current instanceof SleepingAI&&!current.isFinished())
            return current;
        else if (current instanceof FearfulAI&&!current.isFinished())
            return current;
        else if (myCritter.getHitPoints() < myCritter.getMaxHitPoints()/3 &&myEnemy!=null)
            return new FearfulAI(myCritter,myEnemy);
        else if (current instanceof RogueAssaultAI&&!current.isFinished())
            return current;
        else if (myEnemy!=null && myCritter.canSee(myEnemy.getSquare()))
            return new RogueAssaultAI(myCritter,myEnemy);
        else if (current instanceof PathFollowingAI && !current.isFinished())
            return current;
        else {
            DungeonSquare d = myCritter.getLevel().randomClearSquare();
            return new PathFollowingAI(myCritter, d);
        }
    }
    
    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDeathEvent) {
            c.getCritter().removeCritterListener(this);
            myEnemy=null;
       }
    }
    
}*/
