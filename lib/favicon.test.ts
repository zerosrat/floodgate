import { describe, expect, it } from "vitest"

import { faviconSvg, UNREAD_DOT_HEX } from "./favicon"
import type { FaviconSpec } from "./pr-status"

const split: FaviconSpec = { left: "green", right: "amber" }
const whole: FaviconSpec = { left: "purple", right: "purple", whole: true }

const circleCount = (svg: string) => svg.match(/<circle /g)?.length ?? 0

describe("faviconSvg unread dot", () => {
  it("omits the dot by default and when unread is false", () => {
    expect(faviconSvg(split)).not.toContain(UNREAD_DOT_HEX)
    expect(circleCount(faviconSvg(split, 64, { unread: false }))).toBe(0)
  })

  it("renders the dot (halo + accent fill) on a split icon when unread", () => {
    const svg = faviconSvg(split, 64, { unread: true })
    expect(svg).toContain(UNREAD_DOT_HEX)
    expect(circleCount(svg)).toBe(2) // white halo + accent fill
  })

  it("renders the dot on a whole (lifecycle) icon too", () => {
    const svg = faviconSvg(whole, 64, { unread: true })
    expect(svg).toContain(UNREAD_DOT_HEX)
    expect(circleCount(svg)).toBe(2)
  })

  it("keeps the dot inside the clip group (matches the clipped canvas)", () => {
    const svg = faviconSvg(split, 64, { unread: true })
    expect(svg.indexOf(UNREAD_DOT_HEX)).toBeLessThan(svg.indexOf("</g>"))
  })

  it("does not drop the + when both unread and plus are set", () => {
    const svg = faviconSvg({ left: "red", right: "green", plus: true }, 64, {
      unread: true
    })
    expect(svg).toContain(UNREAD_DOT_HEX) // dot present
    expect(circleCount(svg)).toBe(2) // dot circles
    // two half rects + two "+" bars still present
    expect(svg.match(/<rect /g)?.length ?? 0).toBeGreaterThanOrEqual(4)
  })
})

describe("faviconSvg status opacity", () => {
  it("applies 50% opacity only to a grey half", () => {
    const svg = faviconSvg({ left: "grey", right: "green" })

    expect(svg).toContain('fill="#8c959f" fill-opacity="0.5"')
    expect(svg).toContain('fill="#2da44e"/>')
    expect(svg.match(/fill-opacity="0.5"/g)).toHaveLength(1)
  })

  it("applies 50% opacity to each grey region independently", () => {
    const splitSvg = faviconSvg({ left: "green", right: "grey" })
    const wholeSvg = faviconSvg({
      left: "grey",
      right: "grey",
      whole: true
    })

    expect(splitSvg.match(/fill-opacity="0.5"/g)).toHaveLength(1)
    expect(wholeSvg.match(/fill-opacity="0.5"/g)).toHaveLength(1)
  })
})
