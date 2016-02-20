/*package org.glenn.ai;

import org.glenn.base.*;
import org.glenn.critter.*;
import org.glenn.dungeon.*;
import org.glenn.discipline.*;
import org.glenn.item.*;


import java.util.*;

public class MageAssaultAI extends CritterFocusedAI implements CritterListener{
        public MageAssaultAI(Critter c, Critter t) {
        super(c,t);
        specialInstructions.add(new FleeTargetInstructions(c,t));
        specialInstructions.add(new CastNastySpellsInstructions(c,t));
        specialInstructions.add(new HostileKeepDistanceInstructions(c,t));
    }
}
    /*Critter targetCritter;
    PathSeekingAI critterSeek;
    CritterFleeingAI critterFlee;
    PathHandler myHandler;
    BlinkDiscipline myBlinker;
    VenomBoltDiscipline myVenomBolt;
    RaiseGhulDiscipline myGhulRaiser;
    TimeStopDiscipline myTimeStopper;
    HexOfDisplacementDiscipline myDisplacer;
    SummonHearthSpiritDiscipline myHearthSpirit;
    SummonFrostMaidenDiscipline myFrostMaiden;
    HexOfLowlinessDiscipline myLowliness;
    
    public MageAssaultAI(Critter c, Critter t) {
        super(c);
        targetCritter = t;
        t.addCritterListener(this);
        c.setMissileTarget(t);
        critterSeek = new PathSeekingAI(c,t);
        critterFlee = new CritterFleeingAI(c,t);
        myHandler = new PathHandler();
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof BlinkDiscipline)
                myBlinker = (BlinkDiscipline) c.getDisciplines().get(i);
        } 
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof VenomBoltDiscipline)
                myVenomBolt = (VenomBoltDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof RaiseGhulDiscipline)
                myGhulRaiser = (RaiseGhulDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof TimeStopDiscipline)
                myTimeStopper = (TimeStopDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof HexOfDisplacementDiscipline)
                myDisplacer = (HexOfDisplacementDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof SummonHearthSpiritDiscipline)
                myHearthSpirit = (SummonHearthSpiritDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof SummonFrostMaidenDiscipline)
                myFrostMaiden = (SummonFrostMaidenDiscipline) c.getDisciplines().get(i);
        }
        
        for (int i = 0; i < c.getDisciplines().size(); i++) {
            if (c.getDisciplines().get(i) instanceof HexOfLowlinessDiscipline)
                myLowliness = (HexOfLowlinessDiscipline) c.getDisciplines().get(i);
        }
        
        
    }
    
    public boolean isFinished() {
    //doesn't finish if out of sight, because might blink away.
        if (targetCritter==null) {
            System.out.println("Fire a warning!!!");
            return true;
        }
            
        else return false;
    }
    
    public void runAI() {
        if(myTimeStopper!=null && myTimeStopper.isReady() && myCritter.canSee(targetCritter.getSquare()))
            myTimeStopper.useDiscipline();
        else if(myGhulRaiser!=null && myGhulRaiser.isReady() && myGhulRaiser.lookForCorpseAI()!=null && targetCritter!=null) {
                CorpseItem myCorpse = myGhulRaiser.lookForCorpseAI();
                myCritter.setMissileTarget(myCorpse.getSquare());
                myGhulRaiser.useDiscipline();
                myCritter.setMissileTarget(targetCritter); 
        }
        else if(myFrostMaiden!=null && myFrostMaiden.isReady() && targetCritter!=null && myCritter.canSee(targetCritter) && myCritter.distanceTo(targetCritter)>2  ) {
                ArrayList tempArray = RayCaster.castRay(myCritter.getSquare(),targetCritter.getSquare());
                
                myCritter.setMissileTarget((DungeonSquare) tempArray.get(tempArray.size()-2));
                myFrostMaiden.useDiscipline();
                myCritter.setMissileTarget(targetCritter); 
        }
        else if(myHearthSpirit!=null && myHearthSpirit.isReady() && targetCritter!=null && myCritter.canSee(targetCritter) && myCritter.distanceTo(targetCritter)>2   ) {
                ArrayList tempArray = RayCaster.castRay(myCritter.getSquare(),targetCritter.getSquare());
                
                myCritter.setMissileTarget((DungeonSquare) tempArray.get(1));
                myHearthSpirit.useDiscipline();
                myCritter.setMissileTarget(targetCritter); 
        }
        else if(myLowliness!=null && myLowliness.isReady() && targetCritter!=null && myCritter.canSee(targetCritter)) {                
                myCritter.setMissileTarget(targetCritter);
                myLowliness.useDiscipline();
        }
        //wondering if this will block the null pointer?
        else if (targetCritter != null && myCritter.canSee(targetCritter.getSquare())) {
            if (myCritter.distanceTo(targetCritter) > 5)
                critterSeek.runAI();
            else if (myCritter.distanceTo(targetCritter) <= 2 && myDisplacer!=null && myDisplacer.isReady())
                myDisplacer.useDiscipline();
            else if (myCritter.distanceTo(targetCritter) <= 2 && myBlinker!=null && myBlinker.isReady())
                myBlinker.useDiscipline();
            else if (myCritter.distanceTo(targetCritter) <= 4) {
                //note: doing this test runs the routine!  this is intentional
                if (!critterFlee.tryFlee()) {
                    if(myVenomBolt!=null && myVenomBolt.isReady())
                        myVenomBolt.useDiscipline();
                    else if (myCritter.distanceTo(targetCritter)<=2)
                        critterSeek.runAI();
                }
            }    
            else if(myVenomBolt!=null && myVenomBolt.isReady())
                myVenomBolt.useDiscipline();
        }
        else if(targetCritter!=null) {
        PathSeekingAI pathSeek = new PathSeekingAI(myCritter, targetCritter);
        pathSeek.runAI();
        }
    }  
    
    public void fireCritterEvent(CritterEvent c) {
        if (c instanceof CritterDeathEvent) {
            targetCritter.removeCritterListener(this);
            targetCritter = null;
       }
    }
    
}*/
