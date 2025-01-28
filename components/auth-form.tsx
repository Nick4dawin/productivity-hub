'use client'

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AuthForm() {
  const [name, setName] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      login(name.trim())
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Productivity Hub</CardTitle>
        <CardDescription>Enter your name to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-purple-600"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            variant="gradient" 
            className="w-full"
            disabled={!name.trim()}
          >
            Get Started
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
