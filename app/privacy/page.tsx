export default function Privacy() {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-[#1b0b38] via-[#2a0f54] to-[#0b2347] text-white p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-white/80 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
  
          <p className="text-white/90">
            PIRL (Prove In Real Life) is an MVP intended for demonstration and
            testing. We minimize the data we collect and use it only to power the
            app experience.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">What we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90">
            <li>
              <strong>Name (optional):</strong> Stored locally in your browser to
              personalize the home screen.
            </li>
            <li>
              <strong>Progress signals:</strong> Simple check-ins (e.g., step
              counts) to verify mission completion and mint rewards.
            </li>
          </ul>
  
          <h2 className="text-lg font-semibold mt-4">What we don’t collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90">
            <li>No precise location data.</li>
            <li>No payment information in this MVP.</li>
            <li>No advertising identifiers.</li>
          </ul>
  
          <h2 className="text-lg font-semibold mt-4">How we use data</h2>
          <p className="text-white/90">
            Data enables mission progress, reward minting, and anonymous usage
            statistics to improve the product. We do not sell user data.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">COPPA / Child Safety</h2>
          <p className="text-white/90">
            This MVP is being tested by adults or with parental oversight. A
            parent/guardian should supervise use by children and review progress
            logs.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">Contact</h2>
          <p className="text-white/90">
            Questions? Email: <span className="underline">support@pirl.app</span>
            {/* replace with your preferred email */}
          </p>
        </div>
      </main>
    );
  }
  