package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;
//nothing for now
public class FleePattern extends CritterAIPattern{
    ArrayList escapeDisciplines;
    ArrayList attackDisciplines;
    int POINTBLANK;
    
    public FleePattern(Critter c) {
        super(c);
        POINTBLANK = 2;
        escapeDisciplines = new ArrayList();
        attackDisciplines = new ArrayList();
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
        
        //First: if the enemy is at point blank range, use the first available escape discipline
        if (myCritter.distanceTo(myEnemy)<= POINTBLANK) {
            for (int i = escapeDisciplines.size()-1;i>=0;i--) {
                MysticDiscipline myDisc = (MysticDiscipline) escapeDisciplines.get(i);
                if (myDisc.tryDiscipline())
                    return;
            }
        }
        //try to walk away
        if (myCritter.walkAway(myEnemy))
            return;
        //if the Critter couldn't walk away, try attack disciplines, then missiles
        for (int i = attackDisciplines.size()-1;i>=0;i--) {
            MysticDiscipline myDisc = (MysticDiscipline) attackDisciplines.get(i);
            if (myDisc.tryDiscipline())
               return;
        }
        if (myCritter.tryMissiles())
            return;
        
        //is this a good place to try for items?
        ArrayList myItems = myCritter.searchForItems();
        for (int i = myItems.size()-1; i>=0;i--) {
            Item myItem = (Item) myItems.get(i);
            if (myItem.getWorth()>0 && myCritter.distanceTo(myEnemy) > myCritter.distanceTo(myItem)) {
                myCritter.walkTowards(myItem);
                return;
            }
        }
        //finally, if the Critter is pinned in the corner and the enemy has closed in, engage in melee
        if (myCritter.distanceTo(myEnemy)<=POINTBLANK)
            myCritter.walkTowards(myEnemy);
    }
    
    public void addEscapeDiscipline(MysticDiscipline d) {
        escapeDisciplines.add(d);
        //eventually I might want to add them in order of power, but not for now.
    }

    public void addAttackDiscipline(MysticDiscipline m) {
        attackDisciplines.add(m);
    }
}
