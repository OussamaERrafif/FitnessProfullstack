import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Download, TrendingUp, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Payments | Trainer Dashboard',
  description: 'Manage payments, invoices and financial reports',
}

// Mock payment data
const mockPayments = [
  {
    id: "inv_001",
    clientName: "Sarah Johnson",
    amount: 150,
    status: "paid",
    dueDate: "2025-09-01",
    paidDate: "2025-08-30",
    service: "Personal Training Package (4 sessions)",
    method: "Credit Card"
  },
  {
    id: "inv_002", 
    clientName: "Mike Chen",
    amount: 200,
    status: "pending",
    dueDate: "2025-09-10",
    paidDate: null,
    service: "Nutrition Consultation + Meal Plan",
    method: null
  },
  {
    id: "inv_003",
    clientName: "Emily Davis", 
    amount: 120,
    status: "overdue",
    dueDate: "2025-08-25",
    paidDate: null,
    service: "Group Training (Monthly)",
    method: null
  },
  {
    id: "inv_004",
    clientName: "David Wilson",
    amount: 180,
    status: "paid",
    dueDate: "2025-09-05",
    paidDate: "2025-09-03",
    service: "Personal Training + Nutrition",
    method: "Bank Transfer"
  }
]

const mockStats = {
  monthlyRevenue: 3200,
  pendingPayments: 850,
  overdueAmount: 340,
  totalClients: 24
}

export default function TrainerPayments() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
            <p className="text-gray-600 mt-1">Manage invoices, payments and financial reports</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/payments/export">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/payments/new-invoice">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              3 invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${mockStats.overdueAmount}</div>
            <p className="text-xs text-muted-foreground">
              1 invoice overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              On-time payment rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices & Payments</CardTitle>
          <CardDescription>Track payment status and client billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPayments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{payment.clientName}</h4>
                    <Badge 
                      variant={
                        payment.status === 'paid' ? 'default' :
                        payment.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{payment.service}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Invoice: {payment.id}</span>
                    <span>Due: {payment.dueDate}</span>
                    {payment.paidDate && <span>Paid: {payment.paidDate}</span>}
                    {payment.method && <span>Method: {payment.method}</span>}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${payment.amount}
                  </div>
                  <div className="space-x-2 mt-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    {payment.status !== 'paid' && (
                      <Button size="sm">
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline">
              View All Invoices
            </Button>
            <Button variant="outline">
              Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Settings */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Configure how clients can pay you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Credit/Debit Cards</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Direct bank payments</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-gray-600">PayPal payments</p>
                  </div>
                </div>
                <Badge variant="secondary">Setup Required</Badge>
              </div>
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              Configure Payment Methods
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Templates</CardTitle>
            <CardDescription>Customize your invoice appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-2">Professional Template</h4>
                <p className="text-sm text-gray-600 mb-3">Clean and professional invoice design</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Preview</Button>
                  <Button size="sm">Use Template</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-2">Fitness Themed</h4>
                <p className="text-sm text-gray-600 mb-3">Fitness-focused design with your branding</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Preview</Button>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              Create Custom Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
