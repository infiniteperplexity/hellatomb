//every turn...

Tasks.assignTasks = function() {
  for(var i=0; i<Tasks.taskList.length; i++) {
    var tsk = HTomb.Tasks.taskList[i];
    if (tsk.assignedTo!==null) {
      continue;
    }
    var assigner = tsk.master;
    var minions = assigner.master.minions;
    // maybe should shuffle this only once per turn?
    minions = minions.shuffle();
    for (var j=0; j<minions.length; j++) {
      if (minions[j].minion.task!==null) {
        continue;
      }
      tsk.assignTo(minions[j]);
    }
  }
};
