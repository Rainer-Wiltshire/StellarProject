export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
    malevolentarm: {
        name: "Malevolent Arm",
        spritenum: 743,
        onBasePowerPriority: 15,
        onBasePower(basepower, user, target, move) {
            if (user.baseSpecies.num === -5377 && (move.type === 'Dark' || move.type === 'Dragon')) {
                return this.chainModify([4915, 4096]);
            }
        },
        onTakeItem(item, pokemon, source) {
            if (source?.baseSpecies.num === -5377 || pokemon.baseSpecies.num === -5377) {
                return false;
            }
            return true;
        },
    onModifyMovePriority: -1,
    onModifyMove(move, user) {
        if (move.type === 'Normal') {
            move.type = 'Dragon';
        }
    },
    onSwitchOut(pokemon) {
        if (pokemon.baseSpecies.num === -5377) {
            if (pokemon.status) {
                this.add('-activate', pokemon, 'item: Malevolent Arm');
                pokemon.cureStatus();
            }
        }
        },
        forcedForme: "Ibaraki Douji",
        itemUser: ["Ibaraki Douji"],
        num: 4000,
        gen: 9
    },
   fansofresurrection: {
    name: "Fans of Resurrection",
    spritenum: 743,
    gen: 9,
    num: 4001,

    itemUser: ["Yuyuko Saigyouji"],

    onDamage(damage, target, source, effect) {
        if (target.baseSpecies.id !== 'yuyukosaigyouji') return;
        if (target.volatiles['fansofresurrectionused']) return;
        if (!damage || damage < target.hp) return;

        const moveSlot = target.moveSlots?.[0];
        if (!moveSlot || moveSlot.pp <= 0) return;

        const move = this.dex.moves.get(moveSlot.id);
        if (!move || move.id === 'revivalblessing') return;

        this.add('-activate', target, 'item: Fans of Resurrection');

        target.addVolatile('fansofresurrectionused');

        const storedDamage = damage;

        this.actions.useMove(move, target);

        this.damage(storedDamage, target, source, effect);

        return 0;
    },
},
motorcyclekeys: {
    name: "Motorcycle Keys",
    shortDesc: "Priority moves 1.5x power. Metronome effect. Byakuren only.",
    onStart(pokemon) {
        if (pokemon.baseSpecies.name !== 'Hijiri Byakuren') {
            this.add('-message', `${pokemon.name} doesn't know how to drive!`);
            pokemon.setItem('');
        }
    },
    onBasePower(basePower, pokemon, target, move) {
        let multiplier = 1;

        if (move.priority > 0) {
            multiplier *= 1.5;
        }

        if (!pokemon.volatiles['byakurenmetronome']) {
            pokemon.addVolatile('byakurenmetronome');
        }

        const volatile = pokemon.volatiles['byakurenmetronome'];

        if (volatile.lastMove === move.id) {
            volatile.numConsecutive++;
        } else {
            volatile.numConsecutive = 1;
            volatile.lastMove = move.id;
        }

        const boostTable = [1, 1.2, 1.4, 1.6, 1.8, 2];
        const stage = Math.min(volatile.numConsecutive - 1, 5);
        multiplier *= boostTable[stage];

        return this.chainModify(multiplier);
    },
    condition: {
        duration: 2,
        onStart(pokemon) {
            this.effectState.numConsecutive = 1;
            this.effectState.lastMove = '';
        },
    },
    onTakeItem(item, pokemon, source) {
    if (pokemon.baseSpecies.name === 'Hijiri Byakuren') return false;
},
    gen: 9,
},
miraclemallet: {
    name: "Miracle Mallet",
    shortDesc: "Sukuna only. Damaging moves inflict Torment and Knock Off target's item.",
    gen: 9,

    onStart(pokemon) {
        if (pokemon.baseSpecies.name !== 'Shinmyoumaru Sukuna') {
            this.add('-message', `${pokemon.name} cannot wield the Miracle Mallet!`);
            pokemon.setItem('');
        }
    },

    onAfterMoveSecondarySelf(pokemon, target, move) {
        if (!target || target.fainted) return;
        if (move.category === 'Status') return;

        if (!target.volatiles['torment']) {
            target.addVolatile('torment', pokemon);
            this.add('-message', `${target.name} was afflicted with Torment by the Miracle Mallet!`);
        }

        if (target.item && target.takeItem(pokemon)) {
            this.add('-enditem', target, target.item, '[from] item: Miracle Mallet');
        }
    },

    onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Shinmyoumaru Sukuna') return false;
    },
},
stonebaby: {
    name: "Stone Baby",
    shortDesc: "Urumi: +1 Spe each turn. Others: trapped & -1 Spe each turn.",
    gen: 9,

    onStart(pokemon) {
        pokemon.addVolatile('stonebaby');
    },

    condition: {
        onStart(pokemon) {
            this.add('-message', `${pokemon.name} acquired a baby`);
        },

        onResidual(pokemon) {
            if (pokemon.baseSpecies.name === 'Ushizaki Urumi') {
                if (pokemon.boosts.spe < 6) {
                    this.boost({spe: 1}, pokemon);
                }
            } else {
                pokemon.tryTrap(true);

                if (pokemon.boosts.spe > -6) {
                    this.boost({spe: -1}, pokemon);
                }
            }
        },
    },
},
shanghaidoll: {
    name: "Shanghai Doll",
    shortDesc: "Alice only. After a damaging move, fires 3 extra 20 BP Water/Fire/Electric hits. Unremovable.",
    gen: 9,

    onAfterMoveSecondarySelf(pokemon, target, move) {
        if (!target || target.fainted) return;
        if (move.category === 'Status') return;
        if (move.id === 'shanghaidoll') return; 

        const types = ['Water', 'Fire', 'Electric'];

        for (const type of types) {
            const puppetMove = this.dex.getActiveMove('shanghaidoll');

            const moveCopy = this.dex.deepClone(puppetMove);
            moveCopy.type = type;
            moveCopy.basePower = 20;

            this.actions.tryMoveHit(target, pokemon, moveCopy);
        }
    },

    onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Alice Margatroid') return false;
    },
},
keystone: {
    name: "Keystone",
    shortDesc: "Hinanawi Tenshi only. Boosts Rock moves ×1.5. Blocks indirect damage. Unremovable.",
    gen: 9,

    onDamage(damage, target, source, effect) {
        if (!target || target.baseSpecies.name !== 'Hinanawi Tenshi') return damage;
        if (!effect) return damage; 
        if (effect.effectType !== 'Move') return 0;
        return damage;
    },

    onModifyAtkPriority: 5,
    onModifyAtk(atk, attacker, defender, move) {
        if (!move || attacker.baseSpecies.name !== 'Hinanawi Tenshi') return;
        if (move.type === 'Rock' && move.category === 'Physical') {
            return this.chainModify(1.5);
        }
    },

    onModifySpAPriority: 5,
    onModifySpA(spa, attacker, defender, move) {
        if (!move || attacker.baseSpecies.name !== 'Hinanawi Tenshi') return;
        if (move.type === 'Rock' && move.category === 'Special') {
            return this.chainModify(1.5);
        }
    },

    onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Hinanawi Tenshi') return false;
    },
},
   seedsofunknown: {
    name: "Seeds of Unknown",
    spritenum: 743, 
    onTakeItem(item, source) {
        if (source.baseSpecies.name === 'Houjuu Nue') return false;
        return true;
    },
    onTryHit(pokemon, target, move) {
        if (move.id === 'trick' && target === pokemon) {
            this.add('-fail', target);
            return null;
        }
    },
    onStart(pokemon) {
        if (pokemon.baseSpecies.name !== 'Houjuu Nue') return;

        const party = pokemon.side.pokemon;
        const lastMember = party[party.length - 1];
        if (!lastMember || lastMember === pokemon) return;

        pokemon.addVolatile('illusionitemhidden');
        (pokemon.volatiles['illusionitemhidden'] as any).target = lastMember;

        pokemon.illusion = lastMember;
    },
    onDamage(damage, target, source, effect) {
        if (
            target.volatiles['illusionitemhidden'] &&
            target.getItem()?.id === 'seedsofunknown' &&
            damage !== 0 &&
            effect && effect.id !== 'recoil' 
        ) {
            return damage / 2;
        }
    },
    onModifyDamage(damage, source, target, move) {
        if (target.types[0] === '???') {
            this.chainModify(1.3);
        }
    },
    onBasePower(basePower, attacker, defender, move) {
        return basePower;
    },
    onDamagingHit(damage, target, source, move) {
        if (!target.volatiles['illusionitemhidden'] || !source || source.fainted) return;

        source.types = ['???'];
        this.add('-start', source, 'typechange', '???');

        target.removeVolatile('illusionitemhidden');
        target.illusion = null;
        this.add('-end', target, 'illusion');
    },
},
     ribbonlacedparasol: {
    name: "Ribbon Laced Parasol",
    spritenum: 743,
    fling: { basePower: 10 },

    onStart(pokemon) {
      this.add('-message', `${pokemon.name} distorted the boundary of the battlefield!`);

      if (this.field.weather) this.field.clearWeather();
      if (this.field.terrain) this.field.clearTerrain();

      for (const id in this.field.pseudoWeather) {
        this.field.removePseudoWeather(id);
      }

      for (const side of this.sides) {
        for (const id in side.sideConditions) {
          side.removeSideCondition(id);
        }
      }
    },

    onUpdate(pokemon) {
      if (!pokemon.isActive) return;

      if (this.field.weather) this.field.clearWeather();
      if (this.field.terrain) this.field.clearTerrain();

      for (const id in this.field.pseudoWeather) {
        this.field.removePseudoWeather(id);
      }

      for (const side of this.sides) {
        for (const id in side.sideConditions) {
          side.removeSideCondition(id);
        }
      }
    },

    onResidual(pokemon) {
      if (!pokemon.isActive) return;

      if (this.field.weather) this.field.clearWeather();
      if (this.field.terrain) this.field.clearTerrain();

      for (const id in this.field.pseudoWeather) {
        this.field.removePseudoWeather(id);
      }

      for (const side of this.sides) {
        for (const id in side.sideConditions) {
          side.removeSideCondition(id);
        }
      }
    },

    onAnyDamage(damage, target, source, effect) {
      const holder = this.effectState.target;
      if (!holder?.isActive) return;
      if (!effect) return;

      if (effect.id === 'recoil' || effect.id === 'strugglerecoil') {
        return false;
      }

      if (effect.effectType !== 'Move') {
        return false;
      }
    },

    itemUser: ["Yukari Yakumo"],

    onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Yukari Yakumo') return false;
    },
  },
    doorofseasons: {
    name: "Door of Seasons",
    spritenum: 743,

    onStart(pokemon) {
        if (pokemon.species.id !== 'mataraokina') return;

        const firstMoveId = pokemon.moveSlots[0]?.id;
        const secondMoveId = pokemon.moveSlots[1]?.id;

        if (!firstMoveId && !secondMoveId) return;

        const firstMove = firstMoveId ? this.dex.moves.get(firstMoveId) : null;
        const secondMove = secondMoveId ? this.dex.moves.get(secondMoveId) : null;

        let selectedWeather = '';
        let selectedTerrain = '';

        const typeToField: {[k: string]: {weather?: string; terrain?: string}} = {
            Flying: {weather: 'deltastream'},
            Fire: {weather: 'sunnyday'},
            Water: {weather: 'raindance'},
            Ice: {weather: 'snowscape'},
            Rock: {weather: 'sandstorm'},
            Psychic: {terrain: 'psychicterrain'},
            Fairy: {terrain: 'mistyterrain'},
            Grass: {terrain: 'grassyterrain'},
            Electric: {terrain: 'electricterrain'},
        };

        if (firstMove) {
            const mapping = typeToField[firstMove.type];
            if (mapping) {
                if (mapping.weather) selectedWeather = mapping.weather;
                if (mapping.terrain) selectedTerrain = mapping.terrain;
            }
        }

        if (secondMove) {
            const mapping = typeToField[secondMove.type];
            if (mapping) {
                if (mapping.weather) selectedWeather = mapping.weather;
                if (mapping.terrain) selectedTerrain = mapping.terrain;
            }
        }

        if (selectedWeather) {
            if (selectedWeather === 'deltastream') {
                if (this.field.setWeather('deltastream', pokemon, this.effect)) {
                    this.field.weatherState.duration = 5;
                }
            } else {
                if (!this.field.weather ||
                    !['desolateland','primordialsea','deltastream'].includes(this.field.weather)) {
                    this.field.setWeather(selectedWeather);
                }
            }
        }

        if (selectedTerrain) {
            this.field.setTerrain(selectedTerrain);
        }
    },

    onAnySetWeather(target, source, effect) {
        if (
            this.field.weather === 'deltastream' &&
            effect.id !== 'deltastream'
        ) {
            return false;
        }
    },

    onWeather(target, source, effect) {
        if (effect.id === 'sandstorm') {
            this.add('-activate', target, 'item: ' + this.effect.name);
            return null;
        }
    },

    onModifyDef(pokemon) {
        if (this.field.isWeather('snowscape')) {
            return this.chainModify(1.5);
        }
    },

    onModifySpD(pokemon) {
        if (this.field.isWeather('sandstorm')) {
            return this.chainModify(1.5);
        }
    },

    itemUser: ["Matara Okina"],

    onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Matara Okina') return false;
    },
},
yinyangorbs: {
		name: "Yin-Yang Orbs",
		spritenum: 648,
		onTakeItem: false,
		zMove: "Fantasy Seal",
		zMoveFrom: "Spirit Break",
		itemUser: ["Hakurei Reimu"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
minihakkero: {
		name: "Mini Hakkero",
		spritenum: 641,
		onTakeItem: false,
		zMove: "Master Spark",
		zMoveFrom: "Photon Geyser",
		itemUser: ["Kirisame Marisa"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
pocketwatch: {
		name: "Pocket Watch",
		spritenum: 647,
		onTakeItem: false,
		zMove: "Lunar Dial",
		zMoveFrom: "Smart Strike",
		itemUser: ["Sakuya Izayoi"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
dualtowerswords: {
		name: "Dual Tower Swords",
		spritenum: 644,
		onTakeItem: false,
		zMove: "Cherry Blossom Flashing",
		zMoveFrom: "Poltergeist",
		itemUser: ["Youmu Konpaku"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
cobaltgohei: {
		name: "Cobalt Gohei",
		spritenum: 640,
		onTakeItem: false,
		zMove: "Great Snake Swimming in the Clouds",
		zMoveFrom: "Bleakwind Storm",
		itemUser: ["Kochiya Sanae"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",

        onAnySetWeather(target, source, effect) {
		if (this.field.weather === 'deltastream' && effect.id !== 'deltastream') {
			return false;
		}
	},
},
nuclearcontrolrod: {
		name: "Nuclear Control Rod",
		spritenum: 632,
		onTakeItem: false,
		zMove: "Hell's Artificial Sun",
		zMoveFrom: "Fusion Flare",
		itemUser: ["Reiuji Utsuho"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
purifiedtails: {
		name: "Purified Tails",
		spritenum: 646,
		onTakeItem: false,
		zMove: "First and Last Nameless Danmaku",
		zMoveFrom: "Fiery Wrath",
		itemUser: ["Junko"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
celestialbodies: {
		name: "Celestial Bodies",
		spritenum: 646,
		onTakeItem: false,
		zMove: "Trinitarian Rhapsody",
		zMoveFrom: "Ruination",
		itemUser: ["Lapislazuli Hecatia"],
		num: 777,
		gen: 7,
		isNonstandard: "Past",
},
occultballs: {
        name: "Occult Balls",
        spritenum: 743, 
        fling: { basePower: 30 },
        gen: 9,

        onModifyMove(move, pokemon) {
            if (pokemon.baseSpecies.name !== "Usami Sumireko") return;
            if (move.category === "Status") return;

            move.ignoreDefensive = true;
			move.infiltrates = true;
            delete move.flags['protect'];
		},

        onTakeItem(item, pokemon, source) {
        if (pokemon.baseSpecies.name === 'Usami Sumireko') return false;
    },
    },
}