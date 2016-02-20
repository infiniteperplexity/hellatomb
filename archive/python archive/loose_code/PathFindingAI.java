/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;



//right now this is used to find short paths.  If I want to find longer paths, I need to make it only recalculate every so often;
public class PathFindingAI extends CritterAI{
    FeatureRoster myPath;
    PathHandler myHandler;
    //JunctionSeekingAI junctionSeek;
    DungeonFeature targetFeature;
    DungeonJunction nextTarget;
    PathSeekingAI pathSeek;
    
    public PathFindingAI(Critter c, DungeonFeature target) {
        super(c);
        myPath = new FeatureRoster();
        myHandler = new PathHandler();
        targetFeature = target;
    }
    
    public boolean isFinished() {
        if (myPath.isEmpty())
            return true;
        else if (myPath.getNextJunction()==null)
            return true;
        else return false;
    }
    
    public void runAI() {
        DungeonFeature myFeature = myCritter.getFeature();
        if (myPath.isEmpty()) {
            myPath = myHandler.findPath(targetFeature,myFeature);
            if (myPath.isEmpty()) {
                System.out.println("Critter can't find path!");
            }
        }
        
        if (myPath.contains(myFeature))
            myPath.removeFeature(myFeature);
        
        nextTarget = myPath.getNextJunction();
        
        if(nextTarget != null) {
           pathSeek = new PathSeekingAI(myCritter, nextTarget.getAnchor());
           pathSeek.runAI();
        //junctionSeek = new JunctionSeekingAI(nextTarget);
        //junctionSeek.runAI(c);
        }
        
        if (myPath.contains(myCritter.getFeature()))
            myPath.removeFeature(myCritter.getFeature());
    }     
}*/
