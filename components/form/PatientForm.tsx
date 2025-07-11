"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.action";
import { UserFormValidation } from "@/lib/validation";
import SubmitButton from "../ui/SubmitButton";
import EmailVerifyModal from "../ui/EmailVerifyModal"; // create this
import { verifyPatient } from "@/lib/actions/patient.action";
import Image from "next/image";
import { Input } from "../ui/input";
import {User , Mail, Phone} from "lucide-react"
export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);

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
    try {
      const user = {
        name: values.name,
        email: values.email,
        phone: `+${values.phone}`,
      };

      const result = await createUser(user);
      console.log("User creation result:", result);

      if (result?.user?.$id && result.code) {
        setExpectedCode(result.code);
        setNewUserId(result.user.$id);
        // Show OTP modal or next step
      } else {
        console.error("User creation failed: Missing user ID or verification code");
        alert("User creation failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const handleVerified = async () => {
    if(newUserId){
      try{
        verifyPatient(newUserId);
        router.push(`/patients/${newUserId}/my-appointments`);
      }catch(error){
        console.log("Failed to verify check patient.action.ts", error);
      }
    }
  };

return (
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1"
      >
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-sm text-gray-800">Full Name</FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <User className="dark:text-black opacity-70 mr-2"/>
                  </span>
                  <Input
                    placeholder="Your name"
                    {...field}
                    className="h-11 pl-10 border border-gray-700 rounded-md 
                               text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
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
            <FormItem className="flex-1">
              <FormLabel className="text-sm text-gray-800">Email</FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className = "dark:text-black opacity-70"/>
                  </span>
                  <Input
                    placeholder="aryaman@gmail.com"
                    {...field}
                    className="h-11 pl-10  border border-gray-700 rounded-md 
                               text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-sm text-gray-800">Phone Number</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-black opacity-70" />
                      {/* <span className="text-sm text-gray-500 dark:text-black">+91</span> */}
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="1234567890"
                      // value={field.value?.replace(/^\+91\s?/, "")} // strip prefix
                      onChange={(e) => field.onChange(`91${e.target.value}`)}
                      className={`
                        h-11 pl-14 pr-4 w-full rounded-md text-black border border-gray-700 
                        bg-white placeholder:text-gray-500
                        focus:ring-3 focus:ring-gray-400
                      `}
                    />
                  </div>

                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </div>
      </form>
    </Form>

    {expectedCode && (
      <EmailVerifyModal
        expectedCode={expectedCode}
        onSuccess={handleVerified}
      />
    )}
  </>
);

};

export default PatientForm;
