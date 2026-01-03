"use client";

import { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/app/hooks";
import { useAuthContext } from "@/app/components/auth/auth-provider";
import { useUserStore } from "@/app/store";

const signupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Invalid phone number (10-11 digits)")
    .required("Phone is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuth();
  const { isInitialized, isAuthenticated } = useAuthContext();
  const { isAuthenticated: userIsAuthenticated } = useUserStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isInitialized && (isAuthenticated || userIsAuthenticated)) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, userIsAuthenticated, router]);

  // Don't render until auth is initialized
  if (!isInitialized) {
    return null; // AuthProvider handles the loading state
  }

  // Don't render if authenticated (redirect is in progress)
  if (isAuthenticated || userIsAuthenticated) {
    return null;
  }

  const handleSubmit = async (values: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    setSubmitError(null);
    try {
      const user = await signup({
        name: values.name,
        phone: values.phone,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      // Navigate to OTP verification or home page
      router.push("/auth/otp");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-light to-background px-2 sm:p-4 safe-area-inset">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Create an account
          </h1>
          <p className="text-sm md:text-base text-secondary">Join Chert and start chatting</p>
        </div>

        <div className="flex flex-col gap-4 md:gap-5 bg-surface-elevated rounded-2xl shadow-xl sm:p-6 md:p-8 p-4 border border-border">
          <Formik
            initialValues={{
              name: "",
              username: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={signupSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              errors,
              touched,
            }) => (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 flex flex-col gap-5"
              >
                {submitError && (
                  <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}

                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && errors.name ? errors.name : undefined}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Username"
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.username && errors.username
                      ? errors.username
                      : undefined
                  }
                  placeholder="Choose a username"
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.email && errors.email ? errors.email : undefined
                  }
                  placeholder="Enter your email"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.phone && errors.phone ? errors.phone : undefined
                  }
                  placeholder="Enter your phone number"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.password && errors.password
                      ? errors.password
                      : undefined
                  }
                  placeholder="Create a password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                  placeholder="Confirm your password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </form>
            )}
          </Formik>

          <div className=" flex flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-elevated text-secondary">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" size="md" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="secondary" size="md" className="w-full">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
