"use client"
import Image from 'next/image'
import React from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormFieldType } from '../form/PatientForm'
import { Control } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface CustomProps{
    control : Control<any>,
    name : string,
    fieldType: FormFieldType,
    label?: string,
    placeholder?: string,
    iconSrc?: string,
    iconAlt?: string,
    disabled?: boolean, 
    dateFormat?: string,
    showTimeSelect?: boolean,
    children ?: React.ReactNode,
    renderSkeleton?: (field : any) => React.ReactNode,

}

import { ControllerRenderProps, FieldValues } from "react-hook-form";

const RenderField = ({
  field,
  props,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  props: CustomProps;
}) => {
  const { fieldType, iconSrc, iconAlt, placeholder, disabled } = props;

  switch (fieldType) {
    case FormFieldType.INPUT:

      return (
        <FormControl>
          <div className="relative w-full">
            {iconSrc && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <Image
                  src={iconSrc}
                  alt={iconAlt || "icon"}
                  height={20}
                  width={20}
                  className="opacity-70"
                />
              </span>
            )}
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              className="bg-dark-400 placeholder:text-dark-600 border border-dark-500 h-11 
                         focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 rounded-md"
            />
          </div>
        </FormControl>
      );

    case FormFieldType.PHONE_INPUT:
        return (
            <FormControl>
            <div className="relative w-full">
                <PhoneInput
                country={"in"}
                placeholder={placeholder}
                value={field.value as string | undefined}
                onChange={field.onChange}
                inputStyle={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#23272f",        // Tailwind: bg-dark-400
                    color: "#ffffff",
                    paddingLeft: "3rem",
                    borderRadius: "0.5rem",            // Tailwind: rounded-md
                    border: "1px solid #353945",       // Tailwind: border-dark-500
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "16px"
                }}
                containerStyle={{
                    width: "100%",
                    backgroundColor: "#23272f",        // bg-dark-400
                    border: "none",
                    borderRadius: "0.5rem"
                }}
                buttonStyle={{
                    backgroundColor: "#23272f",        // bg-dark-400
                    border: "none",
                    borderTopLeftRadius: "0.5rem",
                    borderBottomLeftRadius: "0.5rem"
                }}
                dropdownStyle={{
                    backgroundColor: "#23272f",        // bg-dark-400
                    color: "#ffffff"
                }}
                />
            </div>
            </FormControl>
        );

      default : 
        break;
  }
};


const CustomFormField = (props: CustomProps) => {
    const  { control , fieldType , name, label } = props;
  return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className='flex-1'>
                {fieldType !== FormFieldType.CHECKBOX && label &&(
                    <FormLabel>
                        {label}
                    </FormLabel>
                ) }

                <RenderField field = {field} props = {props}/>
                <FormMessage className = "shad-error"/>
            </FormItem>
          )}
        />
  )
}

export default CustomFormField