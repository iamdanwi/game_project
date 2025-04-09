"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Slide {
  id: number
  image_url: string
  status: string
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])

  useEffect(() => {
    // Fetch slider data
    const fetchSlides = async () => {
      try {
        const response = await fetch('https://book2500.funzip.in/api/index')
        const data = await response.json()
        if (data.slider) {
          setSlides(data.slider.filter((slide: Slide) => slide.status === "1"))
        }
      } catch (error) {
        console.error("Error fetching slides:", error)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  // Show loading or return null if no slides
  if (slides.length === 0) {
    return null
  }

  return (
    <div className="hero-slider relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="relative h-full">
            <div className="absolute inset-0">
              <Image
                src={slide.image_url}
                alt={`Slide ${slide.id}`}
                fill
                className="object-cover"
                priority={index === currentSlide}
              />
            </div>
            {/* <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 bg-gradient-to-r from-black/80 to-transparent max-w-[600px]">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">GET UP TO $ 125,000</h1>
              <p className="text-xl md:text-2xl text-white mb-6">Bonus to new Clint's on the first 5 deposited</p>
              <div>
                <Button className="rounded-full bg-brand-red hover:bg-red-700 font-bold">MORE</Button>
              </div>
            </div> */}
          </div>
        </div>
      ))}

      <div className="hero-dots">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

