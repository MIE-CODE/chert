"use client";
import { Formik } from "formik";
import { loginSchema } from "./login/schema.login";
import { Input } from "../components/input/input.component";

export default function Authpage() {
  const initialValues = {
    email: "",
    password: "",
  };
  const handleFormSubmit = (values: { email: string; password: string }) => {
    console.log(values);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-2">
      <main className="flex  w-full max-w-xl flex-col items-center justify-between px-4 py-6 border border-black dark:border-white sm:items-start rounded">
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, handleChange, handleSubmit, handleBlur, errors }) => (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
            >
              <Input
                label="Email"
                type="text"
                name="email"
                value={values.email}
                onChange={handleChange}
                handleBlur={handleBlur}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                handleBlur={handleBlur}
                error={errors.password}
              />
              <button className="px-6 py-2 border mt-7" type="submit">
                Submit
              </button>
            </form>
          )}
        </Formik>
      </main>
    </div>
  );
}
