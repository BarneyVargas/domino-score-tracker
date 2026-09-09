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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-sm">
        <img
          src="/opening_animation.gif"
          alt=""
          className="h-auto w-full dark:mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-linear-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] bg-linear-to-l from-background to-transparent" />
      </div>
    </div>
  )
}
