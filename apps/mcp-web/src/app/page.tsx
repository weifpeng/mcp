import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Wallet MCP</h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">
          The Simplest Way to Interact with Blockchain via Claude
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/explore">Start Exploring</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/marketplace">View Examples</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Securely connect your crypto wallet, supporting both Solana and
                EVM networks. Make transactions without leaving Claude.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sign Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Easily sign and send transactions with Claude guiding you
                through each step, ensuring security and transparency.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Seamlessly integrate with other MCP capabilities to perform various
                blockchain operations, from token swaps to NFT minting and DeFi interactions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Claude Configuration Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          How to Configure Claude
        </h2>
        <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Download Claude for Desktop
                </h3>
                <p className="text-gray-600">
                  Start by downloading Claude for Desktop, choosing either macOS
                  or Windows. If you already have Claude for Desktop, make sure
                  it's on the latest version by clicking on the Claude menu on
                  your computer and selecting "Check for Updates…"
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Configure the Wallet MCP Server
                </h3>
                <p className="text-gray-600">
                  Open the Claude menu on your computer and select "Settings…"
                  Then click on "Developer" in the left-hand bar and click "Edit
                  Config". This will open your configuration file. Add the
                  Wallet MCP server configuration to the file:
                </p>
                <div className="bg-slate-900 text-slate-50 p-4 rounded-md mt-3 font-mono text-sm overflow-auto">
                  {`{
  "mcpServers": {
    "wallet-mcp": {
      "command": "npx",
      "args": [
        "wallet-mcp"
      ]
    }
  }
}`}
                </div>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Restart Claude</h3>
                <p className="text-gray-600">
                  After updating your configuration file, restart Claude for
                  Desktop. Upon restarting, you should see a hammer icon in the
                  bottom right corner of the input box. After clicking on it,
                  you should see the wallet tools available.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Try it out!</h3>
                <p className="text-gray-600">
                  You can now talk to Claude and ask it to interact with your
                  wallet. As needed, Claude will call the relevant tools and
                  seek your approval before taking any blockchain action.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Troubleshooting</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">
                  Server not showing up in Claude / hammer icon missing
                </h4>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Restart Claude for Desktop completely</li>
                  <li>Check your configuration file syntax</li>
                  <li>Make sure Node.js is installed on your computer</li>
                  <li>
                    Try manually running the server to see if you get any errors
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-1">
                  Tool calls failing silently
                </h4>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Check Claude's logs for errors</li>
                  <li>Verify your server runs without errors</li>
                  <li>Try restarting Claude for Desktop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Commands Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">
          Example Commands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-mono text-sm">
                  Please help me create a Solana token named "MyToken" with an
                  initial supply of 10000
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-mono text-sm">
                  Please help me send 0.01 SOL to address ABC123...
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-mono text-sm">Check my wallet balance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-mono text-sm">
                  Please help me sign the message "Verify my identity"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
