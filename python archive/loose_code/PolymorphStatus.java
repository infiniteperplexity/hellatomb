package org.glenn.critter;

import org.glenn.ai.*;
import org.glenn.base.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;

public class PolymorphStatus extends CritterStatus implements TurnListener, CritterListener {
     
    int durationCount;
    int duration;
    CritterRoster polyQue;
    
    public PolymorphStatus(Critter n) {
        myTarget = n;
        //this is where the new Critter goes;
        int POLY_DURATION = 25;
        duration = POLY_DURATION;
        durationCount = 0;
        polyQue = new CritterRoster();
    }
    
    //maybe move to superclass
    public void takeEffect(Critter oldCritter) {
        Critter newCritter = myTarget;
        DungeonSquare mySquare = oldCritter.getSquare();
        oldCritter.moveByLeap(new DungeonSquare());
        
        //handle qued polymorphing
        PolymorphStatus oldStatus = oldCritter.getPolymorphStatus();
        if (oldStatus!=null) {
            polyQue.addAll(oldStatus.getPolyQue());
            oldCritter.removeCritterListener(oldStatus);
            TurnHandler.getInstance().removeTurnListener(oldStatus);
        }
        
        newCritter.setPolymorphStatus(this);
        polyQue.add(oldCritter);
        
        
        
        //apply mods from original critter
        polyQue.getCritter(0).applyPolyModsTo(newCritter);
        
        //Whatever effects accompany polymorphing, maybe switch inventories too?
        int oldDamaged = oldCritter.getMaxLifePoints() - oldCritter.getLifePoints();
        //setting life points should not result in a dead critter!
        newCritter.setLifePoints(Math.max(0,newCritter.getMaxLifePoints() - oldDamaged + oldCritter.getToughness()));
        newCritter.setMinions(oldCritter.getMinions());

        ArrayList myArray = new ArrayList();
        for (int i = 0; i<oldCritter.getInventory().size();i++) {
                myArray.add(oldCritter.getInventory().getItem(i));
            }
        for (int i = 0; i<myArray.size();i++) {
                newCritter.getInventory().add(myArray.get(i));
            }
        myArray.clear();
        for (int i = 0; i<oldCritter.getEquipment().size();i++) {
                if (oldCritter.getEquipment().get(i) != null)
                    myArray.add(oldCritter.getEquipment().getItem(i));
            }
        for (int i = 0; i<myArray.size();i++) {
                newCritter.getEquipment().addItem((Item) myArray.get(i));
            }
              
        mySquare.getLevel().addCritter(mySquare, newCritter);
        
        if (oldCritter == ThePlayer.getInstance()) {
            GameFrame.getInstance().printText(oldCritter.getName("The") + " polymorphs into " + newCritter.getName("a")+".");
            ThePlayer.polymorphPlayer(newCritter); 
        }
        else {
           if (newCritter.isVisible())
               GameFrame.getInstance().printText(oldCritter.getName("The") + " polymorphs into " + newCritter.getName("a")+".");
        }
        mySquare.getLevel().getCritterRoster().removeCritter(oldCritter);
        //ArrayList tempArray = new ArrayList(oldCritter.getListeners());
        //for(int n=0; n<tempArray.size();n++) {
        //        CritterListener cl =(CritterListener) tempArray.get(n);
         //       cl.fireCritterEvent(new CritterPolymorphEvent(oldCritter,newCritter,this));
        //}
        for (int i = polyQue.size()-1;i >= 0; i--)
            polyQue.getCritter(i).setIncarnation(newCritter);
        newCritter.setForce(oldCritter.getForce());
        newCritter.setMaster(oldCritter.getMaster());
        newCritter.getStatusEffects().add(this);
        newCritter.addCritterListener(this);
        TurnHandler.getInstance().addTurnListener(this);
        durationCount = duration;
        GameFrame.getInstance().drawTheGrid();
    }
    
    public void returnToNormal() {
        Critter newCritter = myTarget;
            
            DungeonSquare mySquare = newCritter.getSquare();
            
            Critter oldCritter = polyQue.getCritter(0);
            
            newCritter.moveByLeap(new DungeonSquare());
            mySquare.getLevel().getCritterRoster().removeCritter(newCritter);
            //better to set it to null!
            newCritter.setIncarnation(null);
            for (int i = polyQue.size()-1;i >= 0; i--)
                polyQue.getCritter(i).setIncarnation(null);
            oldCritter.setIncarnation(oldCritter);
            /*newCritter.setIncarnation(oldCritter);
            for (int i = polyQue.size()-1;i >= 0; i--)
                polyQue.getCritter(i).setIncarnation(oldCritter);*/
            
            oldCritter.setForce(newCritter.getForce());
            oldCritter.setMaster(newCritter.getMaster());
        
            newCritter.removeCritterListener(this);
            TurnHandler.getInstance().removeTurnListener(this);
            //should remove from status effects?
            
            int newDamaged = newCritter.getMaxLifePoints() - newCritter.getLifePoints();
            oldCritter.setLifePoints(oldCritter.getMaxLifePoints() - newDamaged + oldCritter.getToughness());
            oldCritter.setMinions(newCritter.getMinions());
            int earnedXP = newCritter.getXP()-oldCritter.getXP();
            
            ArrayList myArray = new ArrayList();
            for (int i = 0; i<newCritter.getInventory().size();i++) {
                myArray.add(newCritter.getInventory().getItem(i));
            }
            for (int i = 0; i<myArray.size();i++) {
                oldCritter.getInventory().add(myArray.get(i));
            }
            myArray.clear();
            for (int i = 0; i<newCritter.getEquipment().size();i++) {
                if (newCritter.getEquipment().get(i) != null)
                    myArray.add(newCritter.getEquipment().getItem(i));
            }
            for (int i = 0; i<myArray.size();i++) {
                oldCritter.getEquipment().addItem((Item) myArray.get(i));
            }
            //crude way of checking for multi-polymorphing);
            //is this still necessary?
            if (mySquare.getXCoord()!=0)
                oldCritter.setAsleep(false);
            
            mySquare.getLevel().addCritter(mySquare,oldCritter);
            
            oldCritter.setPolymorphStatus(null);
            
            
                
            //I think this will add too many hit points, need to change
            //maybe add hit points within the discipline
            
            //might cauze problems with multipolymorph?
            
            if (newCritter == ThePlayer.getInstance())
                ThePlayer.polymorphPlayer(oldCritter);
            
            
            
            if (newCritter.isVisible())
                GameFrame.getInstance().printText(oldCritter.getName("The") + " reverts to its natural form.");
    
            
            oldCritter.addXP(earnedXP);
    }
    
    public int getDurationCount() {
        return durationCount;
    }
    
    public void turnEnded() {
        durationCount--;
        if (durationCount<=0)
            this.returnToNormal();
    }
    
    public CritterRoster getPolyQue() {
        return polyQue;
    }
    
    public void fireCritterEvent(CritterEvent c) {
       if (c instanceof CritterDeathEvent) {
            myTarget.removeCritterListener(this);
            TurnHandler.getInstance().removeTurnListener(this);
            Critter doomed = polyQue.getCritter(0);
            myTarget = null;     
       }
    }
}
