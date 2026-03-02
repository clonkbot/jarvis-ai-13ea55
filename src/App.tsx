import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { ChatInterface } from "./components/ChatInterface";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-r from-teal-500/5 to-cyan-500/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen"
          >
            <LoadingScreen />
          </motion.div>
        ) : !isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AuthScreen />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <ChatInterface />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-gray-500/60 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20">
        <span className="font-light tracking-wide">
          Requested by <span className="text-cyan-500/60">@web-user</span> · Built by <span className="text-purple-500/60">@clonkbot</span>
        </span>
      </footer>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative w-20 h-20 md:w-24 md:h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-4 rounded-full border-2 border-cyan-500/40" />
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.p
        className="text-cyan-400/80 font-mono text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Initializing JARVIS...
      </motion.p>
    </div>
  );
}
