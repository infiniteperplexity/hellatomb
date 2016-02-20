package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


public class CritterForce extends CritterRoster{
    String myName;
    
    public CritterForce(){}
    
    public CritterForce(String s) {
        myName = s;
    }
    
    public void addCritter(Critter c) {
        super.add(c);
        c.setForce(this);
    }

    public void removeCritter(Critter c) {
       int n = super.indexOf(c);
       super.remove(n);
       c.setForce(null);
   }
    
}
