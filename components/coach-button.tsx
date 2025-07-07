'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { CoachChat } from './coach-chat';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export const CoachButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const pathname = usePathname();
    
    // Don't render on authentication pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <>
            <Button
                id="tour-step-7"
                variant="gradient"
                size="lg"
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50 flex items-center justify-center"
                onClick={toggleChat}
            >
                {isChatOpen ? (
                    <X className="h-8 w-8 text-white" />
                ) : (
                    <Image 
                        src="/logo.svg" 
                        alt="Produktiv Logo" 
                        width={36}
                        height={36}
                        className="object-contain"
                        priority
                    />
                )}
            </Button>
            {isChatOpen && <CoachChat onClose={() => setIsChatOpen(false)} />}
        </>
    );
}; 