import Image from "next/image"
import Link from "next/link"

interface GameCardProps {
  title: string
  imageSrc: string
  href: string
}

export default function GameCard({ title, imageSrc, href }: GameCardProps) {
  return (
    <Link href={href} className="game-card block text-center opacity-60">
      <div className="rounded-full overflow-hidden w-24 h-24 md:w-32 md:h-32 mx-auto ">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          width={128}
          height={128}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="mt-2 text-xs md:text-sm uppercase font-bold text-center">{title}</h3>
    </Link>
  )
}

