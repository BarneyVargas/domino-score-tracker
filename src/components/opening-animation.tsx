import { useEffect, useState } from "react"

export function OpeningAnimation() {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setIsExiting(true)
    }, 2200)
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false)
    }, 2600)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/opening_animation.gif"
        alt=""
        className="h-auto w-full max-w-sm drop-shadow-[0_0_32px_rgb(0_0_0/0.9)]"
      />
    </div>
  )
}
