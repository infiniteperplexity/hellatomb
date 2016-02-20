package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



//I think this is another one-step-at-a-timer
/*
import java.util.*;

public class PathSeekingAI extends CritterAI{
    SuperDungeonEntity d;
    PathHandler myHandler;

    public PathSeekingAI(Critter c, SuperDungeonEntity s) {
        super(c);
        d=s;
        myHandler = new PathHandler();
    }
    
    public void runAI() {
        DungeonSquare mySquare = myHandler.findSquareOnPath(myCritter.getSquare(), d.getSquare());
        SquareSeekingAI squareSeek = new SquareSeekingAI(myCritter, mySquare);
        squareSeek.runAI();
    }
    
}
*/