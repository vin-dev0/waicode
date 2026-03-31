"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      router.push("/auth/signin");
    } else {
      alert("Error signing up");
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#010409]">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0d1117]/60 to-[#010409]/90"></div>
        <img 
          src="/hero-isometric.png" 
          alt="Coding illustration"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-16 left-12 z-20 max-w-lg pr-8 text-left">
           <h1 className="text-5xl font-black text-white mb-6 tracking-tighter leading-tight">Start building <br/><span className="text-gh-blue">the future.</span></h1>
           <p className="text-lg text-gray-300 font-medium leading-relaxed opacity-90">Create your account and join millions of developers building the future of software on the world's most modular Git platform.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 xl:px-48 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gh-blue text-white mb-6">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                   <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                </svg>
             </div>
             <h2 className="text-3xl font-extrabold text-fg tracking-tight">Create your account</h2>
             <p className="text-gh-gray mt-2 font-medium">Be part of the next generation of developers.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-fg mb-1.5 block ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-canvas border border-border-subtle rounded-lg text-fg focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue outline-none transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-fg mb-1.5 block ml-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-canvas border border-border-subtle rounded-lg text-fg focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue outline-none transition-all placeholder:text-gray-400"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-fg mb-1.5 block ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-canvas border border-border-subtle rounded-lg text-fg focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent font-bold rounded-lg text-white bg-gh-blue hover:opacity-90 focus:outline-none transition-all shadow-lg shadow-gh-blue/20"
              >
                Sign up
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm mt-8">
               <span className="text-gh-gray text-center w-full">Already have an account? <a href="/auth/signin" className="text-gh-blue font-bold hover:underline">
                 Sign in instead
               </a></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}