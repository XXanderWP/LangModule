import { describe, it, expect, jest } from "@jest/globals";
import { LanguageCore } from "../src/index";

describe("LangModule", () => {
  it("should initialize with valid data and default language", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    const langModule = new LanguageCore(data, "es");
    expect(langModule.languagesData).toEqual(data);
    expect(langModule.currentLanguage).toBe("es");
  });

  it("should throw an error if initialized with empty data", () => {
    expect(() => new LanguageCore({})).toThrow("Languages data cannot be empty.");
  });

  it("should throw an error if default language is not supported", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    // @ts-ignore
    expect(() => new LanguageCore(data, "fr")).toThrow("Default language fr is not supported.");
  });

  it("should return the correct translation for the current language", () => {
    const data = {
      en: { greeting: "Hello, {0}!" },
      es: { greeting: "¡Hola, {0}!" },
    };
    const langModule = new LanguageCore(data, "en");
    expect(langModule.translate("greeting", "John")).toBe("Hello, John!");
    langModule.currentLanguage = "es";
    expect(langModule.translate("greeting", "John")).toBe("¡Hola, John!");
  });

  it("should throw an error when setting an unsupported language", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    const langModule = new LanguageCore(data);
    // @ts-ignore
    expect(() => (langModule.currentLanguage = "fr")).toThrow("Language fr is not supported.");
  });

  it("should return null for translation if current language is not set", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    const langModule = new LanguageCore(data);
    // @ts-ignore
    expect(() => (langModule.currentLanguage = null)).toThrow("Language null is not supported.");
  });

  it("should return key for translation if key does not exist", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    const langModule = new LanguageCore(data);
    // @ts-ignore
    expect(langModule.translate("farewell")).toBe("farewell");
  });

  it("should return the correct language keys", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    };
    const langModule = new LanguageCore(data);
    expect(langModule.langKeys).toEqual(["en", "es"]);
  });
 
  describe("onChangeLanguage", () => {
    const data = {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
      fr: { greeting: "Bonjour" },
    };

    it("should invoke the callback when the language changes", () => {
      const langModule = new LanguageCore(data, "en");
      const cb = jest.fn();
      langModule.onChangeLanguage(cb);
      langModule.currentLanguage = "es";
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should not invoke the callback when the language is set to the same value", () => {
      const langModule = new LanguageCore(data, "en");
      const cb = jest.fn();
      langModule.onChangeLanguage(cb);
      langModule.currentLanguage = "en";
      expect(cb).not.toHaveBeenCalled();
    });

    it("should stop invoking the callback after unregistering", () => {
      const langModule = new LanguageCore(data, "en");
      const cb = jest.fn();
      const unregister = langModule.onChangeLanguage(cb);
      unregister();
      langModule.currentLanguage = "es";
      expect(cb).not.toHaveBeenCalled();
    });

    it("should support multiple callbacks at once", () => {
      const langModule = new LanguageCore(data, "en");
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      langModule.onChangeLanguage(cb1);
      langModule.onChangeLanguage(cb2);
      langModule.currentLanguage = "es";
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it("should only unregister the specific callback, leaving others active", () => {
      const langModule = new LanguageCore(data, "en");
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      const unregister1 = langModule.onChangeLanguage(cb1);
      langModule.onChangeLanguage(cb2);
      unregister1();
      langModule.currentLanguage = "es";
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it("should invoke the callback on each subsequent language change", () => {
      const langModule = new LanguageCore(data, "en");
      const cb = jest.fn();
      langModule.onChangeLanguage(cb);
      langModule.currentLanguage = "es";
      langModule.currentLanguage = "fr";
      expect(cb).toHaveBeenCalledTimes(2);
    });
  });
});