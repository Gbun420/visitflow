'use server'

import { tasks } from "@trigger.dev/sdk/v3";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { runPayrollTask } from "@/src/trigger/payroll";

export async function triggerPayroll() {
  const user = await getCurrentUser();

  if (!user || !user.company?.id) {
    return { error: "Unauthorized: No company associated with this user." };
  }

  try {
    // Trigger the background task
    await tasks.trigger<typeof runPayrollTask>("run-payroll", {
      companyId: user.company.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/payroll");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to trigger payroll job:", error);
    return { error: error.message || "Failed to start payroll processing." };
  }
}
