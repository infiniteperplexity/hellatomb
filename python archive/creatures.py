from .features import TombEntity
from .tomb import Tomb, DeathEvent
import random

moods = {	"loyal": 0, #the player, or on the player's team
			"friendly": 1, #allied with the player, but can be angered and won't fight angered
			"neutral": 2, #won't fight most things
			"angry": 3, #used to be friendly or neutral, but now hates player
			"hostile": 4, #opposed to the player and allies
			"hateful": 5, #hates all but its own kind
			"berserk": 6} #attacks everything
			
class Creature(TombEntity):
	def __init__(self):
		super().__init__()
		self.symbol = '&'
		self._name = "creeping feature"
		self._image = "other"
		self.task = None
		self.ai = WanderingAI(self)
		self.equipment = Equipment(self)
		self.mood = moods["neutral"]
		self.toughness = 3
		self.wounds = 0
		self.prowess = 1
		self.minions = []
		self.sight_range = 8
		self.leaves_corpse = True
		
	def spend_action(self):
		pass
		
	def explore(self):
		for square in Tomb.zone.subgrid([self.x-self.sight_range,self.y-self.sight_range,self.z-self.sight_range],[self.x+self.sight_range,self.y+self.sight_range,self.z+self.sight_range]):
			if self.can_see(square,self.sight_range):
				square.explored = True
				square.visible = True	
				
		
	def doAI(self):
		self.ai.go()
	
	def build_wall(self, target):
		if target.solid():
			Tomb.gui.push_message("There is already a wall there.")
			return

		enough = 5
		from .items import StackedStoneItem, StoneItem
		stacked_tally = 0
		succeed = False
	
		for item in target.items:
			if isinstance(item,StackedStoneItem):
				stacked_tally += item.n
				#if there are at least ten, complete the wall
				if stacked_tally >= enough:
					for item in target.items:
						if isinstance(item,StackedStoneItem):
							item.destroy()
					target.material = 2 #cobblestone
					target.durability = 10
					succeed = True
					Tomb.gui.push_message(self.name + " completes a wall.")
					if self.square == target and not self.square.ceiling().solid():
						self.move_to(self.x,self.y,self.z+1)
		if not succeed:
			for item in self.items:
				if isinstance(item,StoneItem):
					Tomb.gui.push_message(self.name + " stacks a stone on " + target.name + ".")
					if item.n == 1:
						item.destroy()
					else:
						item.n-=1
					target.items.put(StackedStoneItem())
					succeed = True
					break
		if succeed:
			self.spend_action()
		else:
			Tomb.gui.push_message("No stone available.")
		
	def fall(self):
		floor = Tomb.zone.find_floor(self.x, self.y, self.z)
		self.move_to(self.x,self.y,floor)
		Tomb.gui.push_message(self.name + " falls to " + self.square.name)
		
	def dig(self, square):
		if square.solid():
			Tomb.gui.push_message(self.name + " digs into " + square.name + ".")
			square.dismantle(1)
			self.spend_action()
	
	def dismantle(self, feature):
		Tomb.gui.push_message(self.name + " chips away at " + feature.name + ".")
		feature.dismantle(1)
		self.spend_action()
			
	def die(self):
		Tomb.publish(DeathEvent(self))
		
	def mourn(self, event):
		if event.creature in self.minions:
			self.minions.remove(event.creature)
			Tomb.gui.push_message(self.name + " mourns the death of " + event.creature.name + ".")
			
	def is_hostile(self, creature):
		if self.mood == moods["loyal"]:
			if creature.mood in (moods["hostile"],moods["hateful"],moods["berserk"]):
				return True
		elif self.mood == moods["friendly"]:
			if creature.mood in (moods["hateful"],moods["berserk"]):
				return True
		elif self.mood == moods["neutral"]:
			if creature.mood in (moods["hateful"],moods["berserk"]):
				return True
		elif self.mood == moods["angry"]:
			if creature.mood in (moods["loyal"],moods["hostile"],moods["hateful"],moods["berserk"]):
				return True
		elif self.mood == moods["hostile"]:
			if creature.mood in (moods["loyal"],moods["friendly"]):
				return True
		elif self.mood == moods["hateful"]:
			if not isinstance(self,creature.__class__):
				return True
		elif self.mood == moods["berserk"]:
			return True
		return False
		
	def is_friendly(self, creature):
		if self.mood == moods["loyal"]:
			if creature.mood in (moods["loyal"],moods["friendly"]):
				return True
		elif self.mood == moods["friendly"]:
			if creature.mood in (moods["loyal"],moods["friendly"]):
				return True
		elif self.mood == moods["neutral"]:
			if creature.mood in (moods["neutral"],moods["angry"]):
				return True
		elif self.mood == moods["angry"]:
			if creature.mood in (moods["neutral"],moods["angry"]):
				return True
		elif self.mood == moods["hostile"]:
			if creature.mood == moods["hostile"]:
				return True
		elif self.mood == moods["hateful"]:
			if isinstance(self,creature.__class__):
				return True
		elif self.mood == moods["berserk"]:
			return False
		return False
		
		
	def displace(self, target):
		square1 = self.square
		square2 = target.square
		square2.creature = self
		square1.creature = target
		self.send_message(self.name + " displaces " + target.name + ".")
		self.spend_action()
	
	def attack(self, target):
		from .tomb import AttackEvent
		attack = AttackEvent(self,target)
		Tomb.publish(attack)
		self.spend_action()
		
	def try_move(self,x,y,z):
		#it would be nice if NPCs tried a little more persistently
		square = Tomb.zone.grid(self.x+x,self.y+y,self.z+z)
		target = square.level_ground()
		if not target:
			if square.solid():
				self.send_message(self.name + " bumps into " + square.name + ".")
			else:
				self.send_message(self.name + " avoids falling into pit at " + square.name + ".")
			self.do_nothing()
			return False
			
		if target==self.square:
			return False
			
		if target.creature:
			if self.is_hostile(target.creature):
				self.attack(target.creature)
				#not sure what I should return here...
			elif self.is_friendly(target.creature):
				if self in target.creature.minions:
					self.send_message(self.name + " would like to move past " + target.creature.name + ".")
					self.do_nothing()
					return False
				else:
					self.displace(target.creature)
					return True
			else:
				self.send_message(self.name + " bumps into " + target.creature.name + ".")
				self.do_nothing()
				return False
		elif target.feature and target.feature.solid:
			self.send_message(self.name + " bumps into " + target.feature.name + ".")
			self.do_nothing()
			return False
		else:
			self.do_move(target.x,target.y,target.z)
			return True
	
		
	def do_move(self,x,y,z):
		self.move_to(x,y,z)
		self.spend_action()
		
	def move_to(self,x,y,z):
		self.square.creature = None
		Tomb.zone.grid(x,y,z).creature = self
		
	def get(self):
		if self.square.items:
			item = self.square.items[-1]
			self.square.items.take(item)
			item = item.pickup()
			self.items.put(item)
			#from .tomb import Tomb
			Tomb.gui.push_message(self.name + " picks up " + item.name + ".")
			self.spend_action()
		
	def drop(self):
		if self.items:
			item = self.items[-1]
			self.items.take(item)
			self.square.items.put(item)
			#from .tomb import Tomb
			Tomb.gui.push_message(self.name + " drops " + item.name + ".")
			self.spend_action()
			
	def do_nothing(self):
		pass
		
		
