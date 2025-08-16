'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { CoachChat } from './coach-chat';

export const CoachButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <>
            <Button
                id="tour-step-7"
                variant="gradient"
                size="lg"
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
                onClick={toggleChat}
            >
                {isChatOpen ? (
                    <ChevronDown className="h-8 w-8 text-white stroke-2" />
                ) : (
                    <span className="text-3xl">✨</span>
                )}
            </Button>
            {isChatOpen && <CoachChat onClose={() => setIsChatOpen(false)} />}
        </>
    );
}; 