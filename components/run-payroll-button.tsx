'use client'

import { useTransition, useState } from "react";
import { triggerPayroll } from "@/app/actions/payroll";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, AlertCircle } from "lucide-react";

interface RunPayrollButtonProps {
  employeeCount: number;
}

export function RunPayrollButton({ employeeCount }: RunPayrollButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRunPayroll = () => {
    if (employeeCount === 0) {
      setMessage({ type: 'error', text: "You must add at least one employee first." });
      return;
    }
    
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
        disabled={isPending || employeeCount === 0}
        className="font-semibold"
        variant={employeeCount === 0 ? "secondary" : "default"}
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
      {employeeCount === 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <AlertCircle className="h-3 w-3" />
          No employees added
        </div>
      )}
      {message && (
        <p className={`text-xs font-medium ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
