package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;
//nothing for now
public class StealingAttackPattern extends AttackPattern{
    ArrayList stealingDisciplines;
    ArrayList escapeDisciplines;
    int POINTBLANK;
    
    public StealingAttackPattern(Critter c) {
        super(c);
        stealingDisciplines = new ArrayList();
        escapeDisciplines = new ArrayList();
        POINTBLANK = 2;
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
        
        for (int i = stealingDisciplines.size()-1;i>=0;i--) {
            MysticDiscipline myDisc = (MysticDiscipline) stealingDisciplines.get(i);
            if (myDisc.isReady()) {
                myCritter.walkAlongPath(myEnemy);
                return;
            }
        }
        if (myCritter.distanceTo(myEnemy)<= POINTBLANK) {
            for (int i = escapeDisciplines.size()-1;i>=0;i--) {
                MysticDiscipline myDisc = (MysticDiscipline) escapeDisciplines.get(i);
                if (myDisc.tryDiscipline())
                    return;
            }
        }
        myCritter.walkAway(myEnemy);
    }
    
    public void addStealingDiscipline(MysticDiscipline d) {
        stealingDisciplines.add(d);
        //eventually I might want to add them in order of power, but not for now.
    }
    
    public void addEscapeDiscipline(MysticDiscipline d) {
        escapeDisciplines.add(d);
        //eventually I might want to add them in order of power, but not for now.
    }
}
