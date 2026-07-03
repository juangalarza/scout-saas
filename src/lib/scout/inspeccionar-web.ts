import * as cheerio from "cheerio";

const WEB_TIMEOUT_MS = 8000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type WebInfo = {
  web_status:
    | "sin_web"
    | "activa"
    | "bloqueada"
    | "timeout"
    | "error"
    | `error_${number}`;
  web_año: number | null;
  tiene_whatsapp: boolean;
  instagram_url: string;
  facebook_url: string;
};

function detectarAño($: cheerio.CheerioAPI): number | null {
  const años: number[] = [];
  const agregar = (texto: string, patron: RegExp) => {
    for (const m of texto.matchAll(patron)) {
      const año = parseInt(m[1] ?? m[0], 10);
      if (año >= 2000 && año <= 2030) años.push(año);
    }
  };

  agregar($.root().text(), /(?:©|copyright|Copyright|\(c\))\s*(\d{4})/g);

  const footer = $("footer").text();
  if (footer) agregar(footer, /(20\d{2})/g);

  $("meta").each((_, el) => {
    const content = $(el).attr("content") ?? "";
    agregar(content, /(20\d{2})/g);
  });

  $("[itemprop*=date i]").each((_, el) => {
    const texto = $(el).text() + ($(el).attr("content") ?? "");
    agregar(texto, /(20\d{2})/g);
  });

  return años.length ? Math.max(...años) : null;
}

const IGNORAR_INSTAGRAM = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "shareddata",
  "share",
]);

export async function inspeccionarWeb(url: string | undefined): Promise<WebInfo> {
  const vacio: WebInfo = {
    web_status: "sin_web",
    web_año: null,
    tiene_whatsapp: false,
    instagram_url: "",
    facebook_url: "",
  };

  if (!url) return vacio;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEB_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });

    if (res.status === 403 || res.status === 429) {
      return { ...vacio, web_status: "bloqueada" };
    }
    if (!res.ok) {
      return { ...vacio, web_status: `error_${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const web_año = detectarAño($);
    const tiene_whatsapp = /wa\.me|whatsapp\.com|api\.whatsapp/i.test(html);

    let instagram_url = "";
    let facebook_url = "";
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") ?? "";

      if (!instagram_url && href.includes("instagram.com")) {
        const m = href.match(/instagram\.com\/([^/?#\s"']+)/);
        if (m && !IGNORAR_INSTAGRAM.has(m[1])) {
          instagram_url = `https://instagram.com/${m[1]}`;
        }
      }

      if (!facebook_url && href.includes("facebook.com")) {
        const bloqueado = ["sharer", "share", "dialog", "plugins", "login"].some(
          (x) => href.includes(x),
        );
        if (!bloqueado) facebook_url = href.slice(0, 200);
      }
    });

    return {
      web_status: "activa",
      web_año,
      tiene_whatsapp,
      instagram_url,
      facebook_url,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ...vacio, web_status: "timeout" };
    }
    return { ...vacio, web_status: "error" };
  } finally {
    clearTimeout(timeout);
  }
}
