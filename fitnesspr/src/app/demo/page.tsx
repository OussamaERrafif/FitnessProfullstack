import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  Users, 
  BarChart3, 
  Smartphone,
  CheckCircle,
  Clock,
  Star
} from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitnessPr Demo
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/trainer/dashboard">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Play className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Experience FitnessPr in Action
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our platform with real data and see how FitnessPr can transform your fitness business.
          </p>
        </div>
      </section>

      {/* Demo Options */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Video Demo */}
            <Card className="p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Guided Video Tour</h3>
                <p className="text-gray-600 mb-6">
                  Watch a 5-minute walkthrough of FitnessPr's key features narrated by our product team.
                </p>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Demo Video</p>
                      <p className="text-sm text-gray-400">5:32 duration</p>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo Video
                </Button>
              </div>
            </Card>

            {/* Interactive Sandbox */}
            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Interactive Demo</h3>
                <p className="text-gray-600 mb-6">
                  Get hands-on experience with a fully functional demo account pre-loaded with sample data.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    10 sample clients with complete profiles
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Pre-built training programs and meal plans
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sample progress data and analytics
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    60-minute session (auto-reset)
                  </div>
                </div>
                <Button size="lg" variant="outline" className="w-full border-2">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Launch Interactive Demo
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What you'll explore in the demo
            </h2>
            <p className="text-xl text-gray-600">
              Get a comprehensive look at how FitnessPr works for both trainers and clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Client Management</h3>
              <p className="text-sm text-gray-600">
                See how to create profiles, set goals, and track client progress
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Program Builder</h3>
              <p className="text-sm text-gray-600">
                Watch AI generate personalized training and nutrition plans
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-600">
                Explore comprehensive reporting and business insights
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Client PIN Access</h3>
              <p className="text-sm text-gray-600">
                Experience the simple PIN-based client portal
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl p-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 mb-6">
              "The demo sold me instantly. I could see exactly how FitnessPr would streamline my business 
              and improve my client relationships. The PIN access feature is absolutely brilliant."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                MR
              </div>
              <div>
                <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                <div className="text-gray-500">Personal Trainer, Austin, TX</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your 14-day free trial and experience the difference FitnessPr can make.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50" asChild>
            <Link href="/auth/signup">
              Start Your Free Trial
            </Link>
          </Button>
          <p className="text-sm text-blue-200 mt-4">
            No credit card required • Full access to all features
          </p>
        </div>
      </section>
    </div>
  )
}
