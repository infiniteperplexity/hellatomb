package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class TryDisciplineInstructions extends CritterInstructions{
    Critter me;
    Critter target;
    MysticDiscipline d;
    
    public TryDisciplineInstructions(Critter c, Critter t, Class cl) {
        me = c;
        d=null;
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (cl.isInstance(c.getDisciplines().get(i)))
                d = (MysticDiscipline) c.getDisciplines().get(i);
        }
        target = t;
    }
    
    public boolean tryInstructions() {
        if (d instanceof SummoningDiscipline) {
            SummoningDiscipline s = (SummoningDiscipline) d;
            if (s.isReady() && s.findValidTarget()!=null) {
                me.setMissileTarget(s.findValidTarget());
                d.useDiscipline();
                return true;
            }
        }
        else if (d!=null && d.isReady() && target!=null && me.canSee(target)) {
            me.setMissileTarget(target);
            d.useDiscipline();
            return true;
        }
        
        return false;
    }
}

    /*public TryDisciplineInstructions(Critter c, Critter t, MysticDiscipline m) {
        d=m;
        me = c;
        target = t;
    }
    
    public boolean tryInstructions() {
        if (d.isReady() && target!=null && me.canSee(target)) {
            me.setMissileTarget(target);
            d.useDiscipline();
            return true;
        }
        else return false;
    }*/
