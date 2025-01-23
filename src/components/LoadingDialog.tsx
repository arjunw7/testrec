import {
    Dialog,
    DialogContent,
  } from "./ui/dialog";
  import { Progress } from "./ui/progress";
  
  export function LoadingDialog({ isOpen }: { isOpen: boolean }) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Processing Data</h2>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we reconcile your data. This may take a few moments...
            </p>
            <Progress value={undefined} className="h-2" /> {/* Indeterminate progress */}
          </div>
        </DialogContent>
      </Dialog>
    );
  }