"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import 'react-phone-input-2/lib/style.css'
import { Form } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.action";
import { UserFormValidation } from "@/lib/validation";
import CustomFormField, { FormFieldType } from "../ui/CustomFormField";
import SubmitButton from "../ui/SubmitButton";

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

      const newUser = await createUser(user);
      console.log("New user response:", newUser); // 🔍 Add this

      if (newUser?.$id) {
        router.push(`/patients/${newUser.$id}/register`);
      } else {
        console.error("User creation failed or $id missing");
      }

    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Full Name"
          placeholder="Your name"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="aryaman@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />
        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Phone Number"
          placeholder="(91) 123-456-7890"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <div className="pt-4">
          <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;




