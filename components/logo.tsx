"use client";

import { useState } from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const textSizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl'
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {!imageError ? (
                <img
                    src="public/LifeOSlogo.png"
                    alt="Life OS Logo"
                    className={`${sizeClasses[size]} object-contain`}
                    onError={() => setImageError(true)}
                />
            ) : (
                // Fallback: Simple colored circle with "L" text
                <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
                    L
                </div>
            )}
            {showText && (
                <span className={`font-bold ${textSizeClasses[size]}`}>Life OS</span>
            )}
        </div>
    );
}