/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class JunctionSeekingAI extends CritterAI {
    
    DungeonJunction j;
    
    public JunctionSeekingAI(Critter c, DungeonJunction dj) {
        super(c);
        j=dj;
    }
    
    public void runAI() {
        System.out.println("seeking a junction");
        int xChange = 0;
        int yChange = 0;
        if(myCritter.getXCoord() > j.getAnchorX()) {
            xChange = -1;}
        if(myCritter.getXCoord() < j.getAnchorX()) {
            xChange = 1;}
        if(myCritter.getYCoord() > j.getAnchorY()) {
            yChange = -1;}
        if(myCritter.getYCoord() < j.getAnchorY()) {
            yChange = 1;}
        boolean didMove = myCritter.moveCritter(xChange, yChange);
        if (!didMove)
            didMove = myCritter.moveCritter(xChange, 0);
        if (!didMove)
            didMove = myCritter.moveCritter(0, yChange);
        if (!didMove)
            didMove = myCritter.moveCritter(1, yChange); 
        if (!didMove)
            didMove = myCritter.moveCritter(-1, yChange); 
        if (!didMove)
            didMove = myCritter.moveCritter(xChange, 1); 
        if (!didMove)
            didMove = myCritter.moveCritter(xChange, -1);
    }
}
*/
