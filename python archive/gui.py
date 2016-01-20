import pygame
from pygame.locals import *

from .tomb import Tomb

class TombGUI(object):
	def __init__(self):
		pygame.init()
		import os, inspect
		self.width = 720
		self.height = 480
		self.screen = pygame.display.set_mode((self.width,self.height))
		self.view_width = 480
		self.view_height = 320
		self.view_x = 30
		self.view_y = 20
		self.message_buffer = 6
		self.messages = ["Welcome to Hellatomb!"]
		self.cell_width = 16
		self.cell_height = 16
		self.pad_pixels = 4
		self.x = None
		self.y = None
		self.z = None
		self.img_path = os.path.dirname(inspect.getfile(Tomb)) + "/images/"
		self.alt_path = os.path.dirname(inspect.getfile(Tomb)).replace("library.zip\\htomb","images/")
		self.images = {}
		self.font = pygame.font.SysFont("arial",12)
		
	def go(self):
		import sys
		while True:
			for event in pygame.event.get():
				if event.type == QUIT:
					pygame.quit()
					sys.exit()
				elif event.type == KEYDOWN:
					Tomb.controls.key(event)
				elif event.type == MOUSEBUTTONDOWN:
					Tomb.controls.click(*pygame.mouse.get_pos())

	def image(self, s):
		if s not in self.images:
			try:
				img = pygame.image.load(self.img_path + s +".png")
			except:
				img = pygame.image.load(self.alt_path + s +".png")
			self.images[s] = img
		return self.images[s]
		
	def prepare_screen(self):
		self.screen.fill((225,225,225))
		
	def draw_at(self,img,x,y):
		self.screen.blit(self.image(img),(self.pad_pixels+x*self.cell_width, self.pad_pixels+y*self.cell_height))
		
		
	def draw_message(self,message,n):
		self.screen.blit(self.font.render(message,True,(0,0,0),(250,250,200)),(2*self.pad_pixels,self.pad_pixels+(self.view_y+2+n)*self.cell_height))
		
	def draw_command(self,command,y):
		self.screen.blit(self.font.render(command,True,(0,0,0),(225,225,225)),(self.view_x*self.cell_width+2*self.pad_pixels,y*self.cell_height))
		
	def draw_update(self):
		pygame.display.update()
		
	def draw_messageboard(self):
		pygame.draw.rect(self.screen,(250,250,200),(self.pad_pixels,self.pad_pixels+(self.view_y+2)*self.cell_height,self.view_width+self.pad_pixels,self.height-self.pad_pixels))
		
	
	def draw(self):
		self.prepare_screen()
		
		if self.x == None:
			self.x = Tomb.player.x
		if self.y == None:
			self.y = Tomb.player.y
		if self.z == None:
			self.z = Tomb.player.z
		
		if self.x <= self.view_x/2:
			from_x = 0
		elif self.x >= Tomb.zone.width - self.view_x/2:
			from_x = Tomb.zone.width - self.view_x
		else:
			from_x = self.x - int(self.view_x/2)
			
		if self.y <= self.view_y/2:
			from_y = 0
		elif self.y >= Tomb.zone.height - self.view_y/2:
			from_y = Tomb.zone.height - self.view_y
		else:
			from_y = self.y - int(self.view_y/2)
		
		for y in range(self.view_y):
			for x in range(self.view_x):
				square = Tomb.zone.grid(from_x+x,from_y+y,self.z)
				
				self.draw_at(square.image,x,y)
				if square.floor().designation:
					self.draw_at(square.floor().designation.image,x,y)
				if square.designation:
					self.draw_at(square.designation.image,x,y)
				if square.ceiling().designation:
					self.draw_at(square.ceiling().designation.image,x,y)
				if square.explored:
					if square.floor().items and not square.floor().solid():
						self.draw_at(square.floor().items[-1].image,x,y)
					if square.items:
						self.draw_at(square.items[-1].image,x,y)
					if square.ceiling().items and not square.ceiling().solid():
						self.draw_at(square.ceiling().items[-1].image,x,y)

					if square.floor().feature:
						self.draw_at(square.floor().feature.image,x,y)
					if square.feature:
						self.draw_at(square.feature.image,x,y)
					if square.ceiling().feature:
						self.draw_at(square.ceiling().feature.image,x,y)
							
					if square.visible:	
						if square.floor().creature:
							self.draw_at(square.floor().creature.image,x,y)
						if square.creature:
							self.draw_at(square.creature.image,x,y)
						if square.ceiling().creature:
							self.draw_at(square.ceiling().creature.image,x,y)
					else:
						self.draw_at("fog",x,y)
							
		for y,command in enumerate(self.commands):
			self.draw_command(command,y)
			
		self.screen.blit(self.font.render(self.print_position(),True,(0,0,0),(225,225,225)),(self.pad_pixels,self.pad_pixels+(self.view_y)*self.cell_height))
		self.screen.blit(self.font.render(self.print_status(),True,(0,0,0),(225,225,225)),(self.pad_pixels,self.pad_pixels+(self.view_y+1)*self.cell_height))
		
		self.draw_messageboard()
		i = 0
		for message in reversed(self.messages):
			self.draw_message(message,i)
			i+=1
	
		self.draw_update()

	def draw_square(self, square, img):
		if self.x == None:
			self.x = Tomb.player.x
		if self.y == None:
			self.y = Tomb.player.y
		if self.z == None:
			self.z = Tomb.player.z
		
		if self.x <= self.view_x/2:
			from_x = 0
		elif self.x >= Tomb.zone.width - self.view_x/2:
			from_x = Tomb.zone.width - self.view_x
		else:
			from_x = self.x - int(self.view_x/2)
			
		if self.y <= self.view_y/2:
			from_y = 0
		elif self.y >= Tomb.zone.height - self.view_y/2:
			from_y = Tomb.zone.height - self.view_y
		else:
			from_y = self.y - int(self.view_y/2)
			
		self.draw_at(img,square.x-from_x,square.y-from_y)
		self.draw_update()	
	
				
				
	def push_message(self, message):
		if len(self.messages)>=self.message_buffer:
			self.messages.pop()
			
		self.messages.insert(0,message)
		
	def print_menu(self, n):
		items = Tomb.player.items
		spells = Tomb.player.spells
		if n == 0:
			return "Inventory:"
		elif n > 0 and n <= len(items):
			return "- " + items[n-1].name
		elif n == len(items)+1:
			return " "
		elif n == len(items)+2:
			return "Spells:"
		elif n >= len(items)+3 and n < len(items)+3+len(spells):
			return "- " + spells[n-4-len(items)].name
		else:
			return " "
	
	def print_position(self):
		player = Tomb.player
		return player.name + " at " "X: "+str(player.x)+", Y: "+str(player.y)+", Z: "+str(player.z)
		
	def print_status(self):
		player = Tomb.player
		return	 "Wounds: " + str(player.wounds) + "/" + str(player.toughness) \
				+ "  Prowess:" + str(player.prowess) \
				+ "  Anxiety(Contempt): " + str(player.anxiety) + "(" + str(player.contempt) + ")" \
				+ "  Infamy: " + str(player.infamy)
				
	def print_inventory(self):
		pass
	
	def print_spells(self):
		pass
	
	def print_equipment(self):
		pass
		
	def click(self,event):
		pass
		
				
