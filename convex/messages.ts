import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Store user message
    await ctx.db.insert("messages", {
      userId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const addAssistantMessage = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("messages", {
      userId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { success: true };
  },
});
