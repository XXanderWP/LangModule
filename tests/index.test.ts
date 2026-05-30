import { describe, it, expect } from "@jest/globals";
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


});