import random
from .tomb import Tomb

materials = {	"void": -1,
				"empty": 0,
				"stone": 1,
				"cobblestone": 2}

class Zone(object):
	def __init__(self):
		self.height = 64;
		self.width = 64;
		self.depth = 24;
		self._grid = []
		self.creatures = []
		for x in range(self.width):
			self._grid.append([])
			for y in range(self.height):
				self._grid[x].append([])
				for z in range(self.depth):
					self._grid[x][y].append([])
					self._grid[x][y][z] = TombSquare(x,y,z)
	
	def grid(self, x, y, z):
		if x < 0 or y < 0 or z < 0 or x >= self.width or y >= self.height or z >= self.depth:
			return TombSquare.null_square(x,y,z)
		else:
			return self._grid[x][y][z]
	
	def squares(self):
		s = []
		for x in self._grid:
			for y in x:
				for square in y:
					s.append(square)
		return s
			
	def subgrid(self,a1,a2):
		x0 = min(a1[0],a2[0])
		x1 = max(a1[0],a2[0])
		y0 = min(a1[1],a2[1])
		y1 = max(a1[1],a2[1])
		z0 = min(a1[2],a2[2])
		z1 = max(a1[2],a2[2])
		x0 = min(max(x0,0),self.width-1)
		x1 = min(max(x1,0),self.width-1)
		y0 = min(max(y0,0),self.height-1)
		y1 = min(max(y1,0),self.height-1)
		z0 = min(max(z0,0),self.depth-1)
		z1 = min(max(z1,0),self.depth-1)
		sub = []
		for x in range(x0,x1+1):
			for y in range(y0,y1+1):
				for z in range(z0,z1+1):
					sub.append(self._grid[x][y][z])
		return sub
		
	def borders2d(self,a1,a2,z):
		x0 = min(a1[0],a2[0])
		x1 = max(a1[0],a2[0])
		y0 = min(a1[1],a2[1])
		y1 = max(a1[1],a2[1])
		x0 = min(max(x0,0),self.width-1)
		x1 = min(max(x1,0),self.width-1)
		y0 = min(max(y0,0),self.height-1)
		y1 = min(max(y1,0),self.height-1)
		sub = set()
		for x in x0,x1:
			for y in range(y0,y1+1):
				sub.add(self.grid(x,y,z))
		for y in y0,y1:
			for x in range(x0,x1+1):
				sub.add(self.grid(x,y,z))
		return list(sub)
		
	def find_floor(self,x,y,start_z=None):
		if not start_z:
			start_z  = self.depth-2
		ground = start_z
		for z in range(start_z,1,-1):
			if self.grid(x,y,z).solid():
				break
			else:
				ground = z
		return ground
			
			
	def populate(self):
		from math import floor
		#Create borders
		for x in (0, self.width-1):
			for y in range(self.height):
				for z in range(self.depth):
					self._grid[x][y][z].material = materials["void"]
					
		for y in (0, self.height-1):
				for x in range(self.width):
					for z in range(self.depth):
						self._grid[x][y][z].material = materials["void"]
						
		#create altitude
		ground = 14
		for x in range(1,self.width-1):
			for y in range(1,self.height-1):
				for z in range(1,self.depth-1):
					if z > ground:
						self._grid[x][y][z].material = materials["empty"]
					else:
						self._grid[x][y][z].material = materials["stone"]

		hills = cave(self.subgrid([1,1,ground+1],[self.width,self.height,ground+1]), p=0.5, passes=4)
		next_hills = []
		for x in range(len(hills)):
			for y in range(len(hills[0])):
				if hills[x][y] == False:
					self._grid[x][y][ground+1].material = materials["stone"]
					next_hills.append(self._grid[x][y][ground+1])
											
		for z in range(ground+2,ground+4):				
			hills = cave(next_hills, p=0.6,passes=4,rule=hill_rule)
			next_hills = []
			for x in range(len(hills)):
				for y in range(len(hills[0])):
					if hills[x][y] == False and self._grid[x][y][z-1].material == materials["stone"]:
						self._grid[x][y][z].material = materials["stone"]
						next_hills.append(self._grid[x][y][z])							
					
		
						
		
		from .items import GemItem, RubyItem, CorpseItem, StoneItem
		from .creatures import CaveSquid
		for z in range(1,ground-4):
			for y in range(1,self.height-1):
				for x in range(1,self.width-1):
					if random.random() < 0.05:
						Tomb.zone.grid(x,y,z).items.put(GemItem())
						
		Tomb.zone.grid(random.randint(1,self.width-1), random.randint(1, self.height-1), random.randint(1, ground-4)).items.put(RubyItem())
		
		for z in range(4,ground-2,2):
			caves = cave(self.subgrid([1,1,1],[self.width,self.height,1]),p=0.125, passes=4, rule=less_empty_cave(1))
			for y in range(1,self.height-1):
				for x in range(1,self.width-1):
					if caves[x][y] == False:
						Tomb.zone.grid(x,y,z).material = materials["empty"]
						if random.random() < 0.05:
							pass
							Tomb.zone.grid(x,y,z).creature = CaveSquid()
		
						
		graveyards = cave(self.subgrid([1,1,1],[self.width,self.height,1]),p=0.2,passes=4,rule=less_empty_cave(1))
		for x in range(len(graveyards)):
			for y in range(len(graveyards[0])):
				if graveyards[x][y] == False and random.random()<=0.1:
					Tomb.zone.grid(x,y,self.find_floor(x,y)).feature = Tombstone()
					Tomb.zone.grid(x,y,self.find_floor(x,y)).floor().items.put(CorpseItem())
				
		stones = cave(self.subgrid([1,1,1],[self.width,self.height,1]),p=0.4,passes=3,rule=less_empty_cave(1))
		for x in range(len(stones)):
			for y in range(len(stones[0])):
				if stones[x][y] == False and random.random()<=0.1:
					for i in range(random.randint(1,11)):
						Tomb.zone.grid(x,y,self.find_floor(x,y)).items.put(StoneItem())
					

