HTomb = (function(HTomb) {
  "use strict";
  var Constants = HTomb.Constants;
  var testedFonts = ["Monaco","Verdana","Arial","Trebuchet MS"];
  //Ideally I think I want Lucida Console for the text and Verdana for the play area
  //var useFont = "Lucida Console";
  var useFont = "Verdana";
  var testContext = document.createElement("canvas").getContext('2d');
  var testText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  testContext.font = "72px monospace";
  testContext.font = FONTSIZE + "px " + FONTFAMILY;
  var baselineSize = testContext.measureText(testText).width;
  testContext.font = "72px '" + useFont + "', monospace";
  var newSize = testContext.measureText(testText).width;
  var FONTFAMILY = Constants.FONTFAMILY = (newSize===baselineSize) ? "Lucida Console" : useFont;
  if (newSize===baselineSize) {
    console.log("Font " + useFont + " not available; using Lucida Console instead.");
  } else {
    console.log("Font " + useFont + " is available and will be used.");
  }
  var FONTSIZE = Constants.FONTSIZE = 18;
  var CHARHEIGHT = Constants.CHARHEIGHT = Constants.FONTSIZE;
  testContext.font = FONTSIZE + "px " + FONTFAMILY;
  var measuredWidth =
    1+Math.floor(testContext.measureText(testText).width/testText.length);
  var CHARWIDTH = Constants.CHARWIDTH = (testedFonts.indexOf(FONTFAMILY)>-1) ? CHARHEIGHT : measuredWidth;
  // nudge based on font
  var XSKEW = Constants.XSKEW = (testedFonts.indexOf(FONTFAMILY)>-1) ? +9 : +3;
  var YSKEW = Constants.YSKEW = +7;

  // Dimensions of the display panels
  var GAMEW = 600;
  var GAMEH = 450;
  var SCREENW = Constants.SCREENW = Math.floor(GAMEW/CHARWIDTH);
  var SCREENH = Constants.SCREENH = Math.floor(GAMEH/CHARHEIGHT);
  console.log("Playing area will be " + SCREENW + "x" + SCREENH + ".");

  //Merienda is good...
  var TEXTFONT = Constants.TEXTFONT = "Lucida Console";
  //var TEXTFONT = Constants.TEXTFONT = "Courier New";
  var TEXTSIZE = Constants.TEXTSIZE = 15;
  testContext.font = TEXTSIZE + "px " + TEXTFONT;
  measuredWidth =
    1+Math.floor(testContext.measureText(testText).width/testText.length);
  var TEXTWIDTH = Constants.TEXTWIDTH = (testedFonts.indexOf(TEXTFONT)>-1) ? TEXTSIZE : measuredWidth;
  var TOTALH = GAMEH+8*TEXTSIZE;
  var TOTALW = 900;
  var MENUW = Constants.MENUW = Math.floor((TOTALW-GAMEW)/TEXTWIDTH);
  var MENUH = Constants.MENUH = TOTALH/TEXTSIZE;
  var STATUSH = Constants.STATUSH = 2;
  var SCROLLH = Constants.SCROLLH = 6;
  var SCROLLW = Constants.SCROLLW = GAMEW/TEXTWIDTH;
  return HTomb;
})(HTomb);
