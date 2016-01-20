/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class SubmissiveBreatherAI extends MasterCritterAI implements CritterListener{
    CritterAI myCurrentAI;
    Critter myMaster;
    Critter myEnemy;
    BreathWeapon myBreath;
    

    public SubmissiveBreatherAI(Critter c,Critter m) {
        super(c);
        myMaster = m;
        c.addCritterListener(this);
    }
    
    public CritterAI nextAI(CritterAI current) {
        LongCritter lc = (LongCritter) myCritter;
        if (myEnemy==null) {
            myEnemy = lc.getEnemy();
            if (myEnemy!=null)
                myEnemy.addCritterListener(this);
        }
        for (int i = 0; i < lc.getDisciplines().size(); i++) {
            if (lc.getDisciplines().get(i) instanceof BreathWeapon)
                myBreath = (BreathWeapon) lc.getDisciplines().get(i);
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
        
        else if (current instanceof SleepingAI&&!current.isFinished())
            return current;
        else if (myBreath!=null && myBreath.isReady() && myEnemy != null && lc.canSee(myEnemy.getSquare())) {
            if (lc.firstUnreeledSegment()==null) {
                lc.setMissileTarget(myEnemy);
                myBreath.useDiscipline();
                return new DoNothingAI(myCritter);
            }
            else return new SquareSeekingAI(myCritter, lc.firstUnreeledSegment());
        }
        //need to write a new fearful AI
        else if (current instanceof FearfulAI&&!current.isFinished())
            return current;
        else if (myEnemy!=null &&myCritter .getHitPoints() < myCritter.getMaxHitPoints()/3)
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
    }
    
}*/
