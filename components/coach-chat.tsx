'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send } from 'lucide-react';
import { getCoachResponse, ChatMessage } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

export const CoachChat = ({ onClose }: { onClose: () => void }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hey! I'm Spark, your personal AI coach. ✨\n\nHow can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || !user) return;

        const userMessage = { sender: 'user' as const, text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await getCoachResponse(newMessages);
            const aiMessage = { sender: 'ai' as const, text: res.response };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = { sender: 'ai' as const, text: "Sorry, I'm having a little trouble thinking right now. Please try again in a moment." };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-8 w-96 z-50">
            <GlassCard className="flex flex-col h-[60vh] max-h-[600px] shadow-xl">
                <header className="flex items-center justify-between p-4 border-b border-white/20">
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6">
                            <Image 
                                src="/logo.svg" 
                                alt="Produktiv Logo" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-xl font-bold">AI Coach</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </header>

                <main className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`prose prose-invert px-4 py-2 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-lg bg-gray-700">
                                    <p>Thinking...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                <footer className="p-4 border-t border-white/20">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder={user ? "Ask me anything..." : "Please log in to chat"}
                            className="flex-1"
                            disabled={isLoading || !user}
                        />
                        <Button onClick={handleSend} disabled={isLoading || !user}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </footer>
            </GlassCard>
        </div>
    );
}; 