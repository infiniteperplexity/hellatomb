package org.glenn.critter;

import org.glenn.ai.*;
import org.glenn.base.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import org.glenn.images.GameImages;
import java.awt.*;

import javax.swing.*;

public abstract class OgreCritter extends LargeCritter {
    public void die() {
        //super.getSquare().addItem(new OgreBonesItem(GameImages.getImage("ogreBones.GIF")));
        super.getSquare().addItem(new OgreSkullItem());
        DungeonSquare currentSquare;
        currentSquare = myLevel.getSquare(xCoord,yCoord-1);
        if (this.canPass(currentSquare))
            currentSquare.addItem(new OgreBonesItem());
        else super.getSquare().addItem(new OgreBonesItem());
        currentSquare = myLevel.getSquare(xCoord,yCoord+1);
        if (this.canPass(currentSquare))
            currentSquare.addItem(new OgreBonesItem());
        else super.getSquare().addItem(new OgreBonesItem());
        currentSquare = myLevel.getSquare(xCoord+1,yCoord);
        if (this.canPass(currentSquare))
            currentSquare.addItem(new OgreBonesItem());
        else super.getSquare().addItem(new OgreBonesItem());
        currentSquare = myLevel.getSquare(xCoord-1,yCoord);
        if (this.canPass(currentSquare))
            currentSquare.addItem(new OgreBonesItem());
        else super.getSquare().addItem(new OgreBonesItem());
        super.die();
    }
}
