/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class SeekItemsInstructions extends CritterInstructions{
    Critter me;
    DungeonSquare target;
    PathSeekingAI targetSeek;
    
    public SeekItemsInstructions(Critter c, Class cl) {
        me = c;
        target = null;
        int x = c.getXCoord();
        int y = c.getYCoord();
        int DISTANCE = 4;
        for (int i = x-DISTANCE; i<=x+DISTANCE;i++) {
            for (int j = y-DISTANCE; j<=y+DISTANCE; j++) {
                DungeonSquare d = c.getLevel().getSquare(i,j);
                if (d!=null && c.canSee(d)) {
                    for (int k=0;k<d.getItemRoster().size();k++) {
                        //if (d.getItemRoster().get(k) instanceof ArrowsItem) {
                        if (cl.isInstance(d.getItemRoster().get(k))) {
                            target = d;
                            //break out of loops
                            i=x+DISTANCE+1;
                            j=y+DISTANCE+1;
                        }
                    }
                }
            }
        }
        if (target!=null)
            targetSeek = new PathSeekingAI(c,target);
    }
    
    public boolean tryInstructions() {
        if (targetSeek==null || target==me.getSquare())
            return false;
        else {
         GameFrame.getInstance().printText("This happened");
        targetSeek.runAI();
        return true;
        }
    }
}*/
