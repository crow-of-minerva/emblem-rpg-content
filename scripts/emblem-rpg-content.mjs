// @ts-check
import { createSoundDatabase } from './sound-database.mjs';
import { installErrorSilencer } from './error-silencer.mjs';

/* -------------------------------------------- */
/*  Sequencer registration                      */
/* -------------------------------------------- */
const MODULE_ID = 'emblem-rpg-content';

/**
 * Namespace this module claims in the Sequencer database.
 *
 * The rebuild registers none of its own, so the short name belongs to the content that ships the files. Every
 * bundled sound answers below `emblem.sound`, addressed by its family folder and hyphenated name, so
 * `sound/weapon/bow-draw-1.wav` is `emblem.sound.weapon.bow.draw.1`.
 */
const NAMESPACE = 'emblem';

Hooks.once('sequencerReady', () => {
  if (!globalThis.Sequencer?.Database?.registerEntries) return;
  Sequencer.Database.registerEntries(NAMESPACE, { sound: createSoundDatabase(`modules/${MODULE_ID}`) });
});

/* -------------------------------------------- */
/*  Premium asset absence                       */
/* -------------------------------------------- */
Hooks.once('init', installErrorSilencer);
