/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



//one step at a time

public class CritterSeekingAI extends CritterAI {
    Critter targetCritter;
    
    public CritterSeekingAI(Critter t) {
        super(c);
        targetCritter = t;
    }
    
    public void runAI(Critter c) {
        int xChange = 0;
        int yChange = 0;
        if(c.getXCoord() > targetCritter.getXCoord()) {
            xChange = -1;}
        if(c.getXCoord() < targetCritter.getXCoord()) {
            xChange = 1;}
        if(c.getYCoord() > targetCritter.getYCoord()) {
            yChange = -1;}
        if(c.getYCoord() < targetCritter.getYCoord()) {
            yChange = 1;}
        
        boolean didMove = c.moveCritter(xChange, yChange);
        if (!didMove)
            didMove = c.moveCritter(xChange, 0);
        if (!didMove)
            didMove = c.moveCritter(0, yChange);
        if (!didMove)
            didMove = c.moveCritter(1, yChange); 
        if (!didMove)
            didMove = c.moveCritter(-1, yChange); 
        if (!didMove)
            didMove = c.moveCritter(xChange, 1); 
        if (!didMove)
            didMove = c.moveCritter(xChange, -1);
    }
}
         */  
    
