package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;
//nothing for now
public class MeleeAttackPattern extends AttackPattern{
    ArrayList myDisciplines;
    ArrayList myMissiles;
    
    public MeleeAttackPattern(Critter c) {
        super(c);
        myDisciplines = new ArrayList();
    }
    
    public void runAI() {
        
        ItemRoster myRoster = myCritter.getSquare().getItemRoster();
        for (int i = myRoster.size()-1;i >= 0; i--) {
            Item myItem = myRoster.getItem(i);
            if (myItem.getWorth()>0)
                myCritter.pickUpItem(myItem);
        }
        
        myCritter.getDeckedOut();
        
        for (int i = myDisciplines.size()-1; i>=0;i--) {
            MysticDiscipline myDisc = (MysticDiscipline) myDisciplines.get(i);
            if (myDisc.tryDiscipline())
                return;
        }
        
        if (myCritter.tryMissiles())
            return;
       
        Critter myEnemy = myCritter.getEnemy();
        
        //a good place to search for items?
        ArrayList myItems = myCritter.searchForItems();
        for (int i = myItems.size()-1; i>=0;i--) {
            Item myItem = (Item) myItems.get(i);
            if (myItem.getWorth()>0 && myCritter.distanceTo(myEnemy) > myCritter.distanceTo(myItem)) {
                myCritter.walkTowards(myItem);
                return;
            }
        }
        
        if (myEnemy!=null)
            myCritter.walkAlongPath(myEnemy);
    }
    
    public void addDiscipline(MysticDiscipline d) {
        myDisciplines.add(d);
        //eventually I might want to add them in order of power, but not for now.
    }
    
    public void addMissile(MissileCasterItem m, AmmoItem a) {
    }
}