class ControlContext(object):
	def __init__(self):
		Tomb.gui.commands = [
			'Left Mouse: look',
			'Arrows/NumPad: move',
			'Space Bar: brood',
			'Shift: survey',
			'. : dig down',
			', : dig up / stack stones',
			'g : pick up an item',
			'd : drop an item',
			'z : raise a zombie',
			'o : give / cancel orders'
		]
				
	def key(self,event):
		if event.key in (K_UP,K_KP8):
			Tomb.player.try_move(0,-1,0)
		elif event.key in (K_LEFT,K_KP4):
			Tomb.player.try_move(-1,0,0)
		elif event.key in (K_RIGHT,K_KP6):
			Tomb.player.try_move(1,0,0)
		elif event.key in (K_DOWN,K_KP2):
			Tomb.player.try_move(0,1,0)
		elif event.key == (K_KP7):
			Tomb.player.try_move(-1,-1,0)
		elif event.key == (K_KP9):
			Tomb.player.try_move(1,-1,0)
		elif event.key == (K_KP1):
			Tomb.player.try_move(-1,1,0)
		elif event.key == (K_KP3):
			Tomb.player.try_move(1,1,0)
		elif event.key == (K_KP5):
			Tomb.player.wait()
		elif event.key == (K_PERIOD):
			Tomb.player.dig(Tomb.player.square.floor())
		elif event.key == (K_COMMA):
			if Tomb.player.square.ceiling().solid():
				Tomb.player.dig(Tomb.player.square.ceiling())
			else:
				Tomb.player.build_wall(Tomb.player.square)
		elif event.key == K_SPACE:
			#for now...
			Tomb.player.wait()
		elif event.key == K_g:
			Tomb.player.get()
		elif event.key == K_d:
			Tomb.player.drop()
		elif event.key == K_z:
			Tomb.player.spells[0].cast()
		elif event.key == K_o:
			Tomb.controls = ChooseOrdersContext()
			Tomb.gui.push_message("Choose orders.")
		elif event.key in (K_RSHIFT, K_LSHIFT):
			Tomb.controls = SurveyContext()
		else:
			print(event.key)
			
		Tomb.gui.x = Tomb.player.x
		Tomb.gui.y = Tomb.player.y
		Tomb.gui.z = Tomb.player.z
		
		Tomb.gui.draw()
		
		
		
	def clicked_square(self, x, y):
		x = int(x/Tomb.gui.cell_width)
		y = int(y/Tomb.gui.cell_height)
			
		if Tomb.gui.x <= Tomb.gui.view_x/2:
			from_x = 0
		elif Tomb.gui.x >= Tomb.zone.width - Tomb.gui.view_x/2:
			from_x = Tomb.zone.width - Tomb.gui.view_x
		else:
			from_x = Tomb.gui.x - int(Tomb.gui.view_x/2)
				
		if Tomb.gui.y <= Tomb.gui.view_y/2:
			from_y = 0
		elif Tomb.gui.y >= Tomb.zone.height - Tomb.gui.view_y/2:
			from_y = Tomb.zone.height - Tomb.gui.view_y
		else:
			from_y = Tomb.gui.y - int(Tomb.gui.view_y/2)
							
		square = Tomb.zone.grid(from_x+x,from_y+y,Tomb.gui.z)
		return square
		
		
	def click_look(self, square):
		if not square.level_ground():
			Tomb.player.look(square)
		else:
			Tomb.player.look(square.level_ground())
	
			
	def clicked_menu(self, x,y):
		pass
	

	def click(self,x,y):
		
		if x >= 0 and x < Tomb.gui.view_width and y >= 0 and y < Tomb.gui.view_height:
			square = self.clicked_square(x,y)
			if not square:
				print("freak out!")
			self.click_look(square)
		elif x >= Tomb.gui.view_width and y > Tomb.gui.cell_height:
			self.clicked_menu(x,y)
			#clicked in inventory or spells
			#y = int(y/16)
			#print(y)
			#if y < len(Tomb.player.items)+1:
			#	Tomb.gui.push_message(Tomb.player.items[y-1].name)
			#elif y > len(Tomb.player.items)+2 and y < len(Tomb.player.items)+3+len(Tomb.player.spells):
			#	Tomb.player.spells[y-len(Tomb.player.items)-4].cast()	
		Tomb.gui.draw()
	
		
