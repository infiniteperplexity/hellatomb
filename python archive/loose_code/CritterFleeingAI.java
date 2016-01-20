package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class CritterFleeingAI extends CritterAI{
    
    Critter targetCritter;
    
    public CritterFleeingAI(Critter c, Critter t) {
        super(c);
        targetCritter = t;
    }
    
    public void runAI() {
        int xChange = 0;
        int yChange = 0;
        if(myCritter.getXCoord() > targetCritter.getXCoord()) {
            xChange = 1;}
        if(myCritter.getXCoord() < targetCritter.getXCoord()) {
            xChange = -1;}
        if(myCritter.getYCoord() > targetCritter.getYCoord()) {
            yChange = 1;}
        if(myCritter.getYCoord() < targetCritter.getYCoord()) {
            yChange = -1;}
        
        if (myCritter.moveCritter(xChange, yChange)) {}
        else if (xChange*yChange!=0) {
            if (myCritter.moveCritter(xChange, 0)) {}
            else if (myCritter.moveCritter(0, yChange)) {}
        }
        else if (xChange != 0) {
            if (myCritter.moveCritter(xChange, 1)) {}
            else if (myCritter.moveCritter(xChange, -1)) {}
            else if (myCritter.moveCritter(0, 1)) {}
            else if (myCritter.moveCritter(0, -1)) {}
        }
        else if (yChange != 0) {
            if (myCritter.moveCritter(1, yChange)) {}
            else if (myCritter.moveCritter(-1, yChange)) {}
            else if (myCritter.moveCritter(1, 0)) {}
            else if (myCritter.moveCritter(-1, 0)) {}
        }
    }
    
    public boolean tryFlee() {
        if(myCritter instanceof LongCritter)
            return this.longCritterFlee((LongCritter)myCritter);
        int xChange = 0;
        int yChange = 0;
        if(myCritter.getXCoord() > targetCritter.getXCoord()) {
            xChange = 1;}
        if(myCritter.getXCoord() < targetCritter.getXCoord()) {
            xChange = -1;}
        if(myCritter.getYCoord() > targetCritter.getYCoord()) {
            yChange = 1;}
        if(myCritter.getYCoord() < targetCritter.getYCoord()) {
            yChange = -1;}
        
        boolean didMove = false;
        if (myCritter.moveCritter(xChange, yChange)) {didMove = true;}
        else if (xChange*yChange!=0) {
            if (myCritter.moveCritter(xChange, 0)) {didMove = true;}
            else if (myCritter.moveCritter(0, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(xChange, -yChange)) {didMove = true;}
            else if (myCritter.moveCritter(-xChange, yChange)) {didMove = true;}
        }
        else if (xChange != 0) {
            if (myCritter.moveCritter(xChange, 1)) {didMove = true;}
            else if (myCritter.moveCritter(xChange, -1)) {didMove = true;}
            else if (myCritter.moveCritter(0, 1)) {didMove = true;}
            else if (myCritter.moveCritter(0, -1)) {didMove = true;}
        }
        else if (yChange != 0) {
            if (myCritter.moveCritter(1, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(-1, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(1, 0)) {didMove = true;}
            else if (myCritter.moveCritter(-1, 0)) {didMove = true;}
        }
        return didMove;
    }
    
    public boolean longCritterFlee(LongCritter c) {
        int xChange = 0;
        int yChange = 0;
        if(myCritter.getXCoord() > targetCritter.getXCoord()) {
            xChange = 1;}
        if(myCritter.getXCoord() < targetCritter.getXCoord()) {
            xChange = -1;}
        if(myCritter.getYCoord() > targetCritter.getYCoord()) {
            yChange = 1;}
        if(myCritter.getYCoord() < targetCritter.getYCoord()) {
            yChange = -1;}
        
        boolean didMove = false;
        if (myCritter.moveCritter(xChange, yChange)) {didMove = true;}
        else if (xChange*yChange!=0) {
            if (myCritter.moveCritter(xChange, 0)) {didMove = true;}
            else if (myCritter.moveCritter(0, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(xChange, -yChange)) {didMove = true;}
            else if (myCritter.moveCritter(-xChange, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(0, -yChange)) {didMove = true;}
            else if (myCritter.moveCritter(-xChange, 0)) {didMove = true;}
        }
        else if (xChange != 0) {
            if (myCritter.moveCritter(xChange, 1)) {didMove = true;}
            else if (myCritter.moveCritter(xChange, -1)) {didMove = true;}
            else if (myCritter.moveCritter(0, 1)) {didMove = true;}
            else if (myCritter.moveCritter(0, -1)) {didMove = true;}
        }
        else if (yChange != 0) {
            if (myCritter.moveCritter(1, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(-1, yChange)) {didMove = true;}
            else if (myCritter.moveCritter(1, 0)) {didMove = true;}
            else if (myCritter.moveCritter(-1, 0)) {didMove = true;}
        }
        return didMove;
    }
    

}
