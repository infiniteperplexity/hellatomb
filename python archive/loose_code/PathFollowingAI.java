package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
/*import org.glenn.item.*;



//I think this is another one-step-at-a-timer

import java.util.*;

public class PathFollowingAI extends CritterAI{
    SuperDungeonEntity d;
    PathHandler myHandler;
    LinkedList myPath;

    public PathFollowingAI(Critter c, SuperDungeonEntity s) {
        super(c);
        d=s;
        myHandler = new PathHandler();
    }
    
    public boolean isFinished() {
        if(myPath == null || myPath.size()<2)
            return true;
        else return false;
    }
    
    public void runAI() {
        if (myPath ==null) {
            myPath = myHandler.findSquaresPath(myCritter.getSquare(), d.getSquare());
            if (myPath!=null && myPath.size()>1)
                myPath.remove(myPath.size()-1);
        }
        if (myPath!=null && myPath.size()>1) {
            DungeonSquare mySquare = (DungeonSquare) myPath.get(myPath.size()-1);
            myPath.remove(myPath.indexOf(mySquare));
            SquareSeekingAI squareSeek = new SquareSeekingAI(myCritter, mySquare);
            squareSeek.runAI();
        }
    }
    
}*/
