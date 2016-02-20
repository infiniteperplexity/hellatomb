/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



public class HearthSpiritAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myMaster;
    Critter myEnemy;
    HealingDiscipline myHealer;
    
    public HearthSpiritAI(Critter c, Critter m) {
        super(c);
        myMaster = m;
        m.addCritterListener(this);
    }
    
    public CritterAI nextAI(CritterAI current) {
        for (int i = 0; i < myCritter.getDisciplines().size(); i++) {
            if (myCritter.getDisciplines().get(i) instanceof HealingDiscipline)
                myHealer = (HealingDiscipline) myCritter.getDisciplines().get(i);
        }
        
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
        else if (myEnemy!=null && myCritter.distanceTo(myEnemy)==2)
            return new CritterFleeingAI(myCritter,myEnemy);
        else if (!(myCritter.canSee(myMaster)))
            return new PathSeekingAI(myCritter,myMaster);
        else if(myHealer.isReady() && myMaster.getHitPoints() < myMaster.getMaxHitPoints()) {
            myCritter.setMissileTarget(myMaster);
            myHealer.useDiscipline();
            return new DoNothingAI(myCritter);
        }
        else return new StayCloseAI(myCritter,myMaster); 
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
