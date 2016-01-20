package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;

public class RangedAttackPattern extends AttackPattern{
    ArrayList escapeDisciplines;
    ArrayList attackDisciplines;
    int MAX;
    int MIN;
    int POINTBLANK;
    
    public RangedAttackPattern(Critter c) {
        super(c);
        attackDisciplines = new ArrayList();
        escapeDisciplines = new ArrayList();
        POINTBLANK = 2;
        MIN = 4;
        MAX = 7;
    }
    
    public void runAI() {
        Critter myEnemy = myCritter.getEnemy();
        if (myEnemy==null)
            return;
        
        ItemRoster myRoster = myCritter.getSquare().getItemRoster();
        for (int i = myRoster.size()-1;i >= 0; i--) {
            Item myItem = myRoster.getItem(i);
            if (myItem.getWorth()>0)
                myCritter.pickUpItem(myItem);
        }
        
        myCritter.getDeckedOut();
        
        //First: if the enemy is at point blank range, use the first available escape discipline
        if (myCritter.distanceTo(myEnemy)<= POINTBLANK) {
            for (int i = escapeDisciplines.size()-1;i>=0;i--) {
                MysticDiscipline myDisc = (MysticDiscipline) escapeDisciplines.get(i);
                if (myDisc.tryDiscipline())
                    return;
            }
        }
        //Then, if there are no attack disciplines ready, walk away
        //this works wrong A) if there are no attack disciplines and B) if the critter has missiles
        anyReady:
            for (int i = attackDisciplines.size()-1;i>=0;i--) {
                MysticDiscipline myDisc = (MysticDiscipline) attackDisciplines.get(i);
                if (!myDisc.isReady())
                    break anyReady;
                else if (i<=0)
                    myCritter.walkAway(myEnemy);
        }
        //Then, if the Critter is a long ways from the enemy, come closer
        if (myCritter.distanceTo(myEnemy)>= MAX && !myCritter.canSee(myEnemy))
            myCritter.walkAlongPath(myEnemy);
        //Otherwise if the critter is close, try to walk away
        else if (myCritter.distanceTo(myEnemy)<= MIN) {
            if (myCritter.walkAway(myEnemy))
                return;
        }
        //if the Critter couldn't walk away or was within its preferred range of distances, try attack disciplines, then missiles;
        for (int i = attackDisciplines.size()-1;i>=0;i--) {
            MysticDiscipline myDisc = (MysticDiscipline) attackDisciplines.get(i);
            if (myDisc.tryDiscipline())
               return;
        }
        if (myCritter.tryMissiles())
            return;
        
        //then search for items...is this the best place?
        ArrayList myItems = myCritter.searchForItems();
        for (int i = myItems.size()-1; i>=0;i--) {
            Item myItem = (Item) myItems.get(i);
            if (myItem.getWorth()>0 && myCritter.distanceTo(myEnemy) > myCritter.distanceTo(myItem)) {
                myCritter.walkTowards(myItem);
                return;
            }
        }
        //if none of the attack disciplines work (some can fail even if they are Ready), try to walk away or shoot a missile.
        if (myCritter.walkAway(myEnemy))
            return;
        if (myCritter.tryMissiles())
            return;
        //finally, if the Critter is pinned in the corner and the enemy has closed in, engage in melee
        else if (myCritter.distanceTo(myEnemy)<=POINTBLANK)
            myCritter.walkTowards(myEnemy);
    }
    
    public void addEscapeDiscipline(MysticDiscipline m) {
        escapeDisciplines.add(m);
    }
    
    public void addAttackDiscipline(MysticDiscipline m) {
        attackDisciplines.add(m);
    }
}
