package org.glenn.critter;

import org.glenn.ai.*;
import org.glenn.base.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import org.glenn.images.GameImages;
import java.awt.*;

import java.util.*;

public class OniCritter extends OrcCritter {
    LinkedList allOniDisciplines;
    /** Creates a new instance of OniCritter */
    public OniCritter() {
        //2 is default!
        this(2);
    }

    public OniCritter(int n) {
        mySymbol = 'o';
        myImage = GameImages.getImage("oniFace.GIF");
        
        baseAttack = 1;
        baseDefense = 1;
        baseToughness = 2;
        baseWillpower = 8;
        lifePoints = 10;
        xpValue =15;
        
        
        attackRating = 3;
        defenseRating = 11;
        damageRating = 4;
        hitPoints = 15;
        maxHitPoints = 15;
        myName = "oni";

        RangedAttackPattern myAttackPattern = new RangedAttackPattern(this);
        FleePattern myFleePattern = new FleePattern(this);
        
        MysticDiscipline myBlinker = new BlinkDiscipline(this);
        myDisciplines.add(myBlinker);
        myAttackPattern.addEscapeDiscipline(myBlinker);
        myFleePattern.addAttackDiscipline(myBlinker);
        
        int SIZE = 13;
        //currently can get two of the same;
        for(int i = 0;i<n;i++) {
            int k = DungeonDice.rollTheDice(1,SIZE);
            MysticDiscipline myDisc;
            switch (k) {
                case 1:     myDisc = new VenomBoltDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 2:     myDisc = new FrostBoltDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 3:     myDisc = new ChainLightningDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 4:     myDisc = new BallLightningDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 5:     myDisc = new IceStormDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 6:     myDisc = new HexOfLowlinessDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 7:     myDisc = new HexOfDisplacementDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addEscapeDiscipline(myDisc);
                            myFleePattern.addEscapeDiscipline(myDisc);
                            break;
                case 8:     myDisc = new TimeStopDiscipline(this);
                            myDisciplines.add(myDisc);
                            myAttackPattern.addEscapeDiscipline(myDisc);
                            myFleePattern.addEscapeDiscipline(myDisc);
                            break;
                case 9:     myDisc = new RaiseGhulDiscipline(this);
                            myDisciplines.add(myDisc);
                            //some day I might want to make it do this while wandering, too.
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 10:     myDisc = new RaisePhantomDiscipline(this);
                            myDisciplines.add(myDisc);
                            //some day I might want to make it do this while wandering, too.
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 11:     myDisc = new SummonHearthSpiritDiscipline(this);
                            myDisciplines.add(myDisc);
                            //some day I might want to make it do this while wandering, too.
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 12:     myDisc = new SummonFrostMaidenDiscipline(this);
                            myDisciplines.add(myDisc);
                            //some day I might want to make it do this while wandering, too.
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
                case 13:     myDisc = new FlameStrikeDiscipline(this);
                            myDisciplines.add(myDisc);
                            //some day I might want to make it do this while wandering, too.
                            myAttackPattern.addAttackDiscipline(myDisc);
                            myFleePattern.addAttackDiscipline(myDisc);
                            break;
            }
        }
        myMasterAI.setAttackPattern(myAttackPattern);
        myMasterAI.setFleePattern(myFleePattern);
    }
    
    public String getName(String s) {
           if (s=="A" || s=="a")
               return (s+"n "+ myName);
           else return (s + " " + myName);
   }
}
