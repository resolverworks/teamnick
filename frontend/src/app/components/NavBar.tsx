import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { Typography } from '@ensdomains/thorin'

const NavBar = () => {
  return (
    <nav className="flex justify-between  py-8 w-full max-w-xl  my-0 mx-auto  relative min-w-[480px]">
      <div className="flex gap-x-4">
        <Link href="/">
          {' '}
          <Typography font="sans" fontVariant="large">
            Claim Name
          </Typography>
        </Link>
        <Link href="/records">
          <Typography font="sans" fontVariant="large">
            Records
          </Typography>
        </Link>
      </div>
      <div>
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
    </nav>
  )
}

export default NavBar
