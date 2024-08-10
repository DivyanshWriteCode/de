import Image from 'next/image'
import React from 'react'
import ActiveUsers from './users/ActiveUsers'

const Navbar = () => {
  return (
    <nav className='flex select-none items-center justify-between gap-4 bg-[#141720] px-5 text-white'>
      <Image src='/assets/logo.svg' width={58} height={20} alt='FigPro Logo'/>
      <ActiveUsers/>
    </nav>
  )
}

export default Navbar
