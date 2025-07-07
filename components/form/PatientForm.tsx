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
import PhoneInput from "react-phone-input-2";

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Image
                        src="/assets/icons/user.svg"
                        alt="user"
                        height={20}
                        width={20}
                        className="opacity-70"
                      />
                    </span>
                    <Input
                      placeholder="Your name"
                      {...field}
                      className="bg-dark-400 placeholder:text-dark-600 border border-dark-500 h-11 
                                focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 rounded-md"
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Image
                        src="/assets/icons/email.svg"
                        alt="email"
                        height={20}
                        width={20}
                        className="opacity-70"
                      />
                    </span>
                    <Input
                      placeholder="aryaman@gmail.com"
                      {...field}
                      className="bg-dark-400 placeholder:text-dark-600 border border-dark-500 h-11 
                                focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 rounded-md"
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="relative w-full bg-gray-900 rounded-md border focus-visible:ring-0 focus-visible:ring-offset-0">
                  <PhoneInput
                    country={"in"}
                    enableSearch={true}
                    placeholder="(91) 123-456-7890"
                    value={field.value}
                    onChange={field.onChange}
                    inputStyle={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "#101828",
                      color: "#ffffff",
                      paddingLeft: "3rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #101828",
                      outline: "none",
                      boxShadow: "none",
                      fontSize: "16px"
                    }}
                    containerStyle={{
                      width: "100%",
                      backgroundColor: "#101828",
                      border: "none",
                      borderRadius: "0.25rem"
                    }}
                    buttonStyle={{
                      backgroundColor: "#101828",
                      border: "none",
                      borderTopLeftRadius: "0.25rem",
                      borderBottomLeftRadius: "0.25rem"
                    }}
                    dropdownStyle={{
                      zIndex: 1000,
                      backgroundColor: "#101828",
                      color: "#ffffff"
                    }}
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
        <EmailVerifyModal expectedCode={expectedCode} onSuccess={handleVerified} />
      )}
    </>
  );
};

export default PatientForm;
