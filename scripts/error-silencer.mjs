// @ts-check

/* -------------------------------------------- */
/*  Paid asset modules                          */
/* -------------------------------------------- */
/**
 * The paid modules this module's authored content draws animations and sounds from.
 *
 * `namespace` is the Sequencer database root whose entries the module ships, and `pathPrefix` is where its files
 * live on disk. A namespace belongs to the module that ships the assets, not to every module that reads them:
 * JB2A's free collection registers `jb2a` as well, so an absent `jb2a_patreon` leaves that namespace present but
 * incomplete. Boss Loot's editor carries no database entries of its own, hence the null namespace.
 */
const PREMIUM_PROVIDERS = [
  { module: 'jb2a_patreon', namespace: 'jb2a', pathPrefix: 'modules/jb2a_patreon/' },
  { module: 'blfx-assets-pack01', namespace: 'blfx', pathPrefix: 'modules/blfx-assets-pack01/' },
  { module: 'boss-loot-assets-premium', namespace: null, pathPrefix: 'modules/boss-loot-assets-premium/' },
];

/** Marks a patched prototype or singleton so a second install pass leaves it alone. */
const SILENCED = Symbol('emblem-rpg-content silenced');

/**
 * Returned in place of a dropped toast. Its `remove()` and `update()` do nothing, but passing it to
 * `ui.notifications.remove()` or `has()` throws, because core rejects an id of 0.
 */
const DROPPED_NOTIFICATION = Object.freeze({ id: 0, pct: 0, remove() {}, update() {} });

/** Distinguishes "every source was dropped" from a falsy argument Sequencer should reject itself. */
const NOTHING_TO_PRELOAD = Symbol('nothing to preload');

/** Database roots whose missing entries are expected, resolved once at install. */
let silencedNamespaces = new Set();

/** File-path prefixes whose missing files are expected, resolved once at install. */
let silencedPrefixes = [];

/** One matcher per silenced namespace, testing for that root used as a database path. */
let silencedPatterns = [];

/* -------------------------------------------- */
/*  Installation                                */
/* -------------------------------------------- */
/**
 * Keep Sequencer quiet about assets only the paid JB2A and Boss Loot modules can supply.
 *
 * The compendium content addresses `jb2a.*` and `blfx.*` database paths directly, so a world without those modules
 * reaches Sequencer with paths it cannot resolve. Sequencer answers each one with a toast and a console line, and
 * an effect section additionally throws out of `Sequence#play`, which loses the rest of the sequence. Nothing here
 * installs the missing modules or replaces their assets; the affected effect or sound simply does not play.
 *
 * Runs at `init`. When every paid module is active it installs nothing, so Sequencer's own errors still show.
 */
export function installErrorSilencer() {
  const absent = PREMIUM_PROVIDERS.filter(provider => !isModuleActive(provider.module));
  if (!absent.length) return;

  silencedNamespaces = new Set(absent.map(provider => provider.namespace).filter(Boolean));
  silencedPrefixes = absent.map(provider => provider.pathPrefix);
  silencedPatterns = [...silencedNamespaces].map(namespace => new RegExp(`(^|[^\\w.-])${namespace}\\.`));

  silenceNotifications();
  silenceConsole();
  if (globalThis.Sequencer?.BaseSection) patchSequencer();
  else Hooks.once('sequencerReady', patchSequencer);

  console.info(
    `emblem-rpg-content | Silencing Sequencer/Foundry asset-not-found notices for absent premium modules `
    + `(${absent.map(provider => provider.module).join(', ')}). Any console or toast error or warning whose text `
    + `contains one of these file prefixes (${silencedPrefixes.join(', ')}) or database namespaces `
    + `(${[...silencedNamespaces].join(', ')}) is dropped rather than logged; see this file for what still gets `
    + `through.`
  );
}

/** Both Sequencer patches, once its globals exist. */
function patchSequencer() {
  skipSectionsMissingAssets();
  skipPreloadsMissingAssets();
}

/* -------------------------------------------- */
/*  Sequencer patches                           */
/* -------------------------------------------- */
/**
 * Skip a section whose file can only come from an absent module, before Sequencer looks the file up.
 *
 * `Section#_execute` treats a false `_shouldPlay` as a clean skip, marks the section SKIPPED and moves on, which is
 * what an effect from a missing paid module needs. Every section type inherits this one method from
 * `Sequencer.BaseSection`, so effects and sounds are both covered, and a section without a file answers false here
 * and is left to Sequencer's own `playIf` handling.
 */
function skipSectionsMissingAssets() {
  const prototype = globalThis.Sequencer?.BaseSection?.prototype;
  if (!prototype || Object.hasOwn(prototype, SILENCED)) return;
  const shouldPlay = prototype._shouldPlay;

  prototype._shouldPlay = async function (...args) {
    if (unavailableFile(this._file)) return false;
    return shouldPlay.apply(this, args);
  };
  prototype[SILENCED] = true;
}

/**
 * Drop paths that only a missing paid module could supply from a preload request.
 *
 * `SequencerPreloader#_cleanSrcs` passes a path it cannot find in the database through as a file name, so the
 * fetch that follows asks the server for `jb2a.something` and logs a failure per entry. Dropping them first keeps
 * the surviving files preloading normally; a request left with nothing to fetch resolves without calling
 * Sequencer, which would otherwise warn about being handed an empty list.
 */
