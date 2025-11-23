"use client"

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-bold mb-4">ENS Royalty System</div>
            <p className="text-sm text-muted-foreground">Built for ETHGlobal Hackathon</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition">
                  Twitter/X
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition">
                  Etherscan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Network</h4>
            <p className="text-sm text-muted-foreground">Sepolia Testnet</p>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Transforming ENS names into programmable revenue streams</p>
        </div>
      </div>
    </footer>
  )
}
