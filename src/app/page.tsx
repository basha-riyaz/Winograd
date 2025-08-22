'use client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white-100 px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/android_logo.png"
              alt="Logo"
              className="h-20 drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 text-orange-500 hover:text-orange-700 transition-colors duration-300">
            WINOGRAD
          </h1>
          <h2 className="text-2xl font-medium mb-4 text-blue-900 hover:text-blue-700 transition-colors duration-300">
            Trust Every Move Your AI Makes
          </h2>
          <p className="text-lg text-slate-950 leading-relaxed mb-1 hover:text-indigo-600 transition-colors duration-300">
            Lightweight, Cloud-Agnostic, Real-Time QA for Smarter Agents.
          </p>
          <p className="text-lg text-slate-950 leading-relaxed hover:text-indigo-600 transition-colors duration-300">
            WINOGRAD gives you confidence in your AI pipelines with zero compromise.
          </p>
        </div>

         <div className="text-center mb-8">
          <h2 className="text-2xl font-medium mb-4 text-blue-900 hover:text-blue-700 transition-colors duration-300">
            About WINOGRAD
          </h2>
          <p className="text-lg text-slate-950 leading-relaxed mb-1 hover:text-indigo-600 transition-colors duration-300">
            The WINOGRAD Schema Challenge is a test of machine intelligence. A contestant must resolve subtle pronoun ambiguities in complex sentences — something easy for humans but challenging for AI. We named our platform "WINOGRAD" because our mission is to build agents that can reason, understand, and respond with human-level intelligence.
          </p>
        </div>

        <div className="flex justify-center mb-20">
          <button
            onClick={() => router.push('/tools')}
            className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-white hover:text-blue-900 rounded-full shadow-lg hover:scale-105 transform transition-all duration-500 hover:from-orange-600 hover:to-yellow-500"
          >
            Try me!
          </button>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 text-center">Features</h2>
          <hr
            style={{
              width: "100px",
              height: "3px",
              backgroundColor: "#1e40af",
              margin: "0 auto 1.5rem auto",
              border: "none",
              borderRadius: "4px",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
            {[
              ['🤖 Multi-Agent Testing', 'Test agent coordination, handoffs, and complex workflows.'],
              ['🎭 Custom Test Personas', 'Frustrated customers, technical experts, non-native speakers.'],
              ['⚙️ Automated Test Generation', 'AI generates hundreds of realistic interactions and failures.'],
              ['📊 Real-time Analytics', 'Track success, response times, and failure patterns.'],
              ['🔌 Easy Integration', 'Connect with all major platforms and custom agents in minutes.'],
            ].map(([title, desc], idx) => (
              <div
                key={idx}
                className="transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  width: "450px",
                  padding: "20px",
                  backgroundColor: "#ecca4e",
                  borderTopLeftRadius: "30px",
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "30px",
                  borderBottomLeftRadius: "0px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                  fontFamily: "Arial, sans-serif",
                  color: "#111827",
                  margin: "10px",
                  cursor: "default",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    margin: "10px 0 6px",
                    fontWeight: "bold",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#4b5563",
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>




        <div className="mb-20">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 text-center">Our Customers</h2>
          <hr style={{ width: "160px", height: "3px", backgroundColor: "#1e40af", margin: "0 auto 1.5rem auto", border: "none", borderRadius: "4px" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Centria',
                description: 'Transcript consolidation and therapy report generation.',
                icon: '📝',
                color: 'bg-orange-100 text-orange-700',
              },
              {
                name: 'Motorola',
                description: 'Dynamic device parameter generation.',
                icon: '📱',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                name: 'Workato',
                description: 'Human resource flow optimization.',
                icon: '👥',
                color: 'bg-green-100 text-green-700',
              },
              {
                name: 'MISC',
                description: 'Sales forecasting.',
                icon: '📊',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                name: 'Grab',
                description: 'Document processing using OCR.',
                icon: '📄',
                color: 'bg-red-100 text-red-700',
              },
            ].map((client, idx) => (
              <div
                key={idx}
                className={`relative rounded-[30px] p-6 shadow-md hover:shadow-xl transition-all duration-300 ${client.color} flex flex-col gap-3`}
                style={{ cursor: "default" }}
              >
                <div className="text-4xl">{client.icon}</div>
                <h3 className="text-lg font-bold">{client.name}</h3>
                <p className="text-sm">{client.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 text-center">FAQs</h2>
          <hr style={{ width: "60px", height: "3px", backgroundColor: "#1e40af", margin: "0 auto 1.5rem auto", border: "none", borderRadius: "4px" }} />

          <div className="w-full max-w-7xl bg-white backdrop-blur-md rounded-xl p-8 mx-auto shadow-md transition-all duration-600 hover:scale-[1.01]">
            {[
              ['How is WINOGRAD different from manual testing?', 'WINOGRAD automates weeks of manual work into minutes, simulating diverse personas, edge cases, and offering reproducible test results.'],
              ['What happens if my agent fails a test?', 'We provide detailed diagnostics, transcript replay, root cause analysis, and performance comparison.'],
              ['Can I create custom test scenarios?', 'Yes, using natural language, you can define user personas, criteria, and import real data.'],
              ['How do you ensure test quality?', 'We use AI trained on millions of conversations and update tests with edge cases, real failures, and compliance needs.'],
              ['What integrations do you support?', 'OpenAI, Anthropic, GitHub, Jenkins, Slack, Datadog, REST APIs and more.']
            ].map(([q, a], i) => (
              <div
                key={i}
                className="mb-4 p-4 rounded-md transition-all duration-300 hover:bg-blue-50 hover:shadow-sm"
                style={{ cursor: "default" }}
              >
                <h4 className="font-semibold text-blue-700 transition-colors duration-200 group-hover:text-blue-900">
                  {q}
                </h4>
                <p className="text-gray-700 mt-2 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-7xl bg-white backdrop-blur-md rounded-xl p-8 mx-auto shadow-md transition-all duration-600 hover:scale-[1.01]">
          <h3 className="text-xl font-semibold mb-4">Contact us</h3>
          <form className="space-y-4">
            <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" />
            <input type="tel" placeholder="Phone" className="w-full px-4 py-2 border rounded" />
            <select className="w-full px-4 py-2 border rounded">
              <option>Select Country</option>
              <option>India</option>
              <option>USA</option>
            </select>
            <div className="flex justify-center mt-6">
              <button
                className="px-8 py-3 text-lg font-semibold bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-800 transition-all duration-200"
              >
               Reserve a slot! 
              </button>
            </div>

            {/* <button type="submit" className="max-3-xl bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-800">Reserve a Slot</button> */}
          </form>
        </div>
      </div>
    </div>
  );
}