class TombEntity(object):
	def __init__(self):
		self._x = 0
		self._y = 0
		self._z = 0
		self.items = Inventory(self)
		self._name = ""
		self.bg = None
		self.fg = None
		self.durability = 10
		self.damage = 0
		self._image = "other"
		self.visible = False
		
	def send_message(self, msg):
		if Tomb.player.can_see(self,8):
			Tomb.gui.push_message(msg)
		
	def distance(self,target):
		from math import sqrt, ceil
		to_x = target.x
		to_y = target.y
		to_z = target.z
		return ceil(sqrt((self.x-to_x)**2 + (self.y-to_y)**2 + (self.z-to_z)**2))
		
	def exact_distance(self,target):
		from math import sqrt, ceil
		to_x = float(target.x)
		to_y = float(target.y)
		to_z = float(target.z)
		return sqrt((float(self.x)-to_x)**2 + (float(self.y)-to_y)**2 + (float(self.z)-to_z)**2)
	
	def edges(self):
		squares = []
		for x in (-1,0,1):
			for y in (-1,0,1):
				for z in (-1,0,1):
					square = Tomb.zone.grid(self.x+x,self.y+y,self.z+z)
					if square and square != self.square:
						squares.append(square)
		return squares
						
	
	def path(self,target):
		return a_star(self,target)
			
	def __repr__(self):
		return self.name
		
	@property
	def square(self):
		return self._square
				
	@square.setter
	def square(self, s):
		self._square = s
		
	@property
	def x(self):
		return self.square.x
		
	@property
	def y(self):
		return self.square.y
		
	@property
	def z(self):
		return self.square.z
		
	@property
	def name(self):
		return self._name
					
	@name.setter
	def name(self, n):
		self._name = n
		
	@property
	def image(self):
		return self._image
		
	@image.setter
	def image(self, img):
		self._image = img
		
	def neighbors(self):
		reachable = []
		for x in (-1,0,1):
			for y in (-1,0,1):
				square = Tomb.zone.grid(self.x+x,self.y+y,self.z)
				if square != self.square and self.can_pass(self.square, square):
					reachable.append(self.can_pass(self.square, square))
		return reachable
	
	def dismantle(self):
		pass
		
	def any_neighbor(self):
		neighbors = self.neighbors()
		if not neighbors:
			return None
		from random import shuffle
		shuffle(neighbors)
		return neighbors[0]
		
		
	def closest_space(self):
		square = self.square
		#could change to can_pass
		if (square.passable):
			return square
		x = square.x
		y = square.y
		z = square.z
		tries = 0
		while tries < 50:
			tries += 1
			rx = random.randint(-1,1)
			ry = random.randint(-1,1)
			if Tomb.zone.grid(x+rx,y+ry,z).passable:
				return Tomb.zone.grid(x+rx,y+ry,z)
		return None
	
	def can_pass(self, square1, square2):
		if square2.passable:
			if square2.floor().solid():
				return square2
			elif square2.floor().floor().solid():
				return square2.floor()
		elif square2.solid() and square2.ceiling().passable and square1.ceiling().passable:
			return square2.ceiling()
		else:
			return False
			
		
	def can_see(self,entity,n):
		path = self.line(entity)
		if path:
			path.pop()
		if self.distance(entity)>n:
			return False	
		for square in path:
			if square.solid():
				return False
		return True
			
	def floor(self):
		return Tomb.zone.grid(self.x,self.y,self.z-1)
		
	def ceiling(self):
		return Tomb.zone.grid(self.x,self.y,self.z+1)
		
	def nearby_creatures(self, r):
		creatures = []
		#can see some creatures it shouldn't?
		squares = Tomb.zone.subgrid([self.x-r,self.y-r,self.z-1],[self.x+r,self.y+r,self.z+1])
		for square in squares:
			if square.creature and square.creature != self:
				creatures.append(square.creature)
				
		return sorted(creatures, key=lambda creature: self.distance(creature))

	def neighbors3d(self):
		n = []
		for square in Tomb.zone.subgrid([self.x-1,self.y-1,self.z-1],[self.x+1,self.y+1,self.z+1]):
			if square and square!=self.square:
				n.append(square)
		return n

	def line(self, target):
		if self.square == target.square:
			return []
		path = [self.square]
		x = self.x
		y = self.y
		z = self.z
		dx = target.x - self.x
		dy = target.y - self.y
		dz = target.z - self.z
		xi = -1 if dx < 0 else 1
		l = abs(dx)
		yi = -1 if dy < 0 else 1
		m = abs(dy)
		zi = -1 if dz < 0 else 1
		n = abs(dz)
		dx2 = l << 1
		dy2 = m << 1
		dz2 = n << 1
		if l>=m and l>=n:
			e1 = dy2-l
			e2 = dz2-l
			for i in range(l):
				if e1>0:
					y += yi
					e1 -= dx2
				if e2>0:
					z += zi
					e2 -= dx2
				e1 += dy2
				e2 += dz2
				x += xi
				path.append(Tomb.zone.grid(x,y,z))
		elif m>=l and m>=n:
			e1 = dx2-m
			e2 = dz2-m
			for i in range(m):
				if e1>0:
					x += xi
					e1 -= dy2
				if e2>0:
					z += zi
					e2 -= dy2
				e1 += dx2
				e2 += dz2
				y += yi
				path.append(Tomb.zone.grid(x,y,z))
		else:
			e1 = dy2-n
			e2 = dx2-n
			for i in range(n):
				if e1>0:
					y += yi
					e1 -= dz2
				if e2>0:
					x += xi
					e2 -= dz2
				e1 += dy2
				e2 += dx2
				z += zi
				path.append(Tomb.zone.grid(x,y,z))
		return path
	
		
		
