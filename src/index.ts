/**
 * A generic, type-safe internationalization (i18n) core class.
 *
 * Manages a collection of language translation maps and provides utilities
 * for switching the active language and resolving translated strings with
 * optional interpolation placeholders.
 *
 * @template T - A record whose keys are language identifiers and whose values
 *   are flat string-to-string translation maps (e.g. `{ en: { hello: "Hello" }, fr: { hello: "Bonjour" } }`).
 * @template LangKey - Union of the top-level keys of `T`, inferred automatically.
 *
 * @example
 * const lc = new LanguageCore({
 *   en: { greeting: "Hello, {0}!" },
 *   es: { greeting: "¡Hola, {0}!" },
 * }, "en");
 *
 * lc.translate("greeting", "World"); // "Hello, World!"
 * lc.currentLanguage = "es";
 * lc.translate("greeting", "Mundo"); // "¡Hola, Mundo!"
 */
export class LanguageCore<
  T extends Record<string, Record<string, string>>,
  LangKey extends keyof T = keyof T,
> {
  /**
   * The immutable translations dataset provided at construction time.
   * Contains all language entries keyed by their language identifier.
   */
  private readonly _languages_data: T;

  /**
   * The currently active language key.
   * Defaults to the first key of the provided data object unless overridden
   * via the `defaultLanguage` constructor parameter.
   * `null` only while the class has not yet been fully initialised
   * (should not occur under normal usage).
   */
  private _currentLanguage: LangKey;

  /**
   * Creates a new `LanguageCore` instance.
   *
   * Validates the supplied translations data, ensures all language entries
   * share the same set of translation keys, and sets the initial active language.
   *
   * @param data - The full translations dataset. Must be a non-empty object
   *   where every language entry is a flat `Record<string, string>` and all
   *   entries contain exactly the same keys.
   * @param defaultLanguage - Optional. The language key to activate initially.
   *   If omitted, the first key of `data` is used.
   *
   * @throws {Error} If `data` is empty.
   * @throws {Error} If any language entry is not a plain object.
   * @throws {Error} If language entries have mismatched translation keys.
   * @throws {Error} If the supplied `defaultLanguage` is not a key of `data`.
   */
  constructor(data: T, defaultLanguage?: keyof T) {
    this.validateLanguageData(data)

    this._languages_data = data;
    if (defaultLanguage) {
      if (!this.langKeys.includes(defaultLanguage as LangKey)) {
        throw new Error(
          `Default language ${String(defaultLanguage)} is not supported.`,
        );
      }
      this._currentLanguage = defaultLanguage as LangKey;
    } else {
      this._currentLanguage = Object.keys(data)[0] as LangKey;
    }
  }

  /**
   * Validates the structure of the translations dataset.
   *
   * Ensures the dataset is non-empty, that every language entry is a plain
   * (non-array) object, and that all language entries expose exactly the same
   * set of translation keys as the first entry.
   *
   * @param data - The translations dataset to validate.
   *
   * @throws {Error} If `data` has no keys.
   * @throws {Error} If any language entry is not a plain object or is an array.
   * @throws {Error} If any language entry has a different set of keys than the
   *   first language entry.
   */
  private validateLanguageData(data: T): void {
    if (Object.keys(data).length === 0) {
      throw new Error("Languages data cannot be empty.");
    }
    const firstLangData = data[Object.keys(data)[0] as LangKey];
    if (typeof firstLangData !== "object" || Array.isArray(firstLangData)) {
      throw new Error("Each language data must be an object.");
    }

    const firstLangKeys = Object.keys(firstLangData);
    for (const langKey in data) {
      const langData = data[langKey];
      if (typeof langData !== "object" || Array.isArray(langData)) {
        throw new Error(`Language data for ${langKey} must be an object.`);
      }
      const langKeys = Object.keys(langData);
      if (
        langKeys.length !== firstLangKeys.length ||
        !langKeys.every((key) => firstLangKeys.includes(key))
      ) {
        throw new Error(
          `All languages must have the same keys. Mismatch found in ${langKey}.`,
        );
      }
    }
  }

  /**
   * Returns the full, immutable translations dataset passed to the constructor.
   *
   * @returns The complete `T` object containing all language translation maps.
   */
  get languagesData(): T {
    return this._languages_data;
  }

  /**
   * Returns the key of the currently active language.
   *
   * @returns The active language key.
   */
  get currentLanguage(): LangKey {
    return this._currentLanguage;
  }

  /**
   * Sets the active language used for subsequent `translate()` calls.
   *
   * @param lang - The language key to activate. Must be one of the keys
   *   present in the translations dataset.
   *
   * @throws {Error} If `lang` is not a recognised language key.
   */
  set currentLanguage(lang: LangKey) {
    if (!this.langKeys.includes(lang)) {
      throw new Error(`Language ${String(lang)} is not supported.`);
    }
    this._currentLanguage = lang;
  }

  /**
   * Returns all language keys available in the translations dataset.
   *
   * @returns An array of every top-level key of `T`, typed as `LangKey[]`.
   */
  get langKeys(): LangKey[] {
    return Object.keys(this._languages_data) as LangKey[];
  }

  /**
   * Returns the translation map for the currently active language.
   *
   * @returns The `Record<string, string>` of the active language.
   */
  get currentLanguageData(): T[LangKey] {
    return this._languages_data[this._currentLanguage];
  }

  /**
   * Looks up a translation key in the active language and optionally
   * interpolates positional placeholders (`{0}`, `{1}`, …) with the
   * supplied arguments.
   *
   * Placeholders follow the pattern `{n}` where `n` is the zero-based index
   * of the corresponding argument. Each placeholder is replaced globally, so
   * `{0}` will be substituted everywhere it appears in the template string.
   *
   * @template K - The specific key within the active language's translation map.
   *
   * @param key - The translation key to look up.
   * @param args - Zero or more values to interpolate into the translated string.
   *   Each value is coerced to a string and replaces the matching `{n}` token.
   *
   * @returns The translated (and interpolated) string, or `null` if the resolved translation is an empty string.
   *
   * @example
   * lc.translate("greeting", "Alice");       // "Hello, Alice!"
   * lc.translate("score", "Alice", 42);      // "Alice scored 42 points."
   */
  translate<K extends keyof T[LangKey]>(
    key: K,
    ...args: (string | number)[]
  ): string | null {
    const langData = this._languages_data[this._currentLanguage];
    let res = langData[key] as string;

    args.forEach((arg, index) => {
      res = res.replace(new RegExp(`\\{${index}\\}`, "g"), String(arg));
    });

    return res || null;
  }
}


export default LanguageCore;