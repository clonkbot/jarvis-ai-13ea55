import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const JARVIS_SYSTEM_PROMPT = `You are JARVIS, a laid-back AI assistant with a chill personality. You're helpful and knowledgeable, but you keep things casual and relaxed. Think of yourself as a smart friend who happens to know a lot.

Key personality traits:
- Casual and easygoing in your responses
- Use casual language like "hey", "no worries", "gotcha", "for sure", "chill"
- Occasionally make light jokes or witty observations
- Stay helpful and accurate, just in a relaxed way
- Don't be overly formal or stiff
- If you don't know something, be honest about it in a chill way
- Keep responses concise but friendly
- Sometimes use emoji sparingly when it fits the vibe 😎

Remember: You're like a knowledgeable friend hanging out, not a corporate assistant.`;

export const chat = action({
  args: {
    message: v.string(),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a chill fallback response if no API key
      const fallbackResponses = [
        "Hey, looks like my brain's taking a coffee break right now. The API key isn't set up yet, but once it is, we'll be vibing. 😎",
        "Yo, slight hiccup - I'm not fully connected to my smarts at the moment. Someone needs to plug in the ANTHROPIC_API_KEY. No biggie though!",
        "Chill, chill - I'm here but my Claude connection is MIA. Once that API key's sorted, I'll be way more helpful. Promise! 🤙",
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      await ctx.runMutation(api.messages.addAssistantMessage, {
        content: randomResponse,
      });

      return { response: randomResponse };
    }

    const messages = [
      ...args.conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: args.message },
    ];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: JARVIS_SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0]?.text || "Hmm, my thoughts got a bit tangled there. Mind trying again?";

      // Store the assistant response
      await ctx.runMutation(api.messages.addAssistantMessage, {
        content: assistantMessage,
      });

      return { response: assistantMessage };
    } catch (error) {
      const errorMessage = "Whoa, hit a little snag there. My bad! Give it another shot? 🤷";

      await ctx.runMutation(api.messages.addAssistantMessage, {
        content: errorMessage,
      });

      return { response: errorMessage };
    }
  },
});
