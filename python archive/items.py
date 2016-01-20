from .features import TombEntity
from .tomb import Tomb

#note that an item picked up should return its owner's square, not its last square
class Item(TombEntity):
	def __init__(self):
		#from .tomb import Tomb
		super().__init__()
		self.symbol = "("
		self._name = "shovel"
		self._image = "other"
		self.stackable = 1
		self.n = 1
		self.parent = None
		self.value = 0
		
	#some items, such as StackedStones, turn into other items when picked up
	def pickup(self):
		return self
			
	def fall(self):
		floor = Tomb.zone.find_floor(self.x, self.y, self.z)
		self.move_to(self.x,self.y,floor)
		Tomb.gui.push_message(self.name + " falls to " + self.square.name)
		
	def move_to(self, x, y, z):
		self.square.items.take(self)
		Tomb.zone.grid(x,y,z).items.put(self)
		
	def destroy(self):
		if self.parent:
			self.parent.items.take(self)
		
	def stack(self, item):
		self.n += item.n
		item.destroy()
		
	@property
	def square(self):
		from .features import TombSquare
		if isinstance(self.parent,TombSquare):
			return self.parent
		else:
			return self.parent.square
		
	@property
	def name(self):
		if self.n == 1:
			return self._name
		else:
			return self._name + " (" + str(self.n) + ")"
					

class CorpseItem(Item):
	def __init__(self):
		super().__init__()
		self.symbol = "%"
		self._name = "corpse"
		self.image = "corpse"
		self.fg = "brown4"
		self.value = 1
		
		
class StoneItem(Item):
	def __init__(self, n=1):
		super().__init__()
		self.symbol = "*"
		self._name = "stone"
		self.fg = "gray72"
		self._image = "stone"
		self.stackable = 10
		self.n = n
		
class GemItem(Item):
	def __init__(self, n=1):
		super().__init__()
		self.symbol = "*"
		self._name = "gem"
		self.fg = "blue"
		self._image = "gem"
		self.stackable = 10
		self.n = n
		self.value = 2
		
class RubyItem(Item):
	def __init__(self, n=1):
		super().__init__()
		self.symbol = "*"
		self._name = "ruby"
		self.fg = "red"
		self._image = "ruby"
		self.n = n
		self.value = 3

class StackedStoneItem(Item):
	def __init__(self, n=1):
		super().__init__()
		self.symbol = "\u25CB"
		self._name = "stacked stone"
		self.fg = "gray72"
		self._image = "stacked"
		self.stackable = 10
		self.n = n
		
	#turns into a normal stone item if disturbed
	def pickup(self):
		return StoneItem(self.n)