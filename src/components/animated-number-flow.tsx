import { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"

export function AnimatedNumberFlow({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setDisplayValue(value)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [value])

  return <NumberFlow value={displayValue} />
}
