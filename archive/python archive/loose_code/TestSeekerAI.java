/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



import java.util.*;

public class TestSeekerAI extends CritterAI{
    Critter targetCritter;
    PathHandler myHandler;
    LinkedList myPath; 
    SquareSeekingAI squareSeek;
        
    public TestSeekerAI(Critter t) {
        targetCritter = t;
        myPath = new LinkedList();
        myHandler = new PathHandler();
    }
    
    public boolean isFinished(Critter c) {
        
        return false;
    }
        
    public void runAI(Critter c) {
        if (myPath.isEmpty() || myPath.size()==1) {
            myPath = myHandler.findSquaresPath(c.getSquare(), targetCritter.getSquare());
        }
        myPath.remove(myPath.size()-1);
        DungeonSquare mySquare = (DungeonSquare) myPath.get(myPath.size()-1);
        squareSeek = new SquareSeekingAI(mySquare);
        squareSeek.runAI(c);
    }    
}*/
