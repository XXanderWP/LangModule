export class LanguageCore<
  T extends Record<string, Record<string, string>>,
  LangKey extends keyof T = keyof T
> {
  private readonly _languages_data: T;
  private _currentLanguage: LangKey | null = null;

  constructor(data: T, defaultLanguage?: keyof T) {
    if (Object.keys(data).length === 0) {
      throw new Error("Languages data cannot be empty.");
    }

    this._languages_data = data;
    if(defaultLanguage) {
        if (!this.langKeys.includes(defaultLanguage as LangKey)) {
            throw new Error(`Default language ${String(defaultLanguage)} is not supported.`);
        }
        this._currentLanguage = defaultLanguage as LangKey;
    } else {
        this._currentLanguage = Object.keys(data)[0] as LangKey;
    }
  }

  get languagesData(): T {
    return this._languages_data;
  }

  get currentLanguage(): LangKey | null {
    return this._currentLanguage;
  }

  set currentLanguage(lang: LangKey) {
    if (!this.langKeys.includes(lang)) {
      throw new Error(`Language ${String(lang)} is not supported.`);
    }
    this._currentLanguage = lang;
  }

  get langKeys(): LangKey[] {
    return Object.keys(this._languages_data) as LangKey[];
  }

  get currentLanguageData(): T[LangKey] | null {
    if (!this._currentLanguage) return null;
    return this._languages_data[this._currentLanguage];
  }

  translate<K extends keyof T[LangKey]>(
  key: K,
  ...args: (string | number)[]
): string | null {
    if (!this._currentLanguage) return null;

    const langData = this._languages_data[this._currentLanguage];
    let res = langData[key] as string;

    args.forEach((arg, index) => {
      res = res.replace(new RegExp(`\\{${index}\\}`, "g"), String(arg));
    });

    return res || null;
  }
}

