import { truncate } from 'node:fs';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
    stymphaliansong: {
		num: 2000,
		accuracy: 100,
		basePower: 90,
		category: "Special",
		name: "Stymphalian Song",
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		secondary: {
			chance: 100,
			self: {
				boosts: {
					def: 1,
				},
			},
        },
        target: "normal",
		type: "Fairy",

        onHit(target, source) {
            if (this.field.isTerrain('mistyterrain')) {
                this.boost({spd: 1}, source);

                const ally = source.side.active.find(pokemon => pokemon && !pokemon.fainted && pokemon !== source);
			if (ally) {
				this.boost({def: 1}, ally);
            }
        }
    }
	},
    fulgurcleave: {
		num: 2001,
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		name: "Fulgur Cleave",
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		onModifyPriority(priority, source, target, move) {
		 if (!target || target.fainted) return priority;

        const action = this.queue?.willMove?.(target);
        if (!action || action.choice !== 'move' || !action.move) return priority;

        const targetMove = this.dex.moves.get(action.move.id);

        if (targetMove && targetMove.priority > 0 && targetMove.category !== 'Status') {
            return 4; 
        }
        return priority;
	},

	onModifyMove(move, source, target) {
	if (this.field.isTerrain('electricterrain')) {
		move.willCrit = true;
	}
},
	target: "normal",
	type: "Ground",
},
shanghaidoll: {
    accuracy: true,
    basePower: 20,
    category: "Special",
    name: "Shanghai Doll",
    pp: 1,
    priority: 0,
    flags: {protect: 1, mirror: 1},
    secondary: null,
    target: "normal",
    type: "Water", 
},
fantasyseal: {
	num: 2002,
	accuracy: true,
	basePower: 175,
	category: "Physical",
	isNonstandard: "Past",
	name: "Fantasy Seal",
	pp: 1,
	priority: 0,
	flags: {},
	isZ: "yinyangorbs",
	target: "adjacentFoe",
	type: "Fairy",
	contestType: "Cool",

	self: {
		onHit(source) {
			for (const side of source.side.foeSidesWithConditions()) {
				if (!side.getSideCondition('fantasyseal')) {
					side.addSideCondition('fantasyseal', source);
				}
			}
		},
	},

	condition: {
		duration: 5,
		onSideStart(targetSide) {
			this.add('-sidestart', targetSide, 'move: Fantasy Seal');
		},
		onSideResidualOrder: 26,
		onSideResidualSubOrder: 11,
		onSideResidual(targetSide) {
			for (const pokemon of targetSide.active) {
				if (!pokemon || pokemon.fainted) continue;
				this.damage(Math.floor(pokemon.baseMaxhp / 6), pokemon);
			}
		},
		onSideEnd(targetSide) {
			this.add('-sideend', targetSide, 'move: Fantasy Seal');
		},
	},

	secondary: null,
},
masterspark: {
	num: 2003,
	accuracy: true,
	basePower: 220,
	category: "Special",
	isNonstandard: "Past",
	name: "Master Spark",
	pp: 1,
	priority: 0,
	flags: {},
	isZ: "minihakkero",
	target: "adjacentFoe",
	type: "Psychic",
	contestType: "Cool",

    ignoreImmunity: {
        Psychic: true,
    }
},
lunardial: {
	num: 2004,
	accuracy: true,
	basePower: 150,
	category: "Physical",
	isNonstandard: "Past",
	name: "Lunar Dial",
	pp: 1,
	priority: 0,
	flags: {},
	isZ: "pocketwatch", 
	target: "adjacentFoe",
	type: "Steel",
	contestType: "Cool",

	self: {
		onHit(source) {
			for (const side of source.side.foeSidesWithConditions()) {
				if (!side.getSideCondition('lunardial')) {
					side.addSideCondition('lunardial', source);
				}
			}
		},
	},

	condition: {
		duration: 5,
		onSideStart(side) {
			this.add('-sidestart', side, 'move: Lunar Dial');
		},

		onModifySpe(spe, pokemon) {
			if (!pokemon.side.getSideCondition('lunardial')) return spe;
			return Math.floor(spe / 4);
		},

		onSideEnd(side) {
			this.add('-sideend', side, 'move: Lunar Dial');
		},
	},

	secondary: null,
},
cherryblossomflashing: {
	num: 2005,
	accuracy: true,
	basePower: 180,
	category: "Physical",
	isNonstandard: "Past",
	name: "Cherry Blossom Flashing",
	pp: 1,
	priority: 0,
	flags: { slicing: 1 },
	isZ: "dualtowerswords", 
	target: "adjacentFoe",
	type: "Ghost",
	contestType: "Cool",
},
greatsnakeswimmingintheclouds: {
    num: 2006,
    accuracy: true,
    basePower: 185,
    category: "Special",
    isNonstandard: "Past",
    name: "Great Snake Swimming in the Clouds",
    pp: 1,
    priority: 0,
    flags: {},
    isZ: "cobaltgohei", 
    target: "adjacentFoe",
    type: "Flying",
    contestType: "Cool",

    self: {
        onHit(source) {
            this.field.setWeather('deltastream', source, source.getAbility());
            if (this.field.weather === 'deltastream') {
                this.field.weatherState.duration = 8;
            }
        },
    },
    secondary: null,
},
hellsartificalsun: {
	num: 2007,
	accuracy: true,
	basePower: 250,
	category: "Special",
	isNonstandard: "Past",
	name: "Hell's Artifical Sun",
	pp: 1,
	priority: 0,
	flags: {},
    ignoreAbility: true,
	isZ: "nuclearcontrolrod", 
	target: "adjacentFoe",
	type: "Fire",
	contestType: "Cool",
},
firstandlastnamelessdanmaku: {
	num: 2008,
	accuracy: true,
	basePower: 190, 
	category: "Special",
	isNonstandard: "Past",
	name: "First and Last Nameless Danmaku",
	pp: 1,
	priority: 0,
	flags: {},
	isZ: "purifiedtails",
	target: "adjacentFoe", 
	type: "Dark",
	contestType: "Cool",

	onHit(target, source) {

		for (const pokemon of this.getAllActive()) {
			pokemon.clearBoosts();
		}

		for (const pokemon of this.getAllActive()) {
			if (pokemon.status) pokemon.cureStatus();
			pokemon.clearVolatile(); 
		}

		for (const side of this.sides) {
			side.removeSideCondition('tailwind');
			side.removeSideCondition('reflect');
			side.removeSideCondition('lightscreen');
			side.removeSideCondition('auroraveil');
			side.removeSideCondition('safeguard');
		}

		const fieldPseudo = ['trickroom','magicroom','wonderroom','gravity'];
		for (const effect of fieldPseudo) {
			if (this.field.getPseudoWeather(effect)) {
				this.field.removePseudoWeather(effect);
			}
		}

		if (this.field.weather) this.field.clearWeather();
		if (this.field.terrain) this.field.clearTerrain();
	},

	secondary: null,
},
trinitarianrhapsody: {
	num: 2009,
	accuracy: true,
	basePower: 0,
	category: "Status",
	isNonstandard: "Past",
	name: "Trinitarian Rhapsody",
	pp: 1,
	priority: 0,
	flags: {},
	ignoreAbility: true,
	isZ: true,
	target: "foeSide",
	type: "Dark",
	contestType: "Cool",

	sideCondition: "trinitarianrhapsody",

	condition: {
	duration: 4,

	onStart(side) {
		this.add('-sidestart', side, 'move: Trinitarian Rhapsody');
		this.effectState.counter = 4; 
	},

	onResidual() {
		const side = this.effectState.target;

		if (typeof this.effectState.counter !== 'number') {
			this.effectState.counter = 4;
		}

		this.effectState.counter--;

		this.add('-message',
			`Trinitarian Rhapsody count for ${side.name}: ${this.effectState.counter}`
		);

		if (this.effectState.counter === 0) {
			for (const pokemon of side.active) {
				if (pokemon && !pokemon.fainted) {
					this.damage(pokemon.maxhp, pokemon);
				}
			}
			side.removeSideCondition('trinitarianrhapsody');
		}
	},
},
},
lick: {
inherit: true,
secondary: {
	chance: 100,
	status: 'par',
},
},
dragonrush: {
	inherit: true,
	accuracy: 85,
	basePower: 110,
},
astonish: {
	inherit: true,
	basePower: 40,
	onTry(source) {
			if (source.activeMoveActions > 1) {
				this.hint("Astonish only works on your first turn out.");
				return false;
			}
		},
		secondary: {
			chance: 100,
			volatileStatus: 'flinch',
		},
},
tropkick: {
	inherit: true,
	basePower: 85,
},
strength: {
	inherit: true,
	type: "Fighting",
},
rockclimb: {
	inherit: true,
	accuracy: 95,
	basePower: 95,
	type: "Rock",
},
cut: {
	inherit: true,
	type: "Steel",
	critRatio: 2,
},
dragonclaw: {
	inherit: true,
	secondary: {
		chance: 20,
		boosts: {
			def: -1,
		},
	},
},
twineedle: {
	inherit: true,
	basePower: 50,
},
poisontail: {
	inherit: true,
	basePower: 75,
},
irontail: {
	inherit: true,
	accuracy: 85,
	basePower: 110,
},
drillpeck: {
	inherit: true,
	critRatio: 2,
},
xscissor: {
	inherit: true,
	critRatio: 2,
},
skydrop: {
	inherit: true,
	basePower: 110
},
dualwingbeat: {
	inherit: true,
	basePower: 45,
},
dualchop: {
	inherit: true,
	basePower: 45,
},
covet: {
	inherit: true,
	type: "Fairy",
},
hardpress: {
	inherit: true,
	basePower: 80,
	basePowerCallback: undefined,
	overrideOffensiveStat: 'def',
},
powergem: {
	inherit: true,
	secondary: {
		chance: 20,
		boosts: {
			spd: -1,
		},
	},
},
signalbeam: {
	inherit: true,
	secondary: {
		chance: 100,
		volatileStatus: 'healblock',
	},
},
needlearm: {
	inherit: true,
	basePower: 95,
},
aurorabeam: {
	inherit: true,
	basePower: 75,
	secondary: {
		chance: 100,
		boosts: {
			atk: -1,
		},
	},
},
bounce: {
	inherit: true,
	accuracy: 100,
	basePower: 70,
	onTryMove: undefined,
	condition: undefined,
	flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
	selfSwitch: true,
	secondary: undefined,
},
cometpunch: {
	inherit: true,
	accuracy: 100,
	basePower: 25,
	multihit: [2, 5],
	type: "Steel",
},
armthrust: {
	inherit: true,
	basePower: 25,
},
dragonrage: {
	inherit: true,
	damage: 'level',
},
sonicboom: {
	inherit: true,
	damage: 'level',
},
razorwind: {
	inherit: true,
	basePower: 90,
	onTryMove: undefined,
	secondary: {
		chance: 20,
		boosts: {
			atk: -1,
		},
	},
	type: "Flying",
},
triplekick: {
	inherit: true,
	basePower: 20,
		basePowerCallback(pokemon, target, move) {
			return 20 * move.hit;
		},
},
drumbeating: {
	inherit: true,
	category: "Special",
	flags: { protect: 1, mirror: 1, sound: 1, bypasssub: 1, }
},
secretpower: {
	inherit: true,
	basePower: 90,
	onModifyType(move, pokemon) {
			const types = pokemon.getTypes();
			let type = types[0];
			if (type === 'Bird') type = '???';
			if (type === '???' && types[1]) type = types[1];
			move.type = type;
		},
	secondary: undefined,
},
terastarstorm: {
	inherit: true,
	onModifyMove(move, pokemon) {
			if (pokemon.getStat('atk', false, true) > pokemon.getStat('spa', false, true)) move.category = 'Physical';
			if (pokemon.hasType('Stellar')) {
				move.type = 'Stellar';
				return;
			}
		},
},
pursuit: {
	inherit: true,
	basePowerCallback(pokemon, target, move) {
			// You can't get here unless the pursuit succeeds
			if (target.beingCalledBack || target.switchFlag) {
				!target.hasAbility('runaway') 
				this.debug('Pursuit damage boost');
				return move.basePower * 2;
			}
			return move.basePower;
		},
},
}
