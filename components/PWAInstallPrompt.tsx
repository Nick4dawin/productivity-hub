'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show the modal if it's a mobile device and the prompt is available
      if (window.matchMedia('(display-mode: standalone)').matches || !/Mobi|Android/i.test(navigator.userAgent)) {
        // If already installed or not mobile, don't show the modal
        return;
      }
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // @ts-ignore
      deferredPrompt.prompt();
      // @ts-ignore
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      return (
        <ul className="list-disc pl-5 space-y-2">
          <li>Tap the Share button <span className="font-bold">(\u21e7)</span> at the bottom of your browser.</li>
          <li>Scroll down and tap <span className="font-bold">'Add to Home Screen'</span>.</li>
          <li>Tap <span className="font-bold">'Add'</span> in the top right corner.</li>
        </ul>
      );
    } else if (isAndroid) {
      return (
        <ul className="list-disc pl-5 space-y-2">
          <li>Tap the menu icon <span className="font-bold">(\u22ee or \u22ee)</span> in your browser (usually top right).</li>
          <li>Tap <span className="font-bold">'Add to Home Screen'</span> or <span className="font-bold">'Install app'</span>.</li>
          <li>Follow the on-screen prompts.</li>
        </ul>
      );
    } else {
      return (
        <p>Please use your browser's "Add to Home Screen" or "Install app" feature.</p>
      );
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install Productivity Hub</DialogTitle>
          <DialogDescription>
            Add this application to your home screen for quick access and a full-screen experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {deferredPrompt ? (
            <Button onClick={handleInstallClick} className="w-full">
              Install App
            </Button>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">Follow these steps to install:</p>
              {getInstallInstructions()}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}