class TombSquare(TombEntity):
	def __init__(self,x,y,z):
		super().__init__()
		self._x = x
		self._y = y
		self._z = z
		self.material = materials["empty"]
		self._creature = None
		self._feature = None
		self._square = self
		self._name = "square at " + str(x) + ", " + str(y) + ", " + str(z)
		self.designation = None
		self.durability = 5
		self.explored = False
		#self.explored = True
		#self.visible = True
	
	@property
	def x(self):
		return self._x
		
	@property
	def y(self):
		return self._y
		
	@property
	def z(self):
		return self._z

	def dismantle(self, n):
		#add a turn listener to this eventually
		if self.material in (materials["stone"],materials["cobblestone"]):
			self.damage += n
		if self.damage >= self.durability:
			self.material = materials["empty"]
			Tomb.gui.push_message(self.name + " excavated.")
			from .items import StoneItem
			from random import randint
			for i in range(random.randint(1,5)):
				self.items.put(StoneItem())
			if not self.floor().solid():
				if self.creature:
					self.creature.fall()
				for item in self.items:
					item.fall()
			if not self.ceiling().solid():
				if self.ceiling().creature and not self.occupied():
					self.ceiling().creature.fall
				for item in self.ceiling().items:
					item.fall()
		
	def occupied(self):
		if self.creature or self.items:
			return True
		else:
			return False
			
	@staticmethod
	def null_square(x,y,z):
		square = TombSquare(x,y,z)
		square.material = materials["void"]
		return square
			
			
	@property
	def symbol(self):
		if not self.explored:
			return "\u2593"
		elif self.creature:
			return self.creature.symbol
		elif self.items:
			return self.items[-1].symbol
		elif self.designation:
			return "!"
		elif self.solid():
			if self.ceiling().solid():
				if self.ceiling().ceiling().solid():
					return "\u2588"
				elif self.material == materials["cobblestone"]:
					return self.cobblestone_symbol()
					#return "\u256C"
				else:
					#return "\u2191"
					return "^"
			elif self.ceiling().occupied() or self.ceiling().designation:
				return self.ceiling().symbol
			elif not self.floor().solid():
				return "\u2195"
				#return "\u00F7"
			else:
				return "\u2022"
		elif self.floor().solid():
			if self.ceiling().solid():
				return "'"
			else:
				return "\u2219"
		elif self.floor().occupied() or self.floor().designation:
			return self.floor().symbol
		elif self.floor().floor().solid():
			return "\u00B7"
		else:
			#return "\u2193"
			#return "\u02C5"
			#return "\u02C7"
			#return "\u17F4"
			#return "\u2D38"
			return "\u2193"
			#return " "
			#return "-"
			
			#\u2A4D is a good tombstone...
			
	@property
	def image(self):
		if not self.explored:
			return "unexplored"
		elif self.solid():
			if self.ceiling().solid():
				if self.ceiling().ceiling().solid():
					return "wall"
				else:
					return "peak"
			elif not self.floor().solid():
				return "overhang"
			else:
				return "floor+1"
		elif self.floor().solid():
			if self.ceiling().solid():
				return "roof"
			else:
				return "floor"
		elif self.floor().floor().solid():
			return "floor-1"
		else:
			return "pit"

			
	def show_color(self):
		if self.creature:
			return self.creature.fg
		elif self.items:
			return self.items[-1].fg
		elif self.designation:
			return "red"
		elif self.solid():
			if self.ceiling().solid():
				if self.ceiling().ceiling().solid():
					return None
				elif self.material == materials["cobblestone"]:
					return "gray50"
				else:
					return None
			elif self.ceiling().occupied() or self.ceiling().designation:
				return self.ceiling().show_color()
			else:
				return None
		elif self.floor().solid():
			return None
		elif self.floor().occupied() or self.floor().designation:
			return self.floor().show_color()
		elif self.floor().floor().solid():
			return None
		else:
			return None
			
	def cobblestone_symbol(self):
		north = Tomb.zone.grid(self.x,self.y-1,self.z).solid()
		south = Tomb.zone.grid(self.x,self.y+1,self.z).solid()
		east = Tomb.zone.grid(self.x+1,self.y,self.z).solid()
		west = Tomb.zone.grid(self.x-1,self.y,self.z).solid()
		if north:
			if south:
				if east:
					if west:
						return "\u256C" #NSEW
					else:
						return "\u2560" #NSE
				elif west:
					return "\u2563" #NSW
				else:
					return "\u2551" #NS
			elif east:
				if west: 
					return "\u2569" #NEW
				else: 
					return "\u255A" #NE
			elif west:
				return "\u255D" #NW
			else:
				return "\u2551" #N
		elif south:
			if east:
				if west:
					return "\u2566" #SEW
				else:
					return "\u2554" #SE
			elif west:
				return "\u2557" #SW
			else:
				return "\u2551" #S
		elif east or west:
			return "\u2550" #EW
		else:
			return "\u256C" #none
		
				
		
	def solid(self):
		if self.material == materials["empty"]:
			return False
		else:
			return True
		
	@property
	def passable(self):
		if self.creature:
			return False
		elif self.feature and self.feature.solid:
			return False
		elif self.solid():
			return False
		else:
			return True
		
	@property
	def creature(self):
		return self._creature
		
	@creature.setter
	def creature(self, c):
		self._creature = c
		if c:
			c.square = self
			if c not in Tomb.zone.creatures:
				Tomb.zone.creatures.append(c)
		
	@property
	def feature(self):
		return self._feature
		
	@feature.setter
	def feature(self, f):
		self._feature = f
		if f:
			f.square = self
			
	def level_ground(self):
		if self.solid():
			if not self.ceiling().solid():
				return self.ceiling()
			else:
				return None
		elif self.floor().solid():
			return self
		elif self.floor().floor().solid():
			return self.floor()
		else:
			return None
			
				
