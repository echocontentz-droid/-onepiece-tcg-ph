"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, AtSign, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { PH_PROVINCES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agree_terms: false },
  });

  const onSubmit = async (data: RegisterInput) => {
    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username.toLowerCase())
      .single();

    if (existing) {
      setError("username", { message: "Username is already taken" });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.display_name,
          username: data.username.toLowerCase(),
          province: data.province,
          phone: data.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("email", { message: "An account with this email already exists" });
      } else {
        toast.error(error.message);
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email!</h1>
        <p className="text-muted-foreground mb-6">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{watch("email")}</span>.
          Click the link to activate your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSuccess(false)}
            className="text-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-muted-foreground mt-1">
          Join the Philippines&apos; One Piece TCG community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Display name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Display Name</label>
          <Input
            placeholder="Your name (shown publicly)"
            icon={<User className="h-4 w-4" />}
            error={errors.display_name?.message}
            {...register("display_name")}
          />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Username</label>
          <Input
            placeholder="unique_username"
            icon={<AtSign className="h-4 w-4" />}
            error={errors.username?.message}
            autoCapitalize="none"
            {...register("username")}
          />
          <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Address</label>
          <Input
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              autoComplete="new-password"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Confirm Password</label>
          <Input
            type="password"
            placeholder="Repeat your password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirm_password?.message}
            autoComplete="new-password"
            {...register("confirm_password")}
          />
        </div>

        {/* Province */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Province <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("province")}
            >
              <option value="">Select province...</option>
              {PH_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Mobile Number <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            type="tel"
            placeholder="09XXXXXXXXX"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
              {...register("agree_terms")}
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.agree_terms && (
            <p className="text-xs text-destructive">{errors.agree_terms.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
