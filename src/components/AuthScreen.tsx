import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, User, Lock, ArrowRight, Sparkles } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials. Try again?" : "Couldn't create account. Email might be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Couldn't sign in as guest. Give it another shot?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo and title */}
        <motion.div
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative inline-block mb-4">
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
                animate={{ y: ["100%", "-100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a0a0f]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            JARVIS
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Your chill AI companion</p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 rounded-2xl blur-sm opacity-50" />

          <div className="relative bg-[#12121a]/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/5">
            {/* Toggle */}
            <div className="flex bg-[#1a1a24] rounded-xl p-1 mb-6">
              {(["signIn", "signUp"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFlow(f); setError(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    flow === f
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f === "signIn" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full bg-[#1a1a24] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-base"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    className="w-full bg-[#1a1a24] border border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <input name="flow" type="hidden" value={flow} />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {flow === "signIn" ? "Let's Go" : "Create Account"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-gray-500 text-xs uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Guest login */}
            <motion.button
              onClick={handleAnonymous}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-[#1a1a24] border border-white/10 rounded-xl font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              Continue as Guest
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className="text-center text-gray-500 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By continuing, you agree to vibe with JARVIS responsibly ✌️
        </motion.p>
      </motion.div>
    </div>
  );
}
