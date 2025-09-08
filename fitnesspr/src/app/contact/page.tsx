import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Headphones
} from "lucide-react"

export default function ContactPage() {
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
                FitnessPr
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/trainer/dashboard">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/demo">Try Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Headphones className="w-4 h-4 mr-2" />
            Talk to Sales
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Let's discuss how FitnessPr can transform your business
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our fitness industry experts are ready to show you how FitnessPr can streamline your operations and accelerate growth.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="p-8">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Schedule a Personal Demo</CardTitle>
                  <CardDescription className="text-base">
                    Get a customized walkthrough tailored to your specific needs and business size.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input placeholder="John" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input placeholder="Doe" required />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Email *
                      </label>
                      <Input type="email" placeholder="john@fitnesscompany.com" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <Input placeholder="Your Fitness Studio" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Active Clients
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select range</option>
                        <option value="1-25">1-25 clients</option>
                        <option value="26-50">26-50 clients</option>
                        <option value="51-100">51-100 clients</option>
                        <option value="101-250">101-250 clients</option>
                        <option value="250+">250+ clients</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What interests you most about FitnessPr?
                      </label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Tell us about your current challenges and what you're looking for in a fitness management platform..."
                      />
                    </div>
                    
                    <Button className="w-full text-lg py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Demo Call
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info & Benefits */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Other ways to connect</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Call Sales</div>
                      <div className="text-gray-600">+1 (555) 123-4567</div>
                      <div className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email Sales</div>
                      <div className="text-gray-600">sales@fitnesspr.com</div>
                      <div className="text-sm text-gray-500">Response within 2 hours</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Live Chat</div>
                      <div className="text-gray-600">Chat with our team</div>
                      <div className="text-sm text-gray-500">Available 24/7</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">What to expect from your demo</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Personalized walkthrough</div>
                      <div className="text-sm text-gray-600">Tailored to your business size and specific needs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">ROI calculation</div>
                      <div className="text-sm text-gray-600">See potential time and cost savings for your business</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Implementation planning</div>
                      <div className="text-sm text-gray-600">Custom onboarding timeline and migration strategy</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Q&A session</div>
                      <div className="text-sm text-gray-600">Get answers to all your questions from our experts</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">30-45 minutes</div>
                      <div className="text-sm text-gray-600">Focused, efficient demonstration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise Features */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Enterprise & Studio Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-gray-600 mb-4">
                    Looking for multi-trainer, franchise, or studio management? 
                    We offer specialized enterprise solutions with:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• White-label customization</li>
                    <li>• Advanced analytics and reporting</li>
                    <li>• Multi-location management</li>
                    <li>• Custom integrations and API access</li>
                    <li>• Dedicated account management</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-50">
                    Learn About Enterprise
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join thousands of fitness professionals
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by leading trainers, studios, and gyms worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Trainers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