class Zombie(Creature):
	def __init__(self):
		super().__init__()
		self.symbol = 'z'
		self.fg = "dark green"
		self._name = "zombie"
		self._image = "zombie"
		self.mood = moods["loyal"]
		self.leaves_corpse = False
		

class Ghoul(Creature):
	def __init__(self):
		super().__init__()
		self.symbol = 'z'
		self.fg = "dark green"
		self._name = "ghoul"
		self._image = "ghoul"
		self.mood = moods["hostile"]
		self.toughness = 5
		self.leaves_corpse = False
		
class CaveSquid(Creature):
	def __init__(self):
		super().__init__()
		self.symbol = 's'
		self.fg = "dark green"
		self._name = "cave squid"
		self._image = "squid"
		self.mood = moods["hostile"]
		self.toughness = 5
		self.leaves_corpse = False
		
		
class Villager(Creature):
	def __init__(self):
		super().__init__()
		self.symbol = 'h'
		self._name = "angry villager"
		self.mood = moods["hostile"]
		self._image = "villager"
		
		
class ThePlayer(Creature):
	def __init__(self):
		super().__init__()
		self.symbol = "@"
		self._name = "The Necromancer"
		self._image = "necro"
		self.spells = []
		self.spells.append(AnimateDeadSpell(self))
		self.minions = []
		self.jobs = []
		self.ai = None
		self.mood = moods["loyal"]
		self.fg = "navy"
		self.toughness = 5
		self._contempt = 2
		self._infamy = 0
		
	def is_hostile(self,creature):
		if creature.mood in (moods["angry"],moods["hostile"],moods["hateful"],moods["berserk"]):
			return True
		else:
			return False
			
	@property
	def anxiety(self):
		return len(self.minions)
	
	@property	
	def infamy(self):
		return len(self.minions)
		
	@property
	def contempt(self):
		return self._contempt
	
	def doAI(self):
		pass
		
	def do_nothing(self):
		pass
		
	def brood(self):
		Tomb.gui.push_message(self.name + " broods on the dark mysteries of the cosmos.")
	
		
	def try_move(self,x,y,z):
		#it would be nice if NPCs tried a little more persistently
		square = Tomb.zone.grid(self.x+x,self.y+y,self.z+z)
		target = square.level_ground()
		if not target:
			if square.solid():
				self.dig(square)
			else:
				self.send_message(self.name + " avoids falling into pit at " + square.name + ".")
			return False
			
		if target==self.square:
			return False
			
		if target.creature:
			if self.is_hostile(target.creature):
				self.attack(target.creature)
			elif self.is_friendly(target.creature):
				self.displace(target.creature)
			else:
				self.send_message(self.name + " bumps into " + target.creature.name + ".")
				return False
		elif target.feature and target.feature.solid:
			self.dismantle(target.feature)
			return False
		else:
			self.do_move(target.x,target.y,target.z)
			return True
			
	def move_to(self,x,y,z):
		super().move_to(x,y,z)
		self.glance(self.square)
		self.spend_action()

	def glance(self, square):
		for item in square.items:
			Tomb.gui.push_message("- " + item.name)
	
	def look(self, square):
		if not square.explored:
			Tomb.gui.push_message("Unexplored " + square.name + ".")
			return
			
		from .features import materials
		names = {v: k for k, v in materials.items()}
		Tomb.gui.push_message(names[square.material] + " " + square.name + "; " + names[square.floor().material]+ " floor; " + names[square.ceiling().material] + " ceiling.")
		if square.creature:
			Tomb.gui.push_message("- " + square.creature.name)
		self.glance(square)
		
	def wait(self):
		self.spend_action()
		
	def spend_action(self):
		Tomb.turn()
		
	def die(self):
		super().die()
		from .gui import DeadContext
		Tomb.gui.push_message("Game over!")
		Tomb.controls = DeadContext()
	