class TombFeature(TombEntity):
	def __init__(self):
		super().__init__()
		self.solid = False
		self.symbol = "#"
		self._name = "tombstone"
		self._image = "grave"

	def fall(self):
		floor = Tomb.zone.find_floor(self.x, self.y, self.z)
		self.move_to(self.x,self.y,floor)
		Tomb.gui.push_message(self.name + " falls to " + self.square.name)
			
	def move_to(self, x, y, z):
		self.square.feature = None
		Tomb.zone.grid(x,y,z).feature = self
		

class Tombstone(TombFeature):
	def __init__(self):
		super().__init__()
		self.solid = True
		self.symbol = "#"
		self._name = "tombstone"
		self._image = "grave"
		self.durability = 3
		
	def dismantle(self, n):
		from .items import StoneItem
		from random import randint
		self.damage += n
		if self.damage >= self.durability:
			Tomb.gui.push_message("The tombstone crumbles.")
			self.square.feature = None
			for i in range(random.randint(1,3)):
				self.square.items.put(StoneItem())
	
class Door(TombFeature):
	def __init__(self):
		super().__init__()
		self.solid = True
		self.symbol = "#"
		self._name = "door"
		self._image = "door"
		self.durability = 3
		
	def open(self):
		self.solid = False
		self._image = "open"
		
	def close(self):
		self.solid = True
		self._image = "door"
		

