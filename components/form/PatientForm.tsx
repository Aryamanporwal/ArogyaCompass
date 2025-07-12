"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createUser, verifyPatient } from "@/lib/actions/patient.action";
import { UserFormValidation } from "@/lib/validation";
import SubmitButton from "../ui/SubmitButton";
import Image from "next/image";
import { Input } from "../ui/input";
import { User, Mail, Phone, KeyRound } from "lucide-react";

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);

    // If verification step
    if (expectedCode && newUserId) {
      if (code === expectedCode) {
        try {
          await verifyPatient(newUserId);
          router.push(`/patients/${newUserId}/my-appointments`);
        } catch (error) {
          console.error("Verification failed", error);
        }
      } else {
        setError("Invalid verification code.");
      }

      setIsLoading(false);
      return;
    }

    // First step: create user
    try {
      const user = {
        name: values.name,
        email: values.email,
        phone: `+${values.phone}`,
      };

      const result = await createUser(user);
      if (result?.user?.$id && result.code) {
        setExpectedCode(result.code);
        setNewUserId(result.user.$id);
      } else {
        alert("User creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating user", error);
    }

    setIsLoading(false);
  };

  return (
  // <div className="w-full max-w-xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-100 rounded-xl shadow-lg overflow-hidden">
  //   <div className="flex flex-col max-h-[90vh] overflow-y-auto scroll-smooth">
  <>
      <div className="flex flex-col items-center justify-center -mt-2 mb-3">
        <Image
          alt="logo"
          src="/assets/icons/logo.png"
          height={200}
          width={200}
          className="h-20 sm:h-24 md:h-28 w-auto object-contain"
        />
        <div className="-mt-1 text-center leading-tight">
          <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            ArogyaCompass
          </h1>
          <h2 className="text-sm text-blue-500 mt-0.5">
            Your Smart Path to Faster Care
          </h2>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-left bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400 bg-clip-text text-transparent animate-gradient">
          Welcome there...
        </h1>
        <p className="mt-2 text-base sm:text-m text-left text-gray-800 dark:text-gray-800">
          Begin your seamless appointment journey with confidence.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-800">Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-70" />
                    <Input
                      placeholder="Your name"
                      {...field}
                      className="pl-10 h-11 border border-gray-700 text-black placeholder:text-gray-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-800">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-70" />
                    <Input
                      placeholder="aryaman@gmail.com"
                      {...field}
                      className="pl-10 h-11 border border-gray-700 text-black placeholder:text-gray-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-800">Phone Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-70" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="1234567890"
                      onChange={(e) => field.onChange(`91${e.target.value}`)}
                      className="pl-10 h-11 border border-gray-700 w-full text-black placeholder:text-gray-500 rounded-md"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code input if needed */}
          {expectedCode && (
            <div className="pt-2">
              <FormLabel className="text-sm text-gray-800">Verification Code</FormLabel>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-70" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="______"
                  className="pl-10 h-11 border border-gray-700 w-full text-black placeholder:text-gray-500 tracking-widest text-center rounded-md"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <SubmitButton isLoading={isLoading}>
              {expectedCode ? "Verify" : "Get Started"}
            </SubmitButton>
          </div>
        </form>
      </Form>
      </>
  );
};

export default PatientForm;