class Equipment(dict):
	def __init__(self, owner):
		self.owner = owner
		self["main hand"] = None
		self["off hand"] = None
		self["head"] = None
		self["torso"] = None
	
	
class Spell(object):
	def __init__(self, owner):
		self.owner = owner
		self.cooldown = 0
		self.ticks = 10
		self._name = "null spell"
		
	@property
	def name(self):
		if self.cooldown > 0:
			return self._name + " (" + str(self.cooldown) + ")"
		else:
			return self._name
			
	def cool_down(self, listener, event):
		if self.cooldown > 0:
			self.cooldown -= 1
			if self.cooldown <= 0:
				Tomb.unsubscribe(listener)
		
			
	def cast(self):
		from .tomb import Tomb
		Tomb.gui.push_message(self.owner.name + " casts " + self.name + ".")
	
		
class AnimateDeadSpell(Spell):
	def __init__(self, owner):
		super().__init__(owner)
		self._name = "animate dead"

		
	def cast(self):
		from .items import CorpseItem
		if self.cooldown > 0:
			Tomb.gui.push_message("Too soon to cast " + self.name + ".")
		corpse = None
		for item in self.owner.square.items:
			if isinstance(item, CorpseItem):
				corpse = item
				break
		
		if not corpse:
			for item in self.owner.items:
				if isinstance(item, CorpseItem):
					corpse = item
					break
			
		if corpse:
			#square = corpse.square.closest_space()
			square = corpse.square.any_neighbor()
			if square:
				zombie = Zombie()
				square.creature = zombie
				corpse.destroy()
				Tomb.gui.push_message(zombie.name + " rises from the grave!")
				self.owner.minions.append(zombie)
				#owner starts waiting for zombie to die
				from .tomb import MourningListener
				Tomb.subscribe(MourningListener(self.owner))
				self.cooldown+=self.ticks+1
				#spell starts waiting for cooldown to wear off
				from .tomb import CooldownListener
				Tomb.subscribe(CooldownListener(self))
				Tomb.player.spend_action()
			else:
				Tomb.gui.push_message("Too crowded to create a zombie.")
		else:
			Tomb.gui.push_message("No corpse available.")

			

