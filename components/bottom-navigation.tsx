"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MessageCircle, PenTool, BarChart3, Camera, Sparkles } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeView, setActiveView] = useState('dashboard')

  // Update active view based on current pathname
  useEffect(() => {
    if (pathname.includes('/journal')) {
      setActiveView('journal')
    } else if (pathname.includes('/media')) {
      setActiveView('media')
    } else if (pathname === '/') {
      setActiveView('dashboard')
    } else {
      setActiveView('dashboard')
    }
  }, [pathname])

  const handleChatClick = () => {
    // Trigger the existing coach button
    const coachButton = document.querySelector('#tour-step-7') as HTMLButtonElement
    if (coachButton) {
      coachButton.click()
    }
  }

  const handleNavigation = (view: string) => {
    switch (view) {
      case 'journal':
        router.push('/journal')
        break
      case 'media':
        router.push('/media')
        break
      case 'dashboard':
        router.push('/')
        break
      default:
        router.push('/')
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-white/10 z-40 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-3">
        {/* Chat with AI */}
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
            activeView === 'chat' 
              ? 'bg-white/20 text-white scale-110' 
              : 'text-white/60 hover:text-white/80 hover:bg-white/10 hover:scale-105'
          }`}
          onClick={handleChatClick}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" strokeWidth={2} />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-blue-400" />
          </div>
        </button>

        {/* New Journal Entry */}
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
            activeView === 'journal' 
              ? 'bg-white/20 text-white scale-110' 
              : 'text-white/60 hover:text-white/80 hover:bg-white/10 hover:scale-105'
          }`}
          onClick={() => handleNavigation('journal')}
        >
          <PenTool className="w-6 h-6" strokeWidth={2} />
        </button>

        {/* Dashboard */}
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
            activeView === 'dashboard' 
              ? 'bg-white/20 text-white scale-110' 
              : 'text-white/60 hover:text-white/80 hover:bg-white/10 hover:scale-105'
          }`}
          onClick={() => handleNavigation('dashboard')}
        >
          <BarChart3 className="w-6 h-6" strokeWidth={2} />
        </button>

        {/* Media */}
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
            activeView === 'media' 
              ? 'bg-white/20 text-white scale-110' 
              : 'text-white/60 hover:text-white/80 hover:bg-white/10 hover:scale-105'
          }`}
          onClick={() => handleNavigation('media')}
        >
          <Camera className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}