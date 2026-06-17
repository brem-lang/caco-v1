import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-10 space-y-10 max-w-3xl mx-auto">

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">shadcn/ui Components</h1>
        <p className="text-muted-foreground">A showcase of components on this page.</p>
      </div>

      <Separator />

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <Separator />

      {/* Input */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Input</h2>
        <div className="flex gap-3 max-w-sm">
          <Input placeholder="Type something..." />
          <Button>Submit</Button>
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">John Doe</CardTitle>
                  <CardDescription>Software Engineer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Building great products with modern web technologies.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Alpha</CardTitle>
              <CardDescription>Last updated 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A next-generation platform for building scalable applications.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">View</Button>
              <Button size="sm" variant="outline">Edit</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

    </div>
  );
}
