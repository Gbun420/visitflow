'use client'

import { useTransition, useState } from "react";
import { triggerPayroll } from "@/app/actions/payroll";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle } from "lucide-react";

export function RunPayrollButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRunPayroll = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await triggerPayroll();
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: "Payroll processing started in background!" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleRunPayroll} 
        disabled={isPending}
        className="font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Triggering...
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Payroll
          </>
        )}
      </Button>
      {message && (
        <p className={`text-xs font-medium ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