class ChooseOrdersContext(ControlContext):
	def __init__(self):
		Tomb.gui.commands = [
			'Esc : go back',
			'd : dig',
			'w : build walls',
			'g : guard post',
			's : stockpile goods',
			'x : remove designation'
		]
	
	def key(self,event):
		if event.key == K_ESCAPE:
			Tomb.gui.push_message("Canceled.")
			Tomb.controls = ControlContext()
		elif event.key == K_d:
			DigOrders().give_orders()
		elif event.key == K_w:
			BuildWallsOrders().give_orders()
		elif event.key == K_s:
			StockpileGoodsOrders().give_orders()
		elif event.key == K_g:
			GuardPostOrders().give_orders()
		elif event.key == K_x:
			RemoveDesignationOrders().give_orders()
		else:
			print(event.key)
			
		Tomb.gui.draw()
		
	
class DeadContext(ControlContext):
	def key(self,event):
		import sys
		pygame.quit()
		sys.exit()
	
	
class SurveyContext(ControlContext):
	def __init__(self):
		Tomb.gui.commands = [
			'Left Mouse: look',
			'Arrows/NumPad: move view',
			'Shift/Esc: exit survey',
			'. : survey up',
			', : survey down',
			'o : give orders'
		]
		self.x = Tomb.player.x
		self.y = Tomb.player.y
		self.z = Tomb.player.z
		
	def try_shift(self,x,y,z):
		self.x+=x
		self.y+=y
		self.z+=z
		self.x = max(self.x,int(Tomb.gui.view_x/2))
		self.y = max(self.y,int(Tomb.gui.view_y/2))
		self.z = max(self.z,1)
		self.x = min(self.x,Tomb.zone.width-1-int(Tomb.gui.view_x/2))
		self.y = min(self.y,Tomb.zone.height-1-int(Tomb.gui.view_y/2))
		self.z = min(self.z,Tomb.zone.depth-2)

	def key(self,event):
		if event.key in (K_UP,K_KP8):
			self.try_shift(0,-1,0)
		elif event.key in (K_LEFT,K_KP4):
			self.try_shift(-1,0,0)
		elif event.key in (K_RIGHT,K_KP6):
			self.try_shift(1,0,0)
		elif event.key in (K_DOWN,K_KP2):
			self.try_shift(0,1,0)
		elif event.key == (K_KP7):
			self.try_shift(-1,-1,0)
		elif event.key == (K_KP9):
			self.try_shift(1,-1,0)
		elif event.key == (K_KP1):
			self.try_shift(-1,1,0)
		elif event.key == (K_KP3):
			self.try_shift(1,1,0)
		elif event.key == (K_PERIOD):
			self.try_shift(0,0,-1)
		elif event.key == (K_COMMA):
			self.try_shift(0,0,1)
		elif event.key == K_ESCAPE:
			Tomb.controls = ControlContext()
			Tomb.gui.x = Tomb.player.x
			Tomb.gui.y = Tomb.player.y
			Tomb.gui.z = Tomb.player.z
		elif event.key == K_o:
			Tomb.controls = ChooseOrdersContext()
			Tomb.gui.push_message("Choose orders.")
		else:
			print(event.key)

		if event.key != K_ESCAPE:	
			Tomb.gui.x = self.x
			Tomb.gui.y = self.y
			Tomb.gui.z = self.z
	
		Tomb.gui.draw()
		
	def click_look(self, square):
		Tomb.player.look(square)
		
		