#for now, the only task is "build walls"
class Task(TombEntity):
	def __init__(self, square):
		self.square = square
		self.square.designation = self
		self.worker = None
		Tomb.player.jobs.append(self)
		self.blurb = "do a random task"
		self.ai = WanderingAI
		self._image = "designate"
		
	def assign(self, creature):
		creature.task = self
		creature.ai = self.ai(creature, self)
		self.worker = creature
		Tomb.gui.push_message(creature.name + " wants to " + self.blurb + " " + self.square.name + ".")
		from .tomb import TaskListener
		Tomb.subscribe(TaskListener(self, creature))

	def complete(self):
		self.worker.task = None
		self.square.designation = None
		if self in Tomb.player.jobs:
			Tomb.player.jobs.remove(self)
		
	def abandon(self):
		Tomb.gui.push_message(self.worker.name + " failed to " + self.blurb + " " + self.square.name + ".")
		self.worker.task = None
		self.worker = None
		
	def delete(self):
		if self.worker:
			self.worker.task = None
			self.worker.ai = WanderingAI(self.worker)
			
		self.square.designation = None
		if self in Tomb.player.jobs:
			Tomb.player.jobs.remove(self)
		
class BuildTask(Task):
	def __init__(self, square, down=False):
		super().__init__(square)
		self._image = "walltask"
		self.blurb = "build a wall at"
		self.ai = BuildWallAI
		

class DigTask(Task):
	def __init__(self, square, down=False):
		super().__init__(square)
		self._image = "digtask"
		self.blurb = "dig away"
		self.ai = DigAI
		
	def abandon(self):
		super().abandon()
		#this may be a bit of a kludge
		self.delete()
		
class GuardTask(Task):
	def __init__(self, square, down=False):
		super().__init__(square)
		self._image = "guardtask"
		self.blurb = "guard"
		self.ai = GuardAI
		self._image = "guardtask"
	


class GatherTask(Task):
	def __init__(self, square, down=False):
		super().__init__(square)
		self.radius = 1
		self.max = 10
		self.min = 3
		self._image = "stockpile"
		self.blurb = "move goods to"
		self.ai = GatherAI
		self._image = "stockpile"
					
	def assign(self, creature):
		from .features import djikstra_find
		from .items import Item
		if djikstra_find(self.square,Item, min=self.min+1, max=self.max-1):
			super().assign(creature)
		
