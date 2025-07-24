import React, { forwardRef, useCallback } from "react"

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>
  scroll: React.MutableRefObject<number>
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(({ caption, scroll }, ref) => {
  const handleScroll = useCallback((e) => {
    const scrollRatio = e.target.scrollTop / (e.target.scrollHeight - window.innerHeight)
    scroll.current = Math.max(0, Math.min(1, scrollRatio))
    if (caption.current) {
      caption.current.innerText = scroll.current.toFixed(2)
    }
  }, [scroll, caption])

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
    className="scroll">
    <div id="home" style={{ height: "200vh" }}>
      <div className="dot">
        {/* <h1>home</h1> */}
        {/* Virtual reality (VR) is a simulated experience that can be similar to or completely different from the real world. */}
      </div>
    </div>
    <div id="what-we-do" style={{ height: "200vh" }}>
      <div className="dot">
        <h1>what we do</h1>
        Headphones are a pair of small loudspeaker drivers worn on or around the head over a user&apos;s ears.
      </div>
    </div>
    <div id="our-process" style={{ height: "200vh" }}>
      <div className="dot">
        <h1>our process</h1>A rocket (from Italian: rocchetto, lit. &apos;bobbin/spool&apos;)[nb 1][1] is a projectile that spacecraft, aircraft or other vehicle use to obtain thrust from a
        rocket engine.
      </div>
    </div>
    <div id="team" style={{ height: "200vh" }}>
      <div className="dot">
        <h1>team</h1>The minds behind the madness.
      </div>
    </div>
    <div id="our-work" style={{ height: "200vh" }}>
      <div className="dot">
        <h1>our work</h1>A turbine (/ˈtɜːrbaɪn/ or /ˈtɜːrbɪn/) (from the Greek τύρβη, tyrbē, or Latin turbo, meaning vortex)[1][2] is a rotary mechanical device that extracts energy
        from a fluid flow and converts it into useful work.
      </div>
    </div>
    <div id="contact" style={{ height: "200vh" }}>
      <div className="dot">
        <h1>contact</h1>A table is an item of furniture with a flat top and one or more legs, used as a surface for working at, eating from or on which to place things.[1][2]
      </div>
    </div>
    <span className="caption" ref={caption}>
      0.00
    </span>
  </div>
  )
})

Overlay.displayName = 'Overlay'

export default Overlay