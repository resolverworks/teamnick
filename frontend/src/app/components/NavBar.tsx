import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavBar = () => {
  const pathname = usePathname()
  return (
    <nav className="flex justify-between px-2 py-8 w-full max-w-xl  my-0 mx-auto  relative min-w-[360px]">
      <div className="flex gap-x-4 font-sans text-lg text-gray-700  font-bold">
        <Link className={pathname === '/' ? 'text-blue-500' : ''} href="/">
          {' '}
          Mint
        </Link>
        <Link
          className={pathname === '/records' ? 'text-blue-500' : ''}
          href="/records"
        >
          Records
        </Link>
      </div>
      <div>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    </nav>
  )
}

export default NavBar
