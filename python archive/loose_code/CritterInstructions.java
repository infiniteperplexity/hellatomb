package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;

import java.util.*;

public abstract class CritterInstructions{
    
    LinkedList specialInstructions;
    
    public CritterInstructions() {
        specialInstructions=new LinkedList();
    }
    public boolean tryInstructions() {
        return false;
    }
}
