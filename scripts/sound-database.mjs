// @ts-check

/* -------------------------------------------- */
/*  Content sound catalog                       */
/* -------------------------------------------- */
/**
 * Build the Sequencer sound tree below one module asset root.
 *
 * Maintained by hand; this repository has no generator script. Each leaf names one file under `sound/`: the file's
 * family folder and hyphenated stem become nested keys, so `sound/weapon/bow-draw-1.wav` is reached as
 * `weapon.bow.draw["1"]` and `sound/creature/boar-1.wav` as `creature.boar["1"]`. Some files under `sound/`
 * have no entry here and so cannot be reached through Sequencer. Never rename an existing key: authored content
 * refers to these ids.
 *
 * `emblem-rpg-content.mjs` calls this once, at the `sequencerReady` hook, and registers the result under the
 * `emblem` namespace with `Sequencer.Database.registerEntries('emblem', { sound: ... })`, so every path here
 * is reachable as `emblem.sound.<path>`, e.g. `emblem.sound.weapon.bow.draw.1`.
 * @param {string} path Module root, without a trailing slash.
 * @returns {object}
 */
export function createSoundDatabase(path) {
  return {
    ability: {
      bard: {
        flourish: `${path}/sound/ability/bard-flourish.wav`,
        inspire: `${path}/sound/ability/bard-inspire.mp3`,
      },
      swap: `${path}/sound/ability/swap.wav`,
    },
    creature: {
      banshee: {
        howl: `${path}/sound/creature/banshee-howl.wav`,
      },
      bear: {
        attack: {
          "1": `${path}/sound/creature/bear-attack-1.wav`,
          "3": `${path}/sound/creature/bear-attack-3.wav`,
        },
        roar: {
          "1": `${path}/sound/creature/bear-roar-1.wav`,
          "2": `${path}/sound/creature/bear-roar-2.wav`,
        },
      },
      boar: {
        "1": `${path}/sound/creature/boar-1.wav`,
      },
      horse: {
        gallop: `${path}/sound/creature/horse-gallop.mp3`,
        neigh: `${path}/sound/creature/horse-neigh.wav`,
        snort: `${path}/sound/creature/horse-snort.wav`,
      },
      lion: {
        roar: {
          "1": `${path}/sound/creature/lion-roar-1.wav`,
          "2": `${path}/sound/creature/lion-roar-2.wav`,
        },
      },
      wolf: {
        bark: `${path}/sound/creature/wolf-bark.wav`,
      },
      wyvern: {
        roar: {
          "1": `${path}/sound/creature/wyvern-roar-1.wav`,
          "2": `${path}/sound/creature/wyvern-roar-2.wav`,
        },
      },
      zombie: {
        roar: `${path}/sound/creature/zombie-roar.wav`,
      },
    },
    magic: {
      aura: {
        expand: `${path}/sound/magic/aura-expand.wav`,
      },
      bubbles: `${path}/sound/magic/bubbles.mp3`,
      buff: `${path}/sound/magic/buff.wav`,
      cast: {
        "3": `${path}/sound/magic/cast-3.wav`,
        "6": `${path}/sound/magic/cast-6.wav`,
      },
      chimes: `${path}/sound/magic/chimes.wav`,
      dark: {
        fire: `${path}/sound/magic/dark-fire.wav`,
        sparks: `${path}/sound/magic/dark-sparks.wav`,
      },
      debuff: {
        "1": `${path}/sound/magic/debuff-1.wav`,
        "2": `${path}/sound/magic/debuff-2.mp3`,
        "3": `${path}/sound/magic/debuff-3.wav`,
      },
      divine: {
        cast: `${path}/sound/magic/divine-cast.wav`,
      },
      draw: {
        circle: `${path}/sound/magic/draw-circle.wav`,
      },
      electric: {
        loop: `${path}/sound/magic/electric-loop.wav`,
      },
      fire: {
        loop: `${path}/sound/magic/fire-loop.wav`,
      },
      flash: `${path}/sound/magic/flash.wav`,
      ghost: {
        whispers: `${path}/sound/magic/ghost-whispers.mp3`,
      },
      heal: {
        "1": `${path}/sound/magic/heal-1.wav`,
        "2": `${path}/sound/magic/heal-2.wav`,
        "3": `${path}/sound/magic/heal-3.wav`,
        "4": `${path}/sound/magic/heal-4.wav`,
      },
      ice: {
        "1": `${path}/sound/magic/ice-1.mp3`,
        "2": `${path}/sound/magic/ice-2.mp3`,
      },
      light: {
        cast: {
          "1": `${path}/sound/magic/light-cast-1.wav`,
          "2": `${path}/sound/magic/light-cast-2.wav`,
        },
        impact: `${path}/sound/magic/light-impact.wav`,
      },
      mystic: {
        wave: {
          "1": `${path}/sound/magic/mystic-wave-1.wav`,
          "2": `${path}/sound/magic/mystic-wave-2.wav`,
          "3": `${path}/sound/magic/mystic-wave-3.wav`,
        },
      },
      portal: `${path}/sound/magic/portal.wav`,
      puff: {
        of: {
          smoke: `${path}/sound/magic/puff-of-smoke.wav`,
        },
      },
      ray: {
        loop: `${path}/sound/magic/ray-loop.wav`,
      },
      shock: {
        charge: `${path}/sound/magic/shock-charge.wav`,
        impact: `${path}/sound/magic/shock-impact.wav`,
      },
      smoke: `${path}/sound/magic/smoke.wav`,
      sparkles: `${path}/sound/magic/sparkles.wav`,
      sun: {
        ray: `${path}/sound/magic/sun-ray.wav`,
      },
      wind: {
        gust: `${path}/sound/magic/wind-gust.wav`,
        impact: `${path}/sound/magic/wind-impact.wav`,
        loop: `${path}/sound/magic/wind-loop.wav`,
      },
    },
    weapon: {
      blade: {
        "1": `${path}/sound/weapon/blade-1.mp3`,
        "2": `${path}/sound/weapon/blade-2.wav`,
        "3": `${path}/sound/weapon/blade-3.wav`,
        swing: {
          "1": `${path}/sound/weapon/blade-swing-1.wav`,
          "2": `${path}/sound/weapon/blade-swing-2.wav`,
          "3": `${path}/sound/weapon/blade-swing-3.wav`,
        },
      },
      bow: {
        draw: {
          "1": `${path}/sound/weapon/bow-draw-1.wav`,
          "2": `${path}/sound/weapon/bow-draw-2.wav`,
        },
        fire: {
          "1": `${path}/sound/weapon/bow-fire-1.wav`,
        },
        projectile: `${path}/sound/weapon/bow-projectile.wav`,
      },
      claw: `${path}/sound/weapon/claw.wav`,
      dagger: {
        impact: `${path}/sound/weapon/dagger-impact.wav`,
        throw: `${path}/sound/weapon/dagger-throw.wav`,
      },
      greatsword: {
        "1": `${path}/sound/weapon/greatsword-1.wav`,
        "2": `${path}/sound/weapon/greatsword-2.wav`,
        "3": `${path}/sound/weapon/greatsword-3.wav`,
        "4": `${path}/sound/weapon/greatsword-4.wav`,
      },
      heavy: {
        swing: {
          "1": `${path}/sound/weapon/heavy-swing-1.wav`,
          "2": `${path}/sound/weapon/heavy-swing-2.wav`,
          "3": `${path}/sound/weapon/heavy-swing-3.wav`,
          "4": `${path}/sound/weapon/heavy-swing-4.wav`,
          "5": `${path}/sound/weapon/heavy-swing-5.wav`,
        },
      },
      polearm: {
        impact: `${path}/sound/weapon/polearm-impact.wav`,
        swing: {
          "1": `${path}/sound/weapon/polearm-swing-1.mp3`,
          "2": `${path}/sound/weapon/polearm-swing-2.wav`,
        },
      },
      punch: {
        "1": `${path}/sound/weapon/punch-1.wav`,
        "2": `${path}/sound/weapon/punch-2.mp3`,
        "3": `${path}/sound/weapon/punch-3.mp3`,
      },
      swing: {
        "1": `${path}/sound/weapon/swing-1.wav`,
        "2": `${path}/sound/weapon/swing-2.wav`,
        "3": `${path}/sound/weapon/swing-3.mp3`,
        "4": `${path}/sound/weapon/swing-4.mp3`,
      },
    },
  };
}
