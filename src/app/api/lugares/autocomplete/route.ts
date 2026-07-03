import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const input = new URL(request.url).searchParams.get("input")?.trim();
  if (!input || input.length < 2) {
    return NextResponse.json({ sugerencias: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta GOOGLE_PLACES_KEY" }, { status: 500 });
  }

  const res = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
    body: JSON.stringify({
      input,
      languageCode: "es",
      includedPrimaryTypes: [
        "locality",
        "administrative_area_level_1",
        "administrative_area_level_2",
        "administrative_area_level_3",
        "sublocality",
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Places Autocomplete respondió ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const sugerencias: string[] = (data.suggestions ?? [])
    .map((s: { placePrediction?: { text?: { text?: string } } }) => s.placePrediction?.text?.text)
    .filter((texto: string | undefined): texto is string => Boolean(texto));

  return NextResponse.json({ sugerencias });
}
