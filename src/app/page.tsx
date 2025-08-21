'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {LoaderDots} from '@/components/ui/loader-dots'
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";

interface ChatMessage {
    id: number
    sender: 'user' | 'bot'
    text: string
}

const BotMessage = React.memo(({message}: { message: string }) => {
    return (
        <div className="prose prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    table: ({children}) => (
                        <table className="w-full border-collapse border border-gray-700">
                            {children}
                        </table>
                    ),
                    th: ({children}) => (
                        <th className="border border-gray-700 bg-gray-800 px-2 py-1">
                            {children}
                        </th>
                    ),
                    td: ({children}) => (
                        <td className="border border-gray-700 px-2 py-1">
                            {children}
                        </td>
                    ),
                    p: ({children}) => (
                        <AnimatedText text={String(children)}/>
                    ),
                }}
            >
                {message}
            </ReactMarkdown>
        </div>
    );
});

interface AnimatedTextProps {
    text: string
    speed?: number // ms per character
}

const AnimatedText = React.memo(({text, speed = 5}: AnimatedTextProps) => {
    const [displayed, setDisplayed] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (isComplete) return

        let i = 0
        let timeoutId: NodeJS.Timeout

        function showNext() {
            if (i <= text.length) {
                setDisplayed(text.slice(0, i))
                i += 1
                timeoutId = setTimeout(showNext, speed)
            } else {
                setIsComplete(true)
            }
        }

        showNext()
        return () => {
            clearTimeout(timeoutId)
        }
    }, [text, speed, isComplete])

    useEffect(() => {
        setIsComplete(false)
        setDisplayed('')
    }, [text])

    return <span>{displayed}</span>

});
// All imports and other code remain the same...

export function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [hasError, setHasError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setHasError(false);
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim()) {
            setHasError(true);
            return;
        }

        setIsSending(true);
        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: input
        };
        setMessages(msgs => [...msgs, userMessage]);
        setInput('');

        const messagesContainer = document.querySelector('.overflow-y-auto');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ content: userMessage.text }] })
            })

            const text = await res.text()
            let data: ChatResponse

            if (text) {
                try {
                    data = JSON.parse(text) as ChatResponse
                } catch (parseError) {
                    console.error('Failed to parse JSON', parseError)
                    setHasError(true)
                    return
                }
            } else {
                console.error('Empty response from /api/chat')
                setHasError(true)
                return
            }

            if (data.message_markdown) {
                const botMessage: ChatMessage = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: data.message_markdown
                }
                setMessages(msgs => [...msgs, botMessage])
            } else {
                setHasError(true)
            }
        } catch (err) {
            console.error(err)
            setHasError(true)
        }

        setIsSending(false)
    }, [input]);

    function handleKeyDown (e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleSendMessage();
    }

    return (
        // The rest of your JSX remains unchanged...
        <main
            className='min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900 via-red-800 to-black'>
            <h1 className='text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text'>
                Your Own LLM Router
            </h1>
            <p className='text-xl text-gray-300 mb-8'>
                Name your request and the best LLM will be chosen for you
            </p>
            <div
                className='w-full max-w-2xl border rounded-lg shadow-lg h-[800px] bg-gradient-to-br from-red-900 via-red-800 to-black flex flex-col'>
                <style jsx global>{`
                    .prose pre {
                        background: #1a1a1a;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                    }
                    .prose code {
                        color: #e5e7eb;
                    }
                    .prose h1, .prose h2, .prose h3, .prose h4 {
                        color: #e5e7eb;
                    }
                    .prose p, .prose li {
                        color: #e5e7eb;
                    }
                    .prose table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1em 0;
                    }
                    .prose th, .prose td {
                        border: 1px solid #4a5568;
                        padding: 0.5rem;
                        color: #e5e7eb;
                    }
                    .prose th {
                        background-color: #1a1a1a;
                    }
                `}</style>
                <section className='flex-1 overflow-y-auto p-4 flex flex-col gap-3' style={{scrollBehavior: 'smooth'}}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`max-w-[70%] px-4 py-2 rounded-2xl break-words ${
                                msg.sender === 'user'
                                    ? 'self-end bg-red-700 text-white'
                                    : 'self-start bg-black text-white'
                            }`}
                            aria-live='polite'
                        >
                            {msg.sender === 'bot' ? (
                                <BotMessage message={msg.text}/>
                            ) : msg.text}
                        </div>
                    ))}
                    {isSending && (
                        <div className="self-start bg-black text-white px-4 py-2 rounded-2xl">
                            <LoaderDots/>
                        </div>
                    )}
                </section>
                <section className='border-t p-3 bg-gray-900'>
                    <form
                        className='flex gap-2'
                        onSubmit={e => {
                            e.preventDefault()
                            handleSendMessage()
                        }}
                        aria-label='Chat input form'
                    >
                        <input
                            ref={inputRef}
                            type='text'
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder='Type your message...'
                            className={`flex-1 px-3 py-2 rounded-lg border text-base outline-none bg-gray-800 text-white ${
                                hasError ? 'border-red-500' : 'border-gray-700'
                            }`}
                            aria-invalid={hasError}
                            aria-describedby={hasError ? 'chat-input-error' : undefined}
                            disabled={isSending}
                        />
                        <Button
                            type='submit'
                            disabled={isSending}
                            aria-label='Send message'
                            className='bg-red-700 hover:bg-red-800 text-white'
                        >
                            {isSending ? <LoaderDots/> : 'Send'}
                        </Button>
                        {hasError && (
                            <span
                                id='chat-input-error'
                                className='text-red-500 text-sm ml-2'
                                role='alert'
                            >
              Please enter a message
            </span>
                        )}
                    </form>
                </section>
            </div>
        </main>
    )
}
//...
export default ChatPage