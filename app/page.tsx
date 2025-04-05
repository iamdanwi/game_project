import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSlider from "@/components/ui/hero-slider"
import GameCard from "@/components/ui/game-card"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSlider />

      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-items-center">
            {/* <GameCard title="CRICKET" imageSrc="/games/cricket.svg" href="/cricket" /> */}
            <Link href="/cricket" className="game-card block text-center">
              <div className="rounded-full overflow-hidden w-24 h-24 md:w-32 md:h-32 mx-auto">
                <Image
                  src="/games/cricket.svg"
                  alt="CRICKET"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-2 text-xs md:text-sm uppercase font-bold text-center">CRICKET</h3>
            </Link>
            <GameCard title="AVIATOR" imageSrc="/games/aviator.svg" href="/coming-soon" />
            <GameCard title="DRAGON VS TIGER" imageSrc="/games/dragon.svg" href="/coming-soon" />
            <GameCard title="TEEN PATTI" imageSrc="/games/teenPatti.svg" href="/coming-soon" />
            <GameCard title="MATAKA" imageSrc="/games/mataka.svg" href="/coming-soon" />
            <GameCard title="POKER KING" imageSrc="/games/poker.svg" href="/coming-soon" />
          </div>
        </div>
      </section>

      <section className="py-10 bg-brand-darkPurple">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <Image src="/winner.svg" alt="Winner" width={500} height={500} className="w-full h-auto" />
            </div>

            <div className="md:w-1/2 flex flex-col justify-center">
              <h2 className="text-brand-gold text-2xl md:text-3xl font-bold mb-4">HOW TO PLAY</h2>

              <p className="text-white mb-6">
                Aviator is a crash-style betting game where a plane takes off, and the multiplier increases as it flies.
                Players place bets before takeoff and must cash out before the plane disappears. If they don't cash out
                in time, they lose their bet. The key is to time the cash-out for maximum profit while avoiding a crash.
              </p>

              <Link href="/cricket">
                <Button className="w-full md:w-auto bg-brand-red hover:bg-red-700 text-white font-bold">
                  PLAY NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Link href="/app-download">
              <Button className="bg-transparent border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 font-bold text-xl py-4 px-8 rounded-full flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                DOWNLOAD OUR APP NOW!
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Link href="/cricket">
              <Button className="bg-brand-red hover:bg-red-700 text-white font-bold text-xl py-4 px-8">
                BET NOW & WIN
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

