class Tomb(object):
	root = None
	text = None
	zone = None
	player = None
	gui = None
	controls = None
	listeners = []
	turn_count = 0
	adventurer_count = 0
	
	@staticmethod
	def turn():
		Tomb.publish(TurnEvent())
		
	
	@staticmethod			
	def publish(event):
		for listener in Tomb.listeners:
			listener.listen(event)
			
		event.fire()
	
	@staticmethod
	def subscribe(listener):	
		Tomb.listeners.append(listener)
		
	@staticmethod
	def unsubscribe(listener):
		Tomb.listeners.remove(listener)
		
		
class Listener(object):
	def __init__(self,owner):
		self.owner = owner
	
	def listen(self, event):
		pass
		
class MourningListener(Listener):
	def listen(self, event):
		if isinstance(event,DeathEvent):
			self.owner.mourn(event);
			Tomb.unsubscribe(self)
		
class CooldownListener(Listener):
	def listen(self, event):
		if isinstance(event, TurnEvent):
			self.owner.cool_down(self, event)
			
class TaskListener(Listener):
	def __init__(self, task, creature):
		self.task = task
		self.creature = creature
	
	def listen(self, event):
		if isinstance(event,DeathEvent) and event.creature == self.task.worker:
			self.task.abandon()
			Tomb.unsubscribe(self)
			
			
class Event(object):
	def fire(self):
		pass
		
		
class AttackEvent(Event):
	def __init__(self, attacker, target):
		self.attacker = attacker
		self.target = target
		
	def fire(self):
		import random
		if random.randint(1,20) > 10:
			Tomb.gui.push_message(self.attacker.name + " swings at " + self.target.name + " and hits!")
			self.target.wounds += 1
			if self.target.wounds >= self.target.toughness:
				self.target.die()
		else:
			Tomb.gui.push_message(self.attacker.name + " swings at " + self.target.name + " and misses!")
			
			
class DeathEvent(Event):
	def __init__(self, creature):
		self.creature = creature
		
	def fire(self):
		from .items import CorpseItem
		if self.creature.is_hostile(Tomb.player):
			from random import random
			if random() < 0.25:
				Tomb.gui.push_message("You capture and devour a soul as it leaves its mortal host.")
				Tomb.player._contempt += 1
		if self.creature.leaves_corpse:
			self.creature.square.items.put(CorpseItem())
		for item in self.creature.items:
			self.creature.square.items.put(item)
		Tomb.zone.creatures.remove(self.creature)
		self.creature.square.creature = None
		
		
class TurnEvent(Event):
	def fire(self):
		from random import random
		from .creatures import moods
		Tomb.turn_count += 1
		Tomb.adventurer_count += 1
		for minion in Tomb.player.minions:
			if Tomb.player.anxiety > Tomb.player.contempt:
				if random() > 0.8:
					Tomb.gui.push_message(minion.name + " rebels against " + Tomb.player.name + "!")
					minion.mood = moods["angry"]
					Tomb.player.minions.remove(minion)
					#should also remove the listener?
			if Tomb.player.anxiety == Tomb.player.contempt:
				if random() > 0.995:
					Tomb.gui.push_message(minion.name + " rebels against " + Tomb.player.name + "!")
					minion.mood = moods["angry"]
					Tomb.player.minions.remove(minion)
					#should also remove the listener?
					
		from .creatures import BuildWallAI
		for creature in Tomb.zone.creatures:
			creature.doAI()
				
		for task in Tomb.player.jobs:
			if task.worker == None:
				for minion in Tomb.player.minions:
					if minion.task == None:
						#ad hoc fix
						if task.square != minion.square:
							task.assign(minion)
									
		Tomb.player.explore()
		if not Tomb.player.square.floor().solid():
			for item in Tomb.player.square.items:
				item.fall()
			Tomb.player.fall()
			
		from random import random, shuffle
		from .creatures import Ghoul
		if random() < 0.01:
			borders = Tomb.zone.borders2d([1,1],[Tomb.zone.width-1,Tomb.zone.height-1],1)
			shuffle(borders)
			square = Tomb.zone.grid(borders[0].x, borders[0].y, Tomb.zone.find_floor(borders[0].x,borders[0].y))
			if square and square.passable:
				Tomb.gui.push_message("A ghoul has been spotted along your borders!")
				square.creature = Ghoul()
				
		if random() <= 0.0001*Tomb.adventurer_count:
			spawn_adventurers()
			Tomb.adventurer_count = 0
			
		for square in Tomb.zone.squares():
			square.visible = False
			
		Tomb.player.explore()
		
		for minion in Tomb.player.minions:
			minion.explore()
			
		#Tomb.gui.draw()
		
		
def spawn_adventurers():
	from .creatures import Villager
	from random import shuffle
	borders = Tomb.zone.borders2d([1,1],[Tomb.zone.width-1,Tomb.zone.height-1],1)
	shuffle(borders)
	square = Tomb.zone.grid(borders[0].x, borders[0].y, Tomb.zone.find_floor(borders[0].x,borders[0].y))
	if not square:
		return
		
	succeed = False
	for i in range(Tomb.player.infamy):
		s = square.closest_space()
		if s and s.passable:
			s.creature = Villager()
			succeed = True
			
	if succeed:
		Tomb.gui.push_message("Angry villagers approach!")