function skipPreloadsMissingAssets() {
  const preloader = globalThis.Sequencer?.Preloader;
  if (!preloader || preloader[SILENCED]) return;

  for (const method of ['preload', 'preloadForClients']) {
    const original = preloader[method];
    if (typeof original !== 'function') continue;
    preloader[method] = function (sources, ...rest) {
      const kept = keptSources(sources);
      if (kept === NOTHING_TO_PRELOAD) return Promise.resolve();
      return original.call(this, kept, ...rest);
    };
  }
  preloader[SILENCED] = true;
}

/** The preload sources worth fetching. Anything Sequencer would reject as malformed passes through untouched. */
function keptSources(sources) {
  if (typeof sources === 'string') return unavailableReference(sources) ? NOTHING_TO_PRELOAD : sources;
  if (!Array.isArray(sources)) return sources;
  const kept = sources.filter(source => !(typeof source === 'string' && unavailableReference(source)));
  return kept.length ? kept : NOTHING_TO_PRELOAD;
}

/* -------------------------------------------- */
/*  Message filters                             */
/* -------------------------------------------- */
/**
 * Withhold error and warning toasts that name an absent module's assets.
 *
 * Sequencer reports a missing database entry through `ui.notifications.error` and never inspects the return value.
 * `Notifications#error` and `#warn` both call the public `notify`, so the one wrapper covers them, and the prototype
 * is patched rather than the singleton because `ui.notifications` is not built yet at `init`. Success and info
 * notices are left alone. Dropping a toast also drops the console line Foundry logs alongside it.
 *
 * The method is replaced by plain assignment, not through libWrapper, so another module that also replaces
 * `notify` runs before or after this one depending on load order.
 */
function silenceNotifications() {
  const prototype = foundry?.applications?.ui?.Notifications?.prototype;
  if (!prototype || Object.hasOwn(prototype, SILENCED)) return;
  const notify = prototype.notify;

  prototype.notify = function (message, type = 'info', options) {
    const silenceable = type === 'error' || type === 'warning';
    if (silenceable && namesAbsentAsset(String(message ?? ''))) return DROPPED_NOTIFICATION;
    return notify.call(this, message, type, options);
  };
  prototype[SILENCED] = true;
}

/**
 * Withhold console errors and warnings that name an absent module's assets.
 *
 * Sequencer's own warnings, its audio loader and Foundry's texture loader all write straight to the console
 * without a notification, so the toast filter alone leaves the log full of the same absences. The browser's own
 * network log still records the failed requests, which no script can suppress.
 *
 * Only the first argument is checked; that is where Sequencer and Foundry put the missing path. A message that
 * merely quotes a paid path is hidden too, including a typo in an authored effect key.
 *
 * This replaces `console.error` and `console.warn` outright, so it filters every package's output, and DevTools
 * shows this file as the source of every console error and warning.
 */
function silenceConsole() {
  for (const level of ['error', 'warn']) {
    const original = console[level];
    if (typeof original !== 'function' || original[SILENCED]) continue;
    const filtered = function (...args) {
      if (argumentNamesAbsentAsset(args[0])) return;
      original.apply(console, args);
    };
    filtered[SILENCED] = true;
    console[level] = filtered;
  }
}

/* -------------------------------------------- */
/*  Absence tests                               */
/* -------------------------------------------- */
/**
 * Whether a section's file can only come from an absent module. If any candidate file can load, the section
 * plays; Sequencer picks one at random, and a failed pick is hidden by the message filters.
 */
function unavailableFile(file) {
  if (typeof file === 'string') return unavailableReference(file);
  if (Array.isArray(file)) return file.length > 0 && file.every(unavailableFile);
  if (file && typeof file === 'object') {
    const candidates = Object.values(file);
    return candidates.length > 0 && candidates.every(unavailableFile);
  }
  return false;
}

/**
 * Whether one database path or file path needs a module this world does not have.
 *
 * A path inside an absent module's folder is unavailable outright. A database path is unavailable only once
 * Sequencer confirms it holds no entry, because the free JB2A collection registers part of `jb2a` and those
 * entries must keep playing.
 */
function unavailableReference(reference) {
  if (!reference || typeof reference !== 'string') return false;
  if (silencedPrefixes.some(prefix => reference.startsWith(prefix))) return true;
  if (!silencedNamespaces.has(reference.split('.')[0])) return false;
  try {
    return globalThis.Sequencer?.Database?.entryExists(reference) !== true;
  } catch {
    return true;
  }
}

/** Whether a message names a silenced database root used as a path, or a silenced module's folder. */
function namesAbsentAsset(text) {
  if (!text) return false;
  if (silencedPrefixes.some(prefix => text.includes(prefix))) return true;
  return silencedPatterns.some(pattern => pattern.test(text));
}

/** Whether one console argument names an absent module's assets. Errors are read for their message. */
function argumentNamesAbsentAsset(value) {
  if (typeof value === 'string') return namesAbsentAsset(value);
  if (value instanceof Error) return namesAbsentAsset(value.message);
  return false;
}

function isModuleActive(id) {
  return globalThis.game?.modules?.get(id)?.active === true;
}
