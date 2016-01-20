package org.glenn.item;

import org.glenn.ai.*;
import org.glenn.base.*;
import org.glenn.discipline.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;


public abstract class Item extends DungeonEntity {
    ItemRoster parentRoster;
    int worth;
    
    public Item() {
        worth = 1;
    }
    
    public void equipEffect(Critter c) {
        GameFrame.getInstance().printText("You can't equip that!");
    }
    public void takeOffEffect(Critter c) {
    }
    public void consumeEffect(Critter c) {
        GameFrame.getInstance().printText("You can't eat that!");
    }
    
    public int getWorth() {
        return worth;
    }
    
    public void setWorth(int w) {
        worth = w;
    }
    
    public void destroy() {
        if (parentRoster != null)
            parentRoster.removeItem(this);
    }
    
    public void moveItem(DungeonSquare two) {
        //this.getSquare().removeItem(this);
        two.addItem(this);
    }
    
    public void setParentRoster(ItemRoster i) {
       // if (parentRoster instanceof EquipmentRoster)
        parentRoster = i;
    }
    
    public ItemRoster getParentRoster() {
        return parentRoster;
    }
    
    public DungeonSquare getSquare() {
        if (parentRoster==null || parentRoster.getParent()==null) {
            System.out.println("return null item square, had no parent");
            return null;
        }
        Object o = this.getParentRoster().getParent();
        if (o instanceof DungeonEntity) {
            DungeonEntity s = (DungeonEntity) o;
            return s.getSquare();
        }
        else System.out.println("return null item square, had wrong kind of parent"); 
            
            return null;
    }
    
    public boolean isVisible() {
       if (this.getSquare().isVisible())
           return true;
       else return false;
    }
}