class SelectAreaContext(ControlContext):
	def __init__(self, caller, outline):
		self.square1 = None
		self.square2 = None
		self.caller = caller
		self.outline = outline
		
	def key(self,event):
		from .tomb import Tomb
		if event.key == K_ESCAPE:
			Tomb.gui.push_message("Canceled.")
			Tomb.controls = ControlContext()
		
		Tomb.gui.draw()
		
	def click(self,eventx,eventy):
		if eventx >= 0 and eventx < Tomb.gui.view_width and eventy >= 0 and eventy < Tomb.gui.view_height:
			#let the order-specific methods determine what to do with the squares returned
			square = self.clicked_square(eventx,eventy)
			if not self.square1:
				self.square1 = square
			else:
				if square.z != self.square1.z:
					#except now this is true by definition...
					Tomb.gui.push_message("Both corners must be at same altitude.")
				else:
					self.square2 = square
					x1 = min(self.square1.x,self.square2.x)
					x2 = max(self.square1.x,self.square2.x)
					y1 = min(self.square1.y,self.square2.y)
					y2 = max(self.square1.y,self.square2.y)
					area = set()
					if self.outline:
						for x in x1,x2:
							for y in range(y1,y2+1):
								area.add(Tomb.zone.grid(x,y,self.square1.z))		
						for x in range(x1,x2+1):
							for y in y1,y2:
								area.add(Tomb.zone.grid(x,y,self.square1.z))				
					else:
						for x in range(x1,x2+1):
							for y in range(y1,y2+1):
								area.add(Tomb.zone.grid(x,y,self.square1.z))		

					Tomb.controls = ControlContext()
					self.caller.receive_area(self.square1, self.square2, area)
			
		elif eventx >= Tomb.gui.view_width and eventy > Tomb.gui.cell_height:
			clicked_menu(eventx,eventy)
			
		Tomb.gui.draw()
		if self.square1:
			Tomb.gui.draw_square(self.square1,"designate")
		if self.square2:
			Tomb.gui.draw_square(self.square2,"designate")
			

