"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Shield } from "lucide-react"
import { validatePin } from "@/lib/utils"

export default function ClientPinLogin() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validatePin(pin)) {
      setError("Please enter a valid 6-digit PIN")
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Implement actual PIN validation with backend
      // For now, simulate PIN validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock PIN validation - in real app, this would be an API call
      if (pin === "123456") {
        router.push(`/client/${pin}`)
      } else {
        setError("Invalid PIN. Please check with your trainer.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(value)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary-100 rounded-full w-fit">
            <Smartphone className="h-8 w-8 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">Client Access</CardTitle>
          <CardDescription>
            Enter your 6-digit PIN to access your training dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                Your PIN
              </label>
              <Input
                id="pin"
                type="text"
                inputMode="numeric"
                placeholder="••••••"
                value={pin}
                onChange={handlePinChange}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                aria-describedby={error ? "pin-error" : undefined}
              />
              {error && (
                <p id="pin-error" className="text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={pin.length !== 6 || isLoading}
            >
              {isLoading ? "Accessing..." : "Access Dashboard"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Secure Access</p>
                <p className="text-blue-700">
                  Your PIN is provided by your trainer and keeps your personal fitness data secure.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have a PIN?{" "}
              <button className="text-primary-600 hover:underline">
                Contact your trainer
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