class Inventory(list):
	from .items import Item
	def __init__(self, parent):
		list.__init__(self)
		self.parent = parent
		
	def put(self, item):
		if item.n == 0:
			item.destroy()
			print("why did this happen?")
			return
			
		if item.stackable > 1:
			for existing in self:
				if existing.n < existing.stackable and isinstance(existing,item.__class__):
					space = existing.stackable - existing.n
					if space >= item.n:
						existing.stack(item)
						return
					else:
						existing.n = existing.stackable
						item.n -= space					
				
		if item not in self:
			item.parent = self.parent
			self.append(item)
			
	def take(self, item):
		if item in self:
			self.remove(item)
			return item
		else:
			return False
		
			
def default_cave_rule(tally):
	if tally>=5:
		return 1
	else:
		return 0
		
		
def hill_rule(tally):
	if tally>=5:
		return 1
	else:
		return 0
				
		
def less_empty_cave(n):
	def cave_rule(tally):
		if tally>=5 or tally<=n:
			return 1
		else:
			return 0
	return cave_rule
	
	
def cave(squares,p=0.45,passes=5,rule=default_cave_rule, passes2=0, rule2=default_cave_rule):
	#find bounding box
	x0,y0,x1,y1 = 0,0,0,0
	for square in squares:
		x0 = min(square.x,0)
		x1 = max(square.x,x1)
		y0 = min(square.y,0)
		y1 = max(square.y,y1)
	
	#set up solid grid
	grid = []
	for x in range(x1+3):
		grid.append([])
		for y in range(y1+3):
			grid[x].append(True)
			
	#carve out emptys in grid
	for square in squares:
		if random.random() < p:
			grid[square.x+1][square.y+1] = 1
		else:
			grid[square.x+1][square.y+1] = 0
				
				
	for i in range(passes):
		new = []
		for x in range(x1+1):
			new.append([])
			for y in range(y1+1):
				new[x].append(True)
				tally = 0
				for xi in (-1,0,1):
					for yi in (-1,0,1):
						if not (xi==0 and yi==0):
							tally+=grid[x+1+xi][y+1+yi]
							new[x][y] = rule(tally)
		
		for y in range(y1+1):
			for x in range(x1+1):
				grid[x+1][y+1] = new[x][y]
				
	for i in range(passes2):
		new = []
		for x in range(x1+1):
			new.append([])
			for y in range(y1+1):
				new[x].append(True)
				tally = 0
				for xi in (-1,0,1):
					for yi in (-1,0,1):
						if not (xi==0 and yi==0):
							tally+=grid[x+1+xi][y+1+yi]
							new[x][y] = rule2(tally)
		
		for y in range(y1+1):
			for x in range(x1+1):
				grid[x+1][y+1] = new[x][y]
				
		for x in range(len(new)):
			for y in range(len(new[0])):
				if new[x][y]==1:
					new[x][y] = True
				else:
					new[x][y] = False
				 
	return new
	
	