class SelectSquareContext(ControlContext):
	def __init__(self, caller):
		self.square1 = None
		self.square2 = None
		self.caller = caller
		
	def key(self,event):
		from .tomb import Tomb
		if event.key == K_ESCAPE:
			Tomb.gui.push_message("Canceled.")
			Tomb.controls = ControlContext()
		
		Tomb.gui.draw()
		
	def click(self,eventx,eventy):
		if eventx >= 0 and eventx < Tomb.gui.view_width and eventy >= 0 and eventy < Tomb.gui.view_height:
			#let the order-specific methods determine what to do with the squares returned
			square = self.clicked_square(eventx,eventy)
			self.caller.receive_square(square)
			Tomb.controls = ControlContext()
		
		Tomb.gui.draw()
			
		
class DigOrders(object):
	def give_orders(self):
		Tomb.controls = SelectAreaContext(self,False)
		Tomb.gui.push_message("Select area to dig.")
		
	def receive_area(self, square1, square2, area):
		from .creatures import DigTask
		#if there is at least one square filled in, dig out the selected level
		at_level = False
		for square in area:
			if square.solid():
				at_level = True
		#otherwise, drop down and dig out the floor
		for square in area:
			if at_level and square.solid():
				task = DigTask(square)
			elif not at_level and square.floor().solid():
				task = DigTask(square.floor())
				
			
class BuildWallsOrders(object):
	def give_orders(self):
		Tomb.controls = SelectAreaContext(self,"outline")
		Tomb.gui.push_message("Select area to build walls.")
		
	def receive_area(self, square1, square2, area):
		from .creatures import BuildTask
		#okay, I think what should happen is...determine what level the corners are at...no...they're all at the same level...okay...
		level_ground = square1.level_ground()
		if level_ground == square1:
			for square in area:
				if not square.solid() and square.floor().solid():
					task = BuildTask(square)
		elif level_ground == square1.ceiling():
			for square in area:
				if not square.ceiling().solid() and square.solid():
					task = BuildTask(square.ceiling())
		elif level_ground == square1.floor():
			for square in area:
				if not square.floor().solid() and square.floor().floor().solid():
					task = BuildTask(square.floor())	
		
		#only build on squares that are empty and have solid floors
		#for square in area:
			#if not square.solid() and square.floor().solid():
				#task = Task(square)
				
			
class RemoveDesignationOrders(object):
	def give_orders(self):
		Tomb.controls = SelectAreaContext(self, False)
		Tomb.gui.push_message("Select area to remove designations.")
		
	def receive_area(self, square1, square2, area):
		at_level = False
		above_level = False
		#if at least one square on the same level has a task, delete from this level
		for square in area:
			if square.designation:
				at_level = True
		#then try the ceiling
		if not at_level:
			for square in area:
				if square.ceiling().designation:
					above_level = True
		#...and default to the floor
		for square in area:
			if at_level and square.designation:
				Tomb.gui.push_message("Removed designation for " + square.name + ".")
				square.designation.delete()
			elif above_level and square.ceiling().designation:
				Tomb.gui.push_message("Removed designation for " + square.ceiling().name + ".")
				square.ceiling().designation.delete()
			elif not at_level and not above_level and square.floor().designation:
				Tomb.gui.push_message("Removed designation for " + square.floor().name + ".")
				square.floor().designation.delete()
				
				
class GuardPostOrders(object):
	def give_orders(self):
		Tomb.controls = SelectSquareContext(self)
		Tomb.gui.push_message("Select square to guard around.")
		
	def receive_square(self, square):
		from .creatures import GuardTask
		if square.level_ground():
			GuardTask(square.level_ground())
		else:
			GuardTask(square)
		
	
class StockpileGoodsOrders(object):
	def give_orders(self):
		Tomb.controls = SelectSquareContext(self)
		Tomb.gui.push_message("Select square to stockpile around.")
		
	def receive_square(self, square):
		from .creatures import GatherTask
		square = square.level_ground()
		if square:
			GatherTask(square)