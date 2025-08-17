import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface UpgradeToProProps extends React.ComponentProps<typeof Button> {
  variant?: "default" | "outline" | "ghost"
}

export function UpgradeToPro({ className, variant = "default", ...props }: UpgradeToProProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("", className)} {...props}>
          Pro features are now free
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pro access unlocked</DialogTitle>
          <DialogDescription>
            All upgraded features are temporarily free while we roll out the new account organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="list-disc list-inside space-y-2">
            <li>Apply to job postings</li>
            <li>Post your own jobs and opportunities</li>
            <li>Access premium features</li>
            <li>Priority support</li>
          </ul>
          <div className="flex justify-end gap-4">
            <Button variant="outline">Learn More</Button>
            <Button>Got it</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 