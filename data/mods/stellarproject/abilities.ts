import { truncate } from 'node:fs';

export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
     runaway: {
        inherit: true,
        onTrapPokemon(pokemon) {
            pokemon.trapped = false;
            pokemon.maybeTrapped = false;
        },
     },
     pickup: {
        inherit: true,
        onAfterUseItem(item, pokemon) {
			pokemon.m.pickupItem = item.id;
		},

		onResidualOrder: 26,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			if (pokemon.item) return;
			if (!pokemon.m.pickupItem) return;

			if (!this.randomChance(1, 2)) return;

			const item = this.dex.items.get(pokemon.m.pickupItem);
			if (!item.exists) return;

			pokemon.setItem(item);

			this.add('-activate', pokemon, 'ability: Pickup');
			this.add('-item', pokemon, item.name, '[from] ability: Pickup');
		},
	},
	magmaarmor: {
		inherit: true,
		onUpdate: undefined,
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ice') {
					this.add('-immune', target, '[from] ability: Magma Armor');
				return null;
			}
		},
	},
	protean: {
		inherit: true,
		onPrepareHit(source, target, move) {
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
	},
	cutecharm: {
		inherit: true,
		onDamagingHit: undefined,
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move.type === 'Dark') mod *= 2;
			if (move.category === 'Special') mod /= 2;
			return this.chainModify(mod);
		},
	},
	mindseye: {
		inherit: true,
		onTryBoost: undefined,
		onModifyMove: undefined,
		onNegateImmunity(type, pokemon) {
			return true;
		}
	},
	schooling: {
		inherit: true,
		onSwitchInPriority: -1,
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed) return;
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			}
		},
	teraformzero: {
		inherit: true,
		onStart(pokemon) {
			if (this.field.weather) this.field.clearWeather();
      		if (this.field.terrain) this.field.clearTerrain();
		},
		onUpdate(pokemon) {
      		if (!pokemon.isActive) return;

     		if (this.field.weather) this.field.clearWeather();
      		if (this.field.terrain) this.field.clearTerrain();
		},
		onResidual(pokemon) {
      		if (!pokemon.isActive) return;

      		if (this.field.weather) this.field.clearWeather();
      		if (this.field.terrain) this.field.clearTerrain();
		}
	},
	plus: {
		inherit: true,
		onModifySpA: undefined,
		 onStart(pokemon) {
        if (!pokemon.side) return;

        const ally = pokemon.side.active.find(
            target => target && target !== pokemon && !target.fainted
        );

        if (ally) {
            this.boost({atk: 1, spa: 1}, ally, pokemon);
        	}
   	 },
	},
	minus: {
		inherit: true,
		onModifySpA: undefined,
		 onStart(pokemon) {
        if (!pokemon.side) return;

        const ally = pokemon.side.active.find(
            target => target && target !== pokemon && !target.fainted
        );

        if (ally) {
            this.boost({def: 1, spd: 1}, ally, pokemon);
        	}
   	 },
	},
	anticipation: {
		inherit: true,
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category === 'Status') continue;
					const moveType = move.id === 'hiddenpower' ? target.hpType : move.type;
					if (
						this.dex.getImmunity(moveType, pokemon) && this.dex.getEffectiveness(moveType, pokemon) > 0 ||
						move.ohko
					) {
						this.add('-ability', pokemon, 'Anticipation');
						this.boost({ spe: 1 }, pokemon);
						return;
					}
				}
			}
		}
	},
	forewarn: {
		inherit: true,
		onStart(pokemon) {
        let warnMoves: [Move, Pokemon][] = [];
        let warnBp = 1;

        for (const target of pokemon.foes()) {
            if (!target.moveSlots) continue;

            for (const moveSlot of target.moveSlots) {
                const move = this.dex.moves.get(moveSlot.move);

                let bp = move.basePower;

                if (move.ohko) bp = 150;
                if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') bp = 120;
                if (bp === 1) bp = 80;
                if (!bp && move.category !== 'Status') bp = 80;

                if (bp > warnBp) {
                    warnMoves = [[move, target]];
                    warnBp = bp;
                } else if (bp === warnBp) {
                    warnMoves.push([move, target]);
                }
            }
        }

        if (!warnMoves.length) return;

        // Explicit tuple narrowing for TypeScript stability
        const [warnMove, warnTarget] =
            this.sample(warnMoves) as [Move, Pokemon];

        this.add(
            '-activate',
            pokemon,
            'ability: Forewarn',
            warnMove.name,
            `[of] ${warnTarget}`
        );

        // Store warned move + source safely
        pokemon.m.forewarnedMove = warnMove.id;
        pokemon.m.forewarnedSource = warnTarget;
    },

    onSourceModifyDamage(damage, source, target, move) {
        if (!target.m?.forewarnedMove) return;

        if (
            move.id === target.m.forewarnedMove &&
            source === target.m.forewarnedSource
        ) {
            this.debug('Forewarn damage reduction');
            return this.chainModify(0.5);
        }
    },

    onFoeSwitchOut(pokemon) {
        for (const ally of pokemon.side.active) {
            if (!ally) continue;

            if (ally.m?.forewarnedSource === pokemon) {
                delete ally.m.forewarnedMove;
                delete ally.m.forewarnedSource;
            }
        }
    },
},
bigpecks: {
	inherit: true,
	onTryBoost: undefined,
	onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Flying') {
				this.debug('Big Pecks boost');
				return this.chainModify(1.5);
			}
		},
},
illuminate: {
	inherit: true,
	onTryBoost: undefined,
	onStart(pokemon) {
		this.boost({ accuracy: 1}, pokemon);
	}
},
keeneye: {
	inherit: true,
	onTryBoost: undefined,
	onStart(pokemon) {
		this.boost({ accuracy: 1}, pokemon);
	}
},
healer: {
	inherit: true,
	onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16);
		},
},
poisonpuppeteer: {
	inherit: true,
	onAnyAfterSetStatus(status, target, source, effect) {
			if (source !== this.effectState.target || target === source || effect.effectType !== 'Move') return;
			if (status.id === 'psn' || status.id === 'tox') {
				target.addVolatile('confusion');
			}
		},
},
}