class GuardAI(object):
	def __init__(self, creature, task):
		self.creature = creature
		self.task = task
		self.path = []
		
	def go(self):
		creatures = self.creature.nearby_creatures(8)
		for creature in creatures:
			if self.creature.is_hostile(creature) and self.creature.can_see(creature,8):
				self.creature.ai = HunterKillerAI(self.creature,creature)
				#self.creature.do_nothing()
				return
		if self.creature.square == self.task.square:
			r = random.randint(1,9)
			if r == 1:
				self.creature.try_move(-1,-1,0)
			elif r == 2:
				self.creature.try_move(0,-1,0)
			elif r == 3:
				self.creature.try_move(1,-1,0)
			elif r == 4:
				self.creature.try_move(-1,0,0)
			elif r == 5:
				self.creature.try_move(0,0,0)
			elif r == 6:
				self.creature.try_move(1,0,0)
			elif r == 7:
				self.creature.try_move(-1,1,0)			
			elif r == 8:
				self.creature.try_move(0,1,0)
			elif r == 9:
				self.creature.try_move(1,1,0)
			return
			
		if self.path:
			square = self.path.pop(0)
			x = square.x - self.creature.x
			y = square.y - self.creature.y
			#z = square.z - self.creature.z
			z = 0 # for now...
			succeeded = self.creature.try_move(x,y,z)
			if succeeded == False:
				print("got here")
				self.task.abandon()
				self.creature.ai = WanderingAI(self.creature)
				self.creature.do_nothing()
			return
		if self.creature.distance(self.task.square) > 3:
			self.path = self.creature.path(self.task.square)
			if self.path:
				self.path.append(self.task.square)
				self.path.pop(0)
		else:
			self.task.abandon()
			self.creature.ai = WanderingAI(self.creature)
			return
					
		r = random.randint(1,9)
		if r == 1:
			self.creature.try_move(-1,-1,0)
		elif r == 2:
			self.creature.try_move(0,-1,0)
		elif r == 3:
			self.creature.try_move(1,-1,0)
		elif r == 4:
			self.creature.try_move(-1,0,0)
		elif r == 5:
			self.creature.try_move(0,0,0)
		elif r == 6:
			self.creature.try_move(1,0,0)
		elif r == 7:
			self.creature.try_move(-1,1,0)			
		elif r == 8:
			self.creature.try_move(0,1,0)
		elif r == 9:
			self.creature.try_move(1,1,0)
		

class WanderingAI(object):
	def __init__(self, creature):
		self.creature = creature
		
	def go(self):
		creatures = self.creature.nearby_creatures(8)
		for creature in creatures:
			if self.creature.is_hostile(creature) and self.creature.can_see(creature,8):
				self.creature.ai = HunterKillerAI(self.creature,creature)
				self.creature.do_nothing()
				return
				
		r = random.randint(1,9)
		if r == 1:
			self.creature.try_move(-1,-1,0)
		elif r == 2:
			self.creature.try_move(0,-1,0)
		elif r == 3:
			self.creature.try_move(1,-1,0)
		elif r == 4:
			self.creature.try_move(-1,0,0)
		elif r == 5:
			self.creature.try_move(0,0,0)
		elif r == 6:
			self.creature.try_move(1,0,0)
		elif r == 7:
			self.creature.try_move(-1,1,0)			
		elif r == 8:
			self.creature.try_move(0,1,0)
		elif r == 9:
			self.creature.try_move(1,1,0)
					
 
	

class GatherAI(object):
	def __init__(self, creature, task):
		self.creature = creature
		self.task = task
		self.target = self.task.square
		self.path = []
		
	def go(self):
		from .features import djikstra_find
		from .items import Item
		if self.creature.distance(self.target.square) <= 1 and self.creature.items:
			self.creature.drop()
			self.path = []
			return
			
		if self.creature.distance(self.target.square) > 1 and self.creature.square.items:
			self.creature.get()
			self.path = []
			return
			
		if self.path:    
			square = self.path.pop(0)
			x = square.x - self.creature.x
			y = square.y - self.creature.y
			#z = square.z - self.creature.z
			z = 0 # for now...
			succeeded = self.creature.try_move(x,y,z)
			if succeeded == False:
				print("fail one")
				self.task.abandon()
				self.creature.ai = WanderingAI(self.creature)
				self.creature.do_nothing()
			return
		
		if self.creature.items:
			target = self.target
			self.path = self.creature.path(target)
			self.path.pop(0)
			return
		else:
			#find items near the stockpile
			target = djikstra_find(self.target,Item, min=self.task.min, max=self.task.max)
			if target:
				self.path = self.creature.path(target)
				self.path.pop(0)
			else:
				#don't delete the task, but abandon it for now
				print("fail two")
				self.task.abandon()
				self.creature.ai = WanderingAI(self.creature)
				#self.creature.do_nothing()
		
		
