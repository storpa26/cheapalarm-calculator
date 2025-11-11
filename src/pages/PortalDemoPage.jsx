import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  Home,
  Image as ImageIcon,
  Mail,
  MapPin,
  Trash2,
  Upload,
  User,
  UserPlus
} from 'lucide-react'
import { Badge } from '../shared/ui/badge'
import { Button } from '../shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card'
import { Progress } from '../shared/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui/tabs'

const quotes = [
  { id: 'CA-001', status: 'Sent', date: '2025-04-08', amount: '$1,543', items: 3 },
  { id: 'CA-002', status: 'Draft', date: '2025-04-09', amount: '$2,120', items: 5 },
  { id: 'CA-003', status: 'Accepted', date: '2025-04-02', amount: '$899', items: 2 }
]

const tasks = [
  { id: 1, title: 'Upload 3 site photos', complete: false, priority: 'high' },
  { id: 2, title: 'Confirm installation date', complete: false, priority: 'medium' },
  { id: 3, title: 'Sign service agreement', complete: true, priority: 'low' }
]

const uploads = [
  { id: 1, name: 'Front door' },
  { id: 2, name: 'Warehouse interior' },
  { id: 3, name: 'Electrical panel' },
  { id: 4, name: 'Rear exit' }
]

const documents = [
  { name: 'Quote CA-001.pdf', type: 'Quote', date: '2025-04-08' },
  { name: 'Invoice CA-003.pdf', type: 'Invoice', date: '2025-04-02' },
  { name: 'Compliance Certificate.pdf', type: 'Compliance', date: '2025-03-28' }
]

const timeline = [
  { event: 'Installation scheduled', detail: 'Apr 16, 2025 · 10:30 AM', accent: 'upcoming', icon: Calendar },
  { event: 'Quote CA-001 accepted', detail: 'Apr 10, 2025', accent: 'complete', icon: CheckCircle2 },
  { event: 'Photos uploaded', detail: 'Apr 08, 2025', accent: 'complete', icon: Upload },
  { event: 'Quote CA-001 created', detail: 'Apr 05, 2025', accent: 'complete', icon: FileText }
]

const accessList = [
  { initials: 'AJ', name: 'Alex Johnson', email: 'alex@example.com', state: 'primary' },
  { initials: 'SM', name: 'Sarah Martin', email: 'sarah@example.com', state: 'invited' },
  { initials: 'MC', name: 'Mike Chen', email: 'mike@example.com', state: 'active' }
]

const statusBadgeClass = (status) => {
  if (status === 'Accepted') return 'bg-primary text-primary-foreground'
  if (status === 'Sent') return 'bg-emerald-100 text-emerald-700'
  return 'bg-muted text-muted-foreground'
}

const priorityBadgeClass = (priority) => {
  if (priority === 'high') return 'border-primary text-primary'
  if (priority === 'medium') return 'border-emerald-600 text-emerald-600'
  return 'border-muted-foreground text-muted-foreground'
}

const Separator = () => <div className="my-4 h-px w-full bg-border" />

function HeroSection() {
  return (
    <Card className="border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl">
      <CardContent className="space-y-2 py-6">
        <h2 className="text-3xl font-semibold">Welcome back, Alex! 👋</h2>
        <p className="max-w-2xl text-sm text-primary-foreground/90">
          Keep track of quotes, installations, and upcoming tasks. Everything you need to move your project forward—all
          in one place.
        </p>
      </CardContent>
    </Card>
  )
}

function QuickStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Active quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{quotes.filter((quote) => quote.status !== 'Draft').length}</p>
          <p className="text-xs text-muted-foreground">2 pending approval</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Upcoming installs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">1</p>
          <p className="text-xs text-muted-foreground">Scheduled Apr 16</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Open tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{tasks.filter((task) => !task.complete).length}</p>
          <p className="text-xs text-muted-foreground">1 high priority</p>
        </CardContent>
      </Card>
    </div>
  )
}

function NextStepCard() {
  return (
    <Card className="border-l-4 border-l-primary bg-primary/5">
      <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Next step</h3>
            <p className="text-sm text-muted-foreground">
              Upload 3 photos of your warehouse entrances so our installers can finalise the plan.
            </p>
          </div>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Upload now</Button>
      </CardContent>
    </Card>
  )
}

function TimelineCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest project updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.map((item, index) => (
          <div key={item.event} className="relative flex items-start gap-4">
            {index !== timeline.length - 1 && <div className="absolute left-5 top-9 h-8 w-px bg-border" />}
            <div
              className={`rounded-full p-2 ${
                item.accent === 'complete' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium">{item.event}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function HomeTab() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <QuickStats />
      <NextStepCard />
      <TimelineCard />
    </div>
  )
}

function QuotesTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your quotes</CardTitle>
          <CardDescription>Review and action your Cheap Alarms proposals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="border border-border/70 shadow-sm hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-lg font-semibold text-primary">{quote.id}</span>
                    <Badge className={statusBadgeClass(quote.status)}>{quote.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quote.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {quote.amount}
                    </span>
                    <span>{quote.items} items</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  {quote.status === 'Draft' && (
                    <Button size="sm" variant="secondary">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {quote.status === 'Sent' && (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Accept quote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote CA-001 details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold">Items</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vesta G1 Panel × 1</span>
                  <span className="font-medium">$799</span>
                </div>
                <div className="flex justify-between">
                  <span>Indoor PIR × 4</span>
                  <span className="font-medium">$316</span>
                </div>
                <div className="flex justify-between">
                  <span>Keypad × 1</span>
                  <span className="font-medium">$129</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold text-primary">
                  <span>Total</span>
                  <span>$1,543</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Submitted photos</h4>
              <div className="grid grid-cols-2 gap-3">
                {uploads.slice(0, 4).map((img) => (
                  <div key={img.id} className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TasksTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Outstanding tasks</CardTitle>
          <CardDescription>Complete these items to keep your project on track.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                task.complete ? 'bg-muted/40 text-muted-foreground' : 'bg-background'
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                  task.complete ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}
              >
                {task.complete && <CheckCircle2 className="h-3 w-3" />}
              </div>
              <div className="flex-1 text-sm">
                <p className={task.complete ? 'line-through' : ''}>{task.title}</p>
              </div>
              <Badge variant="outline" className={priorityBadgeClass(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload site photos</CardTitle>
          <CardDescription>Help us create an accurate installation plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/40 p-12 text-center hover:border-primary/50">
            <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Drag photos here or click to browse</p>
            <p className="text-sm text-muted-foreground">JPG/PNG up to 10MB each</p>
          </div>

          <div className="rounded-lg bg-muted/60 p-4 text-sm">
            <h4 className="mb-3 font-semibold">Photo requirements</h4>
            <div className="space-y-2">
              {['Entry points (doors/windows)', 'Interior spaces', 'Mounting locations', 'Electrical panel'].map(
                (label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${index < 2 ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>{label}</span>
                  </div>
                )
              )}
            </div>
            <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Tip: more photos = more accurate quote.</p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Uploaded photos ({uploads.length})</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {uploads.map((img) => (
                <div key={img.id} className="group relative">
                  <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-center text-xs text-muted-foreground">{img.name}</p>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-2 py-4">
              <div className="flex items-center justify-between text-sm">
                <span>kitchen-view.jpg</span>
                <span className="text-muted-foreground">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 md:flex-row">
            <Button variant="outline" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Add more photos
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Submit photos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your documents</CardTitle>
        <CardDescription>Quotes, invoices, and compliance paperwork in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center gap-4 rounded-lg border px-4 py-3 hover:border-primary/40">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline">{doc.type}</Badge>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <FolderOpen className="mx-auto mb-4 h-16 w-16 opacity-40" />
            <p>No documents yet. Files will appear here as your project progresses.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AccountTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your information</CardTitle>
          <CardDescription>Keep your contact details current.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Full name</p>
                <p className="mt-1 text-base font-medium">Alex Johnson</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="mt-1 text-base">alex.johnson@email.com</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>
                <p className="mt-1 text-base">0412 345 678</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </p>
                <p className="mt-1 text-base">42 Security Lane, Sydney NSW 2000</p>
              </div>
            </div>
          </div>
          <Separator />
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit information
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portal access</CardTitle>
          <CardDescription>Manage who can log in to the customer hub.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accessList.map((member) => (
            <div
              key={member.email}
              className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                member.state === 'primary' ? 'bg-primary/5' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  member.state === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                } font-semibold`}
              >
                {member.initials}
              </div>
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              {member.state === 'primary' && <Badge>Primary</Badge>}
              {member.state === 'invited' && (
                <>
                  <Badge variant="outline">Invited</Badge>
                  <Button variant="ghost" size="sm">
                    Resend
                  </Button>
                </>
              )}
              {member.state === 'active' && (
                <>
                  <Badge variant="secondary">Active</Badge>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </>
              )}
            </div>
          ))}
          <Separator />
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add team member
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PortalDemoPage() {
  const [tab, setTab] = useState('home')

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Concept demo</p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Cheap Alarms Client Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Prototype</Badge>
            <Badge variant="outline">Dummy data</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 w-full max-w-6xl px-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 rounded-none border-b border-[#e3e8ef] bg-transparent p-0">
            {[
              { value: 'home', label: 'Home', icon: Home },
              { value: 'quotes', label: 'Quotes', icon: FileText },
              { value: 'tasks', label: 'Tasks & uploads', icon: CheckSquare },
              { value: 'documents', label: 'Documents', icon: FolderOpen },
              { value: 'account', label: 'Account', icon: User }
            ].map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex items-center gap-2 rounded-t-md border-b-2 border-transparent bg-transparent px-5 py-3 text-sm font-medium text-[#5b6572] transition data-[state=active]:border-[#ff4fa6] data-[state=active]:bg-white data-[state=active]:text-[#101828] data-[state=active]:shadow-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="home">
            <HomeTab />
          </TabsContent>

          <TabsContent value="quotes">
            <QuotesTab />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

