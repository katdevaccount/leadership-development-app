import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center justify-center mb-8">
      <Image
        src="/kat-logo-grey-bg.png"
        alt="The Leadership Development App"
        width={120}
        height={120}
        className="object-contain"
      />
    </div>
  )
}
