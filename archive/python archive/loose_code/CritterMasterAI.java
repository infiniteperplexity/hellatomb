package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class CritterMasterAI {
    Critter myCritter;
    //CritterPack myPack;
    CritterAIPattern myAttackPattern;
    CritterAIPattern myFleePattern;
    CritterAIPattern mySubmissivePattern;
    CritterAIPattern myWanderPattern;
    CritterAIPattern myPatrolPattern;
    
    CritterAIPattern myActivePattern;
    
    
    public CritterMasterAI(Critter c) {
        myCritter = c;
        myAttackPattern = new MeleeAttackPattern(c);
        myFleePattern = new FleePattern(c);
        mySubmissivePattern = new SubmissivePattern(c);
        myWanderPattern = new WanderPattern(c);
        myPatrolPattern = new PatrolPattern(c);
    }
    
    
    public void setAttackPattern(CritterAIPattern ap) {
        myAttackPattern = ap;
    }
    
    public void setFleePattern(CritterAIPattern ap) {
        myFleePattern = ap;
    }
    
    public void setSubmissivePattern(CritterAIPattern ap) {
        mySubmissivePattern = ap;
    }
    
    public void setWanderPattern(CritterAIPattern ap) {
        myWanderPattern = ap;
    }
    
    public void runAI() {
        int MAXDIST = 20;
        Critter myMaster = myCritter.getMaster();
        if (myMaster!=null && myCritter.isHostile(myMaster))
            myMaster = null;
        Critter myEnemy = myCritter.getEnemy();
        if (myEnemy==null || myCritter.distanceTo(myEnemy) > MAXDIST || !myCritter.isHostile(myEnemy)) {
            Critter enemy = myCritter.searchForEnemy();
            if (enemy!=null)
                myCritter.setEnemy(enemy);
        }
        
        //if (myPack!= null)
            //do something cool;
        if (myCritter.getEnemy()==null) {
            if (myCritter.getMaster()==null) {
                if (myActivePattern == null || myActivePattern == myWanderPattern)
                    myActivePattern = myWanderPattern;
                    //myActivePattern = myPatrolPattern;
                else myActivePattern = myPatrolPattern;
            }
            else {
                myActivePattern = mySubmissivePattern;
            }
        }
        else {
            if (this.inDanger()) {
                myActivePattern = myFleePattern;
            }
            else {
                myActivePattern = myAttackPattern;
            }
        }
        
        myActivePattern.runAI();
    }
    
    protected boolean inDanger() {
        if (myCritter.getLifePoints()<=((myCritter.getToughness()+myCritter.getWillPower())/3))
            return true;
        else return false;
    }
    public void setSubmissive(Critter c) {
            if (myCritter.getMaster()!=null)
                myCritter.getMaster().removeMinion(myCritter);
            myCritter.setMaster(c);
            myActivePattern = mySubmissivePattern;
            c.addMinion(myCritter);
    }
    public void setUndeadSubmissive(Critter c) {
        int newMinionValue = Math.max(myCritter.getXPLevel(),myCritter.getWillPower());
        int minionLevelDelta = c.getMinionsLevel() + newMinionValue- c.getWillPower();
        System.out.println("MinionLevelDelta: " + minionLevelDelta);
        //first try shedding minions to make room
        if (minionLevelDelta > 0) {
            c.tryReleasingMinions(minionLevelDelta);
            minionLevelDelta = c.getMinionsLevel() + newMinionValue- c.getWillPower();
        }
        //if there's still not enough, the creature goes insane
        if (minionLevelDelta > 0) {
            myCritter.sensoryEvent(c.getName("The") + " does not have the willpower to control " + myCritter.getName("the") + "!", 0, null);
            myCritter.sensoryEvent(myCritter.getName("The") + " has lost its mind!",0,null);
            myCritter.setForce(new CritterForce());
        }
        else {
            if (myCritter.getMaster()!=null)
                myCritter.getMaster().removeMinion(myCritter);
            myCritter.setMaster(c);
            myActivePattern = mySubmissivePattern;
            c.addMinion(myCritter);
        }
    }
}
