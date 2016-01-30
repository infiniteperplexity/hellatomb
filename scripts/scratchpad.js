var survey = new ControlContext({
  VK_LEFT: surveyMove(-1,0,0),
  VK_RIGHT: surveyMove(+1,0,0),
  VK_UP: surveyMove(0,-1,0),
  VK_DOWN: surveyMove(0,+1,0),
  // bind keyboard movement
  VK_Z: surveyMove(-1,+1,0),
  VK_S: surveyMove(0,+1,0),
  VK_X: surveyMove(0,+1,0),
  VK_C: surveyMove(+1,+1,0),
  VK_A: surveyMove(-1,0,0),
  VK_D: surveyMove(+1,0,0),
  VK_Q: surveyMove(-1,-1,0),
  VK_W: surveyMove(0,-1,0),
  VK_E: surveyMove(+1,-1,0),
  VK_PERIOD: surveyMove(0,0,-1),
  VK_COMMA: surveyMove(0,0,+1),
  VK_ESCAPE: GUI.reset
});

GUI.surveyMode = function() {
  Controls.context = survey;
  survey.xoffset = main.xoffset;
  survey.yoffset = main.yoffset;
  survey.z = main.z;
};
var surveyMove = function(dx,dy,dz) {
  return function() {
    if (survey.z+dz < NLEVELS || survey.z+dz >= 0) {
      survey.z+=dz;
    }
    if (survey.xoffset+dx < LEVELW-SCREENW || survey.xoffset+dx >= 0) {
      survey.xoffset+=dx;
    }
    if (survey.yoffset+dy < LEVELH-SCREENH || survey.yoffset+dy >= 0) {
      survey.yoffest+=dy;
    }
  };
};
