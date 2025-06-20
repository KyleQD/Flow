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
          Upgrade to Pro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Unlock the full potential of Tourify with a Pro account:
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
            <Button>Upgrade Now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 