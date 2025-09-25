export default function Terms() {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-[#1b0b38] via-[#2a0f54] to-[#0b2347] text-white p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Terms of Use</h1>
          <p className="text-white/80 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
  
          <p className="text-white/90">
            By accessing or using PIRL (Prove In Real Life), you agree to these
            terms. This MVP is for demonstration and testing only.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">Use of the Service</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90">
            <li>
              You’ll use PIRL for lawful purposes and respect others’ privacy and
              safety.
            </li>
            <li>
              Rewards and features shown may be prototypes and subject to change.
            </li>
          </ul>
  
          <h2 className="text-lg font-semibold mt-4">No Warranty</h2>
          <p className="text-white/90">
            PIRL is provided “as is” without warranties of any kind. We’re not
            liable for any damages arising from use of the MVP.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">Accounts & Minors</h2>
          <p className="text-white/90">
            For the MVP, anonymous sessions may be used. If a child uses PIRL, a
            parent/guardian should supervise and consent to participation.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">Changes</h2>
          <p className="text-white/90">
            We may update these terms. Continued use means you accept the
            changes.
          </p>
  
          <h2 className="text-lg font-semibold mt-4">Contact</h2>
          <p className="text-white/90">
            Questions? Email: <span className="underline">support@pirl.app</span>
          </p>
        </div>
      </main>
    );
  }
  