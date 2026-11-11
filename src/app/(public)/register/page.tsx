import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-xl font-semibold text-slate-900">Create your account</h1>
      <RegisterForm />
    </div>
  );
}
