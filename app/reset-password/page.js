import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