class HunterKillerAI(object):
	def __init__(self, creature, target):
		self.creature = creature
		self.target = target
		Tomb.subscribe(self)
	
	#for the time being, it doesn't work like this...	
	#def listen(self, listener, event):
	def listen(self, event):
		if isinstance(event,DeathEvent) and self.target == event.creature:
			Tomb.gui.push_message("Its foe slain, " + self.creature.name + " wanders off.")
			self.creature.ai = WanderingAI(self.creature)
			#Tomb.unsubscribe(listener)
			Tomb.unsubscribe(self)
			
	def go(self):
		#check for target having left the zone
		#...
		path = self.creature.path(self.target)
		#this is no longer how pathing works...
		if path:
			path.append(self.target.square)
			path.pop(0)
			#path.pop
		else:
			print("path failed")
			self.creature.ai = WanderingAI(self.creature)
			return
		
		square = path.pop(0)
		x = square.x - self.creature.x
		y = square.y - self.creature.y
		z = square.z - self.creature.z
		succeeded = self.creature.try_move(x,y,z)
		if succeeded == False:
			self.creature.ai = WanderingAI(self.creature)
			self.creature.do_nothing()
		
	
			
class BuildWallAI(object):
	def __init__(self, creature, task):
		self.creature = creature
		self.task = task
		self.path = []
		self.enough = 5
		
	def go(self):
		from .features import djikstra_find
		from .items import StoneItem, StackedStoneItem
		#if we're already heading somewhere, keep going
		if self.path:
			square = self.path.pop(0)
			x = square.x - self.creature.x
			y = square.y - self.creature.y
			#z = square.z - self.creature.z
			z = 0 # for now...
			succeeded = self.creature.try_move(x,y,z)
			if succeeded == False:
				self.task.abandon()
				self.creature.ai = WanderingAI(self.creature)
				self.creature.do_nothing()
				#self.creature.doAI()
		else:
			#otherwise, count total available stones
			stone_tally = 0
			for item in self.task.square.items:
				if isinstance(item,StackedStoneItem):
					stone_tally += item.n
			
			for item in self.creature.items:
				if isinstance(item,StoneItem):
					stone_tally += item.n
					
			#if there aren't enough, try to pick one up or find one
			if stone_tally < self.enough:
				for item in self.creature.square.items:
					if isinstance(item,StoneItem):
						self.creature.get()
						return
						
				target = djikstra_find(self.creature,StoneItem, max=12)
				if target:
					self.path = self.creature.path(target)
					self.path.pop(0)
					self.creature.do_nothing()
					#self.creature.doAI()
				else:
					#if there are no stones, delete the task
					self.task.delete()
					self.creature.do_nothing()
					#self.creature.doAI()
					
			elif stone_tally >= self.enough:
				target = self.task.square
				#if we have enough stone and are next to the target, start building
				if target in self.creature.neighbors():
					self.creature.build_wall(target)
					if target.material == 2: #cobblestone
						self.task.complete()
						self.creature.ai = WanderingAI(self.creature)
						self.creature.do_nothing()
				else:
					if not target.passable:
						self.task.abandon()
						self.creature.ai = WanderingAI(self.creature)
						self.creature.do_nothing()
					else:
						self.path = self.creature.path(target)
						if self.path:
							self.path.pop(0)
							self.path.pop()
						else:
							self.task.abandon()
							self.creature.ai = WanderingAI(self.creature)
							self.creature.do_nothing()
						#self.creature.doAI()
						
						
class DigAI(object):
	def __init__(self, creature, task):
		self.creature = creature
		self.task = task
		self.path = []
		
	def go(self):
		target = self.task.square
		if not target.solid():
			self.task.complete()
			self.creature.ai = WanderingAI(self.creature)
			
		if self.path:
			square = self.path.pop(0)
			x = square.x - self.creature.x
			y = square.y - self.creature.y
			#z = square.z - self.creature.z
			z = 0 # for now...
			succeeded = self.creature.try_move(x,y,z)
			if succeeded == False:
				self.task.abandon()
				self.creature.ai = WanderingAI(self.creature)
				self.creature.do_nothing()
				#self.creature.doAI()
		else :
			if self.creature.square in target.edges():
				self.creature.dig(target)
			else:
				self.path = self.creature.path(target)
				if self.path:
					self.path.pop(0)
					#if self.path and self.path[-1].solid():
						#self.path.pop()
				else:
					print("failed path")
					self.task.abandon()
					self.creature.ai = WanderingAI(self.creature)
					self.creature.do_nothing()
				#self.creature.doAI()