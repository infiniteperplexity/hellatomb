/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class RagerCombatInstructions extends CritterInstructions{
    Critter me;
    Critter target;

    public RagerCombatInstructions(Critter c, Critter t) {
        me = c;
        target = t;
        specialInstructions.add(new SeekTargetInstructions(c,t));
        specialInstructions.add(new TryDisciplineInstructions(c,t,WildCatAspectDiscipline.class));
        specialInstructions.add(new TryDisciplineInstructions(c,t,SabreCatAspectDiscipline.class));
        specialInstructions.add(new TryDisciplineInstructions(c,t,SalamanderAspectDiscipline.class));
    }
    
    public boolean tryInstructions() { 
        for (int i=specialInstructions.size()-1; i>=0;i--) {
                CritterInstructions ci = (CritterInstructions) specialInstructions.get(i);
                if (ci.tryInstructions())
                    return true;
        }
        return false;
    }
}
*/