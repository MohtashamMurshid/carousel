import { describe, expect, it } from "vitest";
import { parseSearch, serializeSearch } from "./codec";
import { decodeDeck, encodeDeck, expandFrames, frameCount, normalizePayload } from "./lib";

const SAMPLE =
  "d=eyJwIjoyLCJoIjoiQHlvdXJoYW5kbGUiLCJzIjpbeyJrIjoiY292ZXIiLCJjIjoiSW50ZXJmYWNlIHRlYXJkb3duIiwidCI6IlRoaXMgZGFzaGJvYXJkIGZpdHMgb24gb25lIHNjcmVlbi4gU3dpcGUgYWNyb3NzIGl0LiIsImIiOiJUd28gc2xpY2VzLCBsZWZ0IHRvIHJpZ2h0IOKAlCB0aGVuIHRoZSB3aG9sZSBib2FyZC4ifSx7ImsiOiJwYW4ifSx7ImsiOiJvdmVydmlldyIsImMiOiJBbGwgb2YgaXQiLCJ0IjoiT25lIHNjcmVlbiwgZW5kIHRvIGVuZCIsImIiOiJTdHJpcCwgaGVybyBwbG90LCB0YWJsZS4gTm90aGluZyBiZWxvdyB0aGUgZm9sZC4ifSx7ImsiOiJjbG9zZXVwIiwiZiI6InRsIiwiYyI6IlRvcCBsZWZ0IiwidCI6IlRoZSBzdHJpcCB0aGUgcGFnZSBvcGVucyB3aXRoIn0seyJrIjoiY3RhIiwidCI6IlNhdmUgdGhpcyBmb3IgeW91ciBuZXh0IGRhc2hib2FyZCIsImIiOiJGb2xsb3cgZm9yIHRlYXJkb3ducyBvZiB0aGUgaW50ZXJmYWNlcyB5b3UgdXNlIGV2ZXJ5IGRheS4ifV19&recipe=wide-pan&style=liquid&kpi=ring&panel=outline&inset=16&kpis=3&slots=kpi-leads,kpi-conversion-rate,kpi-deals-won,revenue-over-time,table-rows&plane=img-23&frame=ig-square&res=2&pad=24&gap=24&fill=0.8&chart=%23475569&ink=scrim&scrim=62&scrimh=68&shadow=45&shadowb=24&mode=dark&flow=false&nums=true&dots=true&arrow=true&safe=false";

describe("sample share URL", () => {
  it("rebuilds the five-slide wide-pan deck", () => {
    const state = parseSearch(SAMPLE);
    expect(state.recipe).toBe("wide-pan");
    expect(state.payload.p).toBe(2);
    expect(state.payload.h).toBe("@yourhandle");
    expect(state.payload.s.map((slide) => slide.k)).toEqual([
      "cover",
      "pan",
      "overview",
      "closeup",
      "cta",
    ]);
    expect(state.payload.s[0]?.c).toBe("Interface teardown");
    expect(state.payload.s[0]?.t).toBe("This dashboard fits on one screen. Swipe across it.");
    expect(state.payload.s[3]?.f).toBe("tl");
    expect(state.style).toBe("liquid");
    expect(state.kpi).toBe("ring");
    expect(state.panel).toBe("outline");
    expect(state.plane).toBe("img-23");
    expect(state.frame).toBe("ig-square");
    expect(state.slots).toEqual([
      "kpi-leads",
      "kpi-conversion-rate",
      "kpi-deals-won",
      "revenue-over-time",
      "table-rows",
    ]);
    expect(expandFrames(state)).toHaveLength(6);
  });

  it("round-trips the deck payload", () => {
    const state = parseSearch(SAMPLE);
    const encoded = encodeDeck(state.payload);
    const again = decodeDeck(encoded);
    expect(again).toEqual(state.payload);
    const qs = serializeSearch(state);
    const back = parseSearch(qs);
    expect(back.payload).toEqual(state.payload);
    expect(back.plane).toBe("img-23");
    expect(back.style).toBe("liquid");
  });
});

describe("normalize", () => {
  it("drops unknown kinds and empty decks become a cover", () => {
    const next = normalizePayload({
      p: 0,
      s: [{ k: "nope" as never }, { k: "cover", t: "Hi" }],
    });
    expect(next.s.map((slide) => slide.k)).toEqual(["cover"]);
    expect(normalizePayload({ p: 0, s: [] }).s).toEqual([{ k: "cover" }]);
  });

  it("keeps one pan and caps frames at 10", () => {
    const next = normalizePayload({
      p: 4,
      s: [
        { k: "cover" },
        { k: "pan" },
        { k: "pan" },
        { k: "point" },
        { k: "point" },
        { k: "point" },
        { k: "point" },
        { k: "point" },
        { k: "point" },
        { k: "cta" },
      ],
    });
    expect(next.s.filter((slide) => slide.k === "pan")).toHaveLength(1);
    expect(frameCount(next)).toBeLessThanOrEqual(10);
  });

  it("accepts 3x resolution and center close-up", () => {
    const state = parseSearch("res=3&fill=1");
    expect(state.res).toBe(3);
    expect(state.fill).toBe(1);
    expect(decodeDeck(encodeDeck({ p: 0, s: [{ k: "closeup", f: "center" }] }))?.s[0]?.f).toBe("center");
  });

  it("reads 1/0 bools", () => {
    const state = parseSearch("flow=1&nums=0&dots=true&arrow=false");
    expect(state.flow).toBe(true);
    expect(state.nums).toBe(false);
    expect(state.dots).toBe(true);
    expect(state.arrow).toBe(false);
  });
});
