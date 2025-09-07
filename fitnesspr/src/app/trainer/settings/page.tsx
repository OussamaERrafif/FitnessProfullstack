import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, Bell, Shield, CreditCard, Palette } from "lucide-react"

export const metadata: Metadata = {
  title: 'Settings | Trainer Dashboard',
  description: 'Manage your account settings and preferences',
}

export default function TrainerSettings() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Settings Categories</CardTitle>
              <CardDescription>Configure your trainer dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security & Privacy
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing & Payments
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <div className="mt-1 p-2 border rounded text-sm">Alex</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <div className="mt-1 p-2 border rounded text-sm">Johnson</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="mt-1 p-2 border rounded text-sm">alex.johnson@email.com</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Professional Title</label>
                  <div className="mt-1 p-2 border rounded text-sm">Certified Personal Trainer</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <div className="mt-1 p-2 border rounded text-sm">Passionate fitness trainer with 5+ years of experience helping clients achieve their health goals.</div>
                </div>
                <Button>Update Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New Client Registrations</p>
                    <p className="text-sm text-gray-600">Get notified when new clients sign up</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Session Reminders</p>
                    <p className="text-sm text-gray-600">Reminders for upcoming sessions</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Payment Notifications</p>
                    <p className="text-sm text-gray-600">Updates on payments and invoices</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-600">Tips and product updates</p>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Data Export</p>
                    <p className="text-sm text-gray-600">Download your account data</p>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-gray-600">Permanently delete your account</p>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
