package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;
//nothing for now
public class SubmissivePattern extends CritterAIPattern{
    ArrayList myDisciplines;
    int MAX;
    int MIN;
    
    public SubmissivePattern(Critter c) {
        super(c);
        myDisciplines = new ArrayList();
        MAX = 5;
        MIN = 2;
        if (c instanceof LargeCritter && c instanceof LongCritter && c instanceof BlobCritter) {
            MAX=6;
            MIN=4;
        }
    }
    
    public void runAI() { 
        
        //haven't decided whether it should keep weapons and equip them;
        
        Critter myMaster = myCritter.getMaster();
        if (myMaster!=null && myMaster.getLevel()!=myCritter.getLevel()) {
            myCritter.walkRandom();
            return;
        }
            
            if (myMaster==null) {
                System.out.println("How dare you say you have no master!");
                return;
            }
        
        if (myCritter.distanceTo(myMaster)>2) {
            ItemRoster myRoster = myCritter.getSquare().getItemRoster();
            for (int i = myRoster.size()-1;i >= 0; i--) {
                Item myItem = myRoster.getItem(i);
                if (myItem.getWorth()>0 )
                    myCritter.pickUpItem(myItem);
            }
        }
        
        for (int i = myDisciplines.size()-1; i>=0;i--) {
            MysticDiscipline myDisc = (MysticDiscipline) myDisciplines.get(i);
            if (myDisc.tryDiscipline())
                return;
        }
        
        ArrayList myItems = myCritter.searchForItems(); 
        for (int i = myItems.size()-1; i>=0;i--) {
            Item myItem = (Item) myItems.get(i);
            if (myItem.getWorth()>0 && myItem.distanceTo(myMaster) > 2) {
                myCritter.walkTowards(myItem);
                return;
            }
        }
        
        ItemRoster myInventory = myCritter.getInventory();
        if (!myInventory.isEmpty()) {
            if (myCritter.distanceTo(myMaster)==2 && !myCritter.getSquare().getTerrain().blocksWalkers()) {
                myCritter.dropAllItems();
            }
            else myCritter.walkAlongPath(myMaster);
            return;
        }

        if (myCritter.distanceTo(myMaster) >= MAX) {
            myCritter.walkAlongPath(myMaster);
        }
        else if (myCritter.distanceTo(myMaster) <= MIN) {
                myCritter.walkAway(myMaster);
        }
        else {
            myCritter.walkRandom();
        }
    }
    
    public void addDiscipline(MysticDiscipline d) {
        myDisciplines.add(d);
        //eventually I might want to add them in order of power, but not for now.
    }
}
