/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



public class SubmissiveAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myMaster;
    Critter myEnemy;
    

    public SubmissiveAI(Critter c, Critter m) {
        super(c);
        myMaster = m;
        m.addCritterListener(this);
    }
    
    public CritterAI nextAI(CritterAI current) {
        if (myEnemy==null) {
            myEnemy = myCritter.getEnemy();
            if (myEnemy!=null)
                myEnemy.addCritterListener(this);
        }
        
        if (myMaster==null) {
            myCritter.setMasterAI(new DefaultCritterAI(myCritter));
            return new RandomWalkAI(myCritter);
        }
        if (current instanceof SleepingAI&&!current.isFinished())
            return current;
        //need to write a new fearful AI
        else if (current instanceof FearfulAI&&!current.isFinished())
            return current;
        else if (myEnemy!=null &&myCritter.getHitPoints() < myCritter.getMaxHitPoints()/3)
            return new FearfulAI(myCritter,myEnemy);
        else if (current instanceof MeleeAssaultAI&&!current.isFinished())
            return current;
        else if (myEnemy!=null) {
            return new MeleeAssaultAI(myCritter,myEnemy);
        }
        //currently never gets used
        else if (current instanceof PathFindingAI&&!current.isFinished())
            return current;
        else if (!(myCritter.canSee(myMaster.getSquare()))) {
            return new PathSeekingAI(myCritter,myMaster);
            //return new PathFindingAI(ThePlayer.getInstance().getFeature());
        }
        else return new StayCloseAI(myCritter, myMaster); 

    }

    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDeathEvent) {
            if (c.getCritter()==myEnemy) {
                myEnemy.removeCritterListener(this);
                myEnemy = null;
            }
            else if (c.getCritter()==myMaster) {
                myMaster.removeCritterListener(this);
                myMaster = null;
            }    
       }
       else if (c instanceof CritterPolymorphEvent) {
           CritterPolymorphEvent cp = (CritterPolymorphEvent) c;
            if (cp.getCritter()==myEnemy) {
                myEnemy.removeCritterListener(this);
                myEnemy = null;
            }
            else if (cp.getCritter()==myMaster) {
                myMaster.removeCritterListener(this);
                cp.getNewCritter().addCritterListener(this);
                myMaster = cp.getNewCritter();
            }
       }
    }
}*/