def a_star(start, goal):
	start_square = start.square
	goal_square = goal.square
	#already checked
	checked = set()
	#need to check
	check = []
	check.append(start_square)
	#exact distance from start
	g_scores = {}
	#estimated distance to goal
	f_scores = {}
	g_scores[start_square] = 0
	f_scores[start_square] = start.distance(goal)
	#best path
	came_from = {}
	while check:
		check = sorted(check, key=lambda square: -f_scores[square])
		current = check.pop()
		if current == goal_square:
			path = [goal_square]
			while current in came_from:
				current = came_from[current]
				path.insert(0,current)
			return path
		#if the goal square is blocked, accept an adjacent square
		elif not goal_square.passable and goal_square in current.edges():
			path = [current]
			while current in came_from:
				current = came_from[current]
				path.insert(0,current)
			return path
		
		checked.add(current)
		for neighbor in current.neighbors():
			if neighbor in checked:
				continue
				
			#I don't think this ever gets hit
			#this is totally wonky...you only want this added if the neighbor is literally impassable
			if not start.can_pass(current, neighbor) and neighbor != goal_square:
				checked.add(neighbor)
				continue
				
			try_g = g_scores[current] + 1
			if neighbor not in check or (g_scores[neighbor] and try_g < g_scores[neighbor]):
				came_from[neighbor] = current
				g_scores[neighbor] = try_g
				f_scores[neighbor] = g_scores[neighbor] + neighbor.distance(goal)
				if neighbor not in check:
					check.append(neighbor)
	
	print("path failed")				
	return False
	

def djikstra_find(start, thing, min=0, max=12):
	start_square = start.square
	from .items import Item
	from .creatures import Creature
	checked = set()
	#need to check
	check = []
	check.append(start_square)
	while check:
		current = check.pop(0)
		if current.distance(start_square) > max:
			return False
			
		if current in checked:
			continue
			
		if issubclass(thing,Item):
			for item in current.items:
				if isinstance(item,thing) and current.distance(start_square) >= min:
					return current
		elif issubclass(thing,Creature):
			if isinstance(current.creature,thing) and current.distance(start_square) >= min:
				return current

		checked.add(current)
		for neighbor in current.neighbors():
			if neighbor in checked:
				continue
			elif start.can_pass(current,neighbor):
				check.append(neighbor)
				
	return False
				
	
	
	
