/*package source.org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;
//nothing for now
public class HomeFeatureWanderingAI extends CritterAI implements CritterListener{
    Critter focusCritter;
    LinkedList specialInstructions;
    
    public HomeFeatureWanderingAI(Critter c, Critter t) {
        super(c);
        focusCritter = t;
        t.addCritterListener(this);
        specialInstructions = new LinkedList();
    }
    
    public boolean isFinished() {
        if(focusCritter==null) {
            return true;
        }
        //if (c.canSee(focusCritter.getSquare())==false)
            //return true; 
        else
            return false;

    }
        
    public void runAI() {
        for (int i=specialInstructions.size()-1; i>=0;i--) {
            CritterInstructions ci = (CritterInstructions) specialInstructions.get(i);
            if (ci.tryInstructions())
                break;
        }
    }
    
    public void addInstructions(CritterInstructions c) {
        specialInstructions.add(c);
    }
    
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent || c instanceof CritterShakeTargetEvent) {
            focusCritter.removeCritterListener(this);
            focusCritter = null;
       }
    
       else if (c instanceof CritterPolymorphEvent) {
            focusCritter.removeCritterListener(this);
            focusCritter = null;  
       }
    }
    

}*/
