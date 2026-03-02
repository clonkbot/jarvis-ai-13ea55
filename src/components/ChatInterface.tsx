import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogOut, Trash2, Zap, User, Sparkles, Menu, X } from "lucide-react";

export function ChatInterface() {
  const messages = useQuery(api.messages.list) ?? [];
  const sendMessage = useMutation(api.messages.send);
  const clearMessages = useMutation(api.messages.clear);
  const chatWithJarvis = useAction(api.jarvis.chat);
  const { signOut } = useAuthActions();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      await sendMessage({ content: userMessage });

      const conversationHistory = messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      await chatWithJarvis({
        message: userMessage,
        conversationHistory,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = async () => {
    await clearMessages();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0f]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                JARVIS
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Your chill AI companion</p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={handleClear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => signOut()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 text-gray-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <button
                  onClick={handleClear}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Chat
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto pb-32 md:pb-36">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="space-y-4 md:space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message: Message, index: number) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="fixed bottom-8 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent pt-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-sm opacity-50" />
            <div className="relative flex items-end gap-2 bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask JARVIS anything..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none py-2.5 px-3 max-h-32 text-base"
                style={{ minHeight: "44px" }}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  const suggestions = [
    "What's the weather like in your digital world?",
    "Tell me a fun fact",
    "Help me brainstorm ideas",
    "What can you help me with?",
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="relative mb-6 md:mb-8"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Hey there! 👋</h2>
      <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base">
        I'm JARVIS, your laid-back AI buddy. Ask me anything, I'm here to help... or just chat, whatever you're in the mood for.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 text-left text-gray-300 text-sm hover:bg-white/10 hover:border-cyan-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 mb-2" />
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
        isUser
          ? "bg-gradient-to-br from-purple-500 to-pink-500"
          : "bg-gradient-to-br from-cyan-500 to-blue-600"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
        ) : (
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
        )}
      </div>

      <div className={`max-w-[80%] md:max-w-[75%] ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20"
            : "bg-white/5 border border-white/10"
        }`}>
          <p className="text-white whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
        </div>
        <p className="text-xs text-gray-600 mt-1 px-2">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
