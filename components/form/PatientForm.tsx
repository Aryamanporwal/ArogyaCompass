"use client"
import { useState } from "react"
import {
  Form,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import CustomFormField from "../ui/CustomFormField"
import SubmitButton from "../ui/SubmitButton"
export enum FormFieldType{
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELeTON = 'skeleton'
}
import { UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"




const PatientForm = ()=>{
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email : "",
      phone :"",
    },
  })

  function onSubmit({name, email, phone}: z.infer<typeof UserFormValidation>) {
    setIsLoading(true);
     try{
      // const userData = {name, email , phone}

      // const user = await createUser(userData);
      // if(user)  router.push('/patients/${user.$id}/register')
     }
     catch (error){
      console.log(error)
     }
  }

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

        {/* Submit Button with margin */}
        <div className="pt-4">
          <SubmitButton isLoading= {isLoading}>Get Started</SubmitButton>
        </div>
      </form>
    </Form>
  )
}

export default PatientForm;




