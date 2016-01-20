/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class FireArrowsInstructions extends CritterInstructions{
    Critter me;
    SuperDungeonEntity target;
    PathSeekingAI targetSeek;
    
    public FireArrowsInstructions(Critter c, SuperDungeonEntity t) {
        me = c;
        target = t;
        c.setMissileTarget(t);
    }
    
    public boolean tryInstructions() {
        if(me.getEquipment().getBow()!=null && me.getEquipment().getArrows()!=null && me.canSee(target)) {
            me.getEquipment().getBow().fireMissile(me,(AmmoItem) me.getEquipment().getArrows().takeItems(1),me.getTargetSquare());
            GameFrame.getInstance().printText(me.getName("The") + " fires an arrow at " + target.getName("the"));
            return true;
        }
        else return false;
    }
}
*/