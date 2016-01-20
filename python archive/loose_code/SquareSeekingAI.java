package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



//one-stepper
public class SquareSeekingAI extends CritterAI {
    DungeonSquare j;
    /** Creates a new instance of SquareSeekingAI */
    public SquareSeekingAI(Critter c, DungeonSquare ds) {
        super(c);
        j=ds;
    }
    
    public void runAI() {
        int xChange = 0;
        int yChange = 0;
        if(myCritter.getXCoord() > j.getXCoord()) {
            xChange = -1;}
        if(myCritter.getXCoord() < j.getXCoord()) {
            xChange = 1;}
        if(myCritter.getYCoord() > j.getYCoord()) {
            yChange = -1;}
        if(myCritter.getYCoord() < j.getYCoord()) {
            yChange = 1;}
        
        //"wiggle" should proceed in a more nuanced fashion
        /*if (c.moveCritter(xChange, yChange)) {}
        else if (c.moveCritter(xChange, 0)) {}
        else if (c.moveCritter(0, yChange)) {}
        else if (c.moveCritter(1, yChangDungeonSquare de)) {} 
        else if (c.moveCritter(-1, yChange)) {} 
        else if (c.moveCritter(xChange, 1)) {}
        else if (c.moveCritter(xChange, -1)) {}*/

        if (myCritter instanceof LargeCritter) {
        if (myCritter.moveCritter(xChange, yChange)) {}
        else if (xChange*yChange!=0) {
            if (myCritter.moveCritter(-xChange, -yChange)) {}
            else if (myCritter.moveCritter(0, -yChange)) {}
            else if (myCritter.moveCritter(-xChange, 0)) {}
            else if (myCritter.moveCritter(xChange, 0)) {}
            else if (myCritter.moveCritter(0, yChange)) {}
            else if (myCritter.moveCritter(xChange, -yChange)) {}
            else if (myCritter.moveCritter(-xChange, yChange)) {}
            
        }
        else if (xChange != 0) {
            if (myCritter.moveCritter(-xChange, 1)) {}
            else if (myCritter.moveCritter(-xChange, -1)) {}
            else if (myCritter.moveCritter(xChange, 1)) {}
            else if (myCritter.moveCritter(xChange, -1)) {}
            else if (myCritter.moveCritter(0, 1)) {}
            else if (myCritter.moveCritter(0, -1)) {}
            else if (myCritter.moveCritter(-xChange, 0)) {}
            
        }
        else if (yChange != 0) {
            if (myCritter.moveCritter(1, -yChange)) {}
            else if (myCritter.moveCritter(-1, -yChange)) {}
            else if (myCritter.moveCritter(1, yChange)) {}
            else if (myCritter.moveCritter(-1, yChange)) {}
            else if (myCritter.moveCritter(1, 0)) {}
            else if (myCritter.moveCritter(-1, 0)) {}
            else if (myCritter.moveCritter(0,  -yChange)) {}  
        }
    }
        else {
        if (myCritter.moveCritter(xChange, yChange)) {}
        else if (xChange*yChange!=0) {
            if (myCritter.moveCritter(xChange, 0)) {}
            else if (myCritter.moveCritter(0, yChange)) {}
            else if (myCritter.moveCritter(xChange, -yChange)) {}
            else if (myCritter.moveCritter(-xChange, yChange)) {}
            else if (myCritter.moveCritter(0, -yChange)) {}
            else if (myCritter.moveCritter(-xChange, 0)) {}
            else if (myCritter.moveCritter(-xChange, -yChange)) {}
        }
        else if (xChange != 0) {
            if (myCritter.moveCritter(xChange, 1)) {}
            else if (myCritter.moveCritter(xChange, -1)) {}
            else if (myCritter.moveCritter(0, 1)) {}
            else if (myCritter.moveCritter(0, -1)) {}
            else if (myCritter.moveCritter(-xChange, 1)) {}
            else if (myCritter.moveCritter(-xChange, -1)) {}
            else if (myCritter.moveCritter(-xChange, 0)) {}
        }
        else if (yChange != 0) {
            if (myCritter.moveCritter(1, yChange)) {}
            else if (myCritter.moveCritter(-1, yChange)) {}
            else if (myCritter.moveCritter(1, 0)) {}
            else if (myCritter.moveCritter(-1, 0)) {}
            else if (myCritter.moveCritter(1, -yChange)) {}
            else if (myCritter.moveCritter(-1, -yChange)) {}
            else if (myCritter.moveCritter(0,  -yChange)) {}
        }
    }
    }
}
  
