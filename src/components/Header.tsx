import React from 'react'
import Image from 'next/image'

const Header = () => {
  return (
    <header className="flex items-center">
      <Image className="mr-3" src="/la-mosaique-logo.png" alt="" width={70} height={70} />
      <div>
        <h1 className="font-medium text-3xl">la mosaïque</h1>
        <p className="text-s pl-1"> by mks</p>
      </div>
    </header>
  )
}

export default Header
