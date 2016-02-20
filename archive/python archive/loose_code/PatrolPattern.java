package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;

public class PatrolPattern extends CritterAIPattern{
    ArrayList myPath;
    
    public PatrolPattern(Critter c) {
        super(c);
    }
    
    public void runAI() {        
        DungeonSquare mySquare = myCritter.getSquare();
        
        ItemRoster myRoster = mySquare.getItemRoster();
        for (int i = myRoster.size()-1;i >= 0; i--) {
            Item myItem = myRoster.getItem(i);
            if (myItem.getWorth()>0)
                myCritter.pickUpItem(myItem);
        }
            
        DungeonSquare goalSquare;
        
        ArrayList myItems = myCritter.searchForItems();
        
        for (int i = myItems.size()-1; i>=0;i--) {
            Item myItem = (Item) myItems.get(i);
            if (myItem.getWorth()>0) {
                myCritter.walkTowards(myItem);
                return;
            }
        }
        
        if(myPath==null || !myPath.contains(mySquare) || mySquare == myPath.get(0)) {
            myPath = PathHandler.returnPath(myCritter,myCritter.getLevel().randomClearSquare());
        }
        if (myPath==null)
            myCritter.walkRandom();
        else {
            goalSquare = (DungeonSquare) myPath.get(myPath.indexOf(mySquare)-1);
            myCritter.walkTowards(goalSquare);
        }
    }
}
