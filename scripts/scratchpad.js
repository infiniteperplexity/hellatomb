// It's clear we no longer consider using generic define

HTomb.Types = {};

var type = {
	template: "Type",
	name: "type",
	stringify: function() {},
	parse: function(value) {},
	types: null,
	onDefine: function() {
		this.types = [];
	},
	describe: function() {
		return this.name;
	}
};
// The global list of known templates
HTomb.Types.templates = {Types: type};

// define a template for creating things
HTomb.Types.define = function(args) {
	if (args===undefined || args.template===undefined) {
		//HTomb.Debug.pushMessage("invalid template definition");
		return;
	}
	// Create based on generic type
	var t;
	if (args.parent===undefined || (args.parent!=="Type" && HTomb.Types.templates[args.parent]===undefined)) {
		args.parent = "Type";
		//HTomb.Debug.pushMessage("Warning: No or invalid parent type given.");
	}
	if (args.parent==="Type") {
		t = Object.create(type);
		// Create a new function...maybe not the best way to do this
		HTomb.Types["define" + args.template] = function(opts) {
			opts.parent = args.template;
			return HTomb.Types.define(opts);
		};
		HTomb[args.template] = {types = []};
	} else {
		t = Object.create(HTomb.Types.templates[args.parent]);
		HTomb[opts.parent].types.push(t);
		HTomb.Types.templates[opts.parent].types.push(t);
	}
	// Add the arguments to the template
	for (var arg in args) {
		t[arg] = args[arg];
	}
	// Add to the list of templates
	HTomb.Types.templates[args.template] = t;

	// Don't fire onDefine for the top-level thing
	if (t.onDefine && args.parent!=="Type") {
		t.onDefine();
	}
};

HTomb.Types.define({
	template: "Material",
	name: "material",
});

//should dead flesh and live flesh be the same?
HTomb.Things.defineMaterial({
	template: "FleshMaterial",
	name: "flesh"
});

HTomb.Things.defineMaterial({
	template: "DeadFleshMaterial",
	name: "dead flesh"
});

HTomb.Things.defineMaterial({
	template: "BoneMaterial",
	name: "bone"
});

HTomb.Types.define({
	template: "Damage",
	name: "damage",
});

HTomb.Types.defineDamage({
	template: "SlashingDamage",
	name: "slashing"
});

HTomb.Things.defineBehavior({
	template: "CombatBehavior",
	name: "combat",
	// worry about multiple attacks later
	attack: function() {
		//create a damage packet, with an amount and type
	},
	//should be on the damage packet..//hit: function() {},
	defend: function() {

	}
	// the takeDamage functionm should be elsewhere...on entity?
});

HTomb.Things.defineBehavior({
	template: "BodyBehavior",
	name: "body",
	materals: {},
	takeDamage: function() {}
});
