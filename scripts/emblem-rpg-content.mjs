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
 * The system registers nothing under `emblem`, so this module uses it for its own sounds. Each sound is reached
 * by its folder and hyphenated file name, so `sound/weapon/bow-draw-1.wav` is `emblem.sound.weapon.bow.draw.1`.
 */
const NAMESPACE = 'emblem';

Hooks.once('sequencerReady', () => {
  if (!globalThis.Sequencer?.Database?.registerEntries) return;
  Sequencer.Database.registerEntries(NAMESPACE, { sound: createSoundDatabase(`modules/${MODULE_ID}`) });
});

/* -------------------------------------------- */
/*  Missing paid asset modules                  */
/* -------------------------------------------- */
Hooks.once('init', installErrorSilencer);
