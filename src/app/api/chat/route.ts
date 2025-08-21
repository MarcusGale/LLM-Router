import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { OpenAI } from "openai";
import { env } from "@/config/env";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
});

const logger = new Logger("ChatRoute");

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        if (!messages || !messages.length) {
            logger.error("No messages provided");
            return new Response(JSON.stringify({ error: "Please enter a message" }), { status: 400 });
        }
        const formattedMessages = messages.map((msg: { content: string }) => ({
            role: "user",
            content: msg.content
        }));

        const modelInfo = await llmRouter(messages[messages.length - 1].content);

        // This is the CRITICAL FIX: Add a system prompt for the main LLM.
        const finalMessages = [
            { role: "system", content: "You are a helpful assistant. Provide direct and concise answers in Markdown format. Avoid any conversational fillers or references to your internal processes. Do not include any form of an object, like '[object Object]' in your response." },
            ...formattedMessages,
        ];

        const response = await openai.chat.completions.create({
            model: modelInfo.model,
            messages: finalMessages, // Pass the new messages array with the system prompt
            max_tokens: 1000, // Reduced max_tokens to avoid 402 error
        });

        const messageContent = response.choices[0].message.content || "";

        // Build Markdown response
        const formattedMarkdown = `
## Model Information

| Property | Value |
|----------|-------|
| Model | ${modelInfo.model} |
| Context | ${modelInfo.specs.context} |
| Latency | ${modelInfo.specs.latency} |
| Throughput | ${modelInfo.specs.throughput} |
| Pricing | ${modelInfo.specs.pricing} |

${modelInfo.explanation}

${messageContent}`;

        // Build HTML/plain-text response
        const formattedHtml = `
<h2>Model Information</h2>
<pre>
Model: ${modelInfo.model}
Context: ${modelInfo.specs.context}
Latency: ${modelInfo.specs.latency}
Throughput: ${modelInfo.specs.throughput}
Pricing: ${modelInfo.specs.pricing}

</pre>
<p>${response.choices[0].message.content}</p>`;

        // Return both formats so your frontend can choose
        return new Response(JSON.stringify({
            message: formattedMarkdown,
            message_markdown: formattedMarkdown,
            message_html: formattedHtml,
            messages: [...formattedMessages, {
                role: "assistant",
                content: response.choices[0].message.content
            }]
        }));
    } catch (error: any) {
        logger.error("API Error", { error: error.message, stack: error.stack });
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}


// in your llmRouter function
async function llmRouter(message: string) {
    try {
        // Your simplified routing prompt
        const routingPrompt =
            `You are an expert at routing a user's message to the best-suited LLM model. Your goal is to identify the most appropriate model based on the complexity and type of the user's request.

        **Available Models:**
        * **anthropic/claude-sonnet-4**: Best for complex and advanced coding tasks.
        * **openai/gpt-5-mini**: Best for non-code tasks requiring advanced reasoning or deep analysis.
        * **openai/gpt-oss-20b**: Best for simple coding tasks and general, non-reasoning questions.

        **Instructions:**
        Analyze the user's message and return ONLY the model name from the list above. Do not include any other text, explanations, or formatting.

        **Examples:**
        User: "Write a full-stack e-commerce API using Node.js and Express."
        Model: anthropic/claude-sonnet-4

        User: "Explain the theory of relativity to a 5-year-old."
        Model: openai/gpt-5-mini

        User: "What is the capital of France?"
        Model: openai/gpt-oss-20b

        User: "Write a Python script to reverse a string."
        Model: openai/gpt-oss-20b

        **Your Task:**
        Route the following message to the best model.
        User: "${message}"
        Model:`;

        const response = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: routingPrompt }],
            max_tokens: 100, // Add a token limit to prevent long, unexpected outputs
        });

        // 1. Sanitize the model name from the LLM
        const selectedModel = (response.choices[0].message.content || "openai/gpt-oss-20b").trim();

        // Your existing modelSpecs object
        const modelSpecs = {
            "openai/gpt-oss-20b": {
                context: "131,072",
                latency: "0.56s",
                throughput: "222.4tps",
                pricing: "Free"
            },
            "anthropic/claude-sonnet-4": {
                context: "200,000",
                latency: "1.80s",
                throughput: "46.41tps",
                pricing: "$3/M input, $15/M output"
            },
            "openai/gpt-5-mini": {
                context: "400,000",
                latency: "4.08s",
                throughput: "55.73tps",
                pricing: "$0.25/M input, $2/M output"
            },
            // The qwen model is not in your routing prompt, so it will never be chosen by the LLM.
            // It's a good practice to include it in the prompt if you want it to be an option.
            "qwen/qwen3-coder": {
                context: "262,000",
                latency: "2.39s",
                throughput: "68tps",
                pricing: '$0.20/M input, $0.80/M output'
            }
        };

        // 2. Implement a robust fallback
        const specs = modelSpecs[selectedModel as keyof typeof modelSpecs] || modelSpecs["openai/gpt-oss-20b"];

        // Use a local explanation or a simple default
        const explanations: Record<string, string> = {
            "anthropic/claude-sonnet-4": "This model was selected for a complex coding task.",
            "openai/gpt-5-mini": "This model was selected for an advanced reasoning task.",
            "openai/gpt-oss-20b": "This model was selected for a simple or general-purpose query.",
            "qwen/qwen3-coder": "This model was selected for a code-related question."
        };

        const explanation = explanations[selectedModel] || "The model was selected based on the user's request.";

        return {
            model: selectedModel,
            specs,
            explanation,
        };
    } catch (error: any) {
        logger.error("LLM Router Error", { error: error.message, stack: error.stack });
        throw error; // Re-throw to be caught by the main handler
    }
}