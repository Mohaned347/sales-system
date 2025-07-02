"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className={cn(
          "bg-primary/80 text-primary-foreground hover:bg-primary backdrop-blur-sm transition-opacity hover:opacity-100",
          isVisible ? "opacity-100" : "opacity-0",
          "h-12 w-12 rounded-full shadow-lg"
        )}
        aria-label="العودة إلى الأعلى"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  )
}
