import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
  } from "./ui/dialog";
  import { Loader2 } from "lucide-react";
  
  export function LoadingDialog({ isOpen }: { isOpen: boolean }) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogPortal>
          <DialogOverlay className="bg-black/20" />
          <DialogContent 
            className="sm:max-w-[425px] select-none border-none"
            onPointerDownOutside={e => e.preventDefault()}
            hideCloseButton
          >
            <div className="flex flex-col items-center justify-center gap-6 py-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-[#025F4C]/20" />
                </div>
                <Loader2 className="h-16 w-16 animate-spin text-[#025F4C]" />
              </div>
              
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-[#025F4C]">Processing Data</h2>
                <p className="text-sm text-[#025F4C]/70">
                  Please wait while we reconcile your data. This may take a few moments...
                </p>
              </div>
  
              <div className="w-full space-y-2">
                <div className="h-2 w-full bg-[#025F4C]/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full w-1/3 bg-[#025F4C] rounded-full animate-progress"
                    style={{
                      animation: "progress 2s ease-in-out infinite"
                    }}
                  />
                </div>
              </div>
            </div>
  
            <style jsx global>{`
              @keyframes progress {
                0% {
                  transform: translateX(-150%);
                }
                50% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(350%);
                }
              }
            `}</style>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }