'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, X } from 'lucide-react';
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
                {isChatOpen ? <X className="h-8 w-8 text-white" /> : <Sparkles className="h-8 w-8 text-white" />}
            </Button>
            {isChatOpen && <CoachChat onClose={() => setIsChatOpen(false)} />}
        </>
    );
}; 