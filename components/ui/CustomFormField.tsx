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
import { Control } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Textarea } from './textarea'

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  READONLY = "readonly"
}

interface CustomProps{
    control : Control<FieldValues>,
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
    renderSkeleton?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode,

}


const RenderField = ({
  field,
  props,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  props: CustomProps;
}) => {
  const { fieldType, iconSrc, iconAlt, placeholder, disabled, showTimeSelect, dateFormat, renderSkeleton } = props;

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
            <div className="relative w-full bg-gray-900 rounded-md border focus-visible:ring-0 focus-visible:ring-offset-0">
                <PhoneInput
                country={"in"}
                placeholder={placeholder}
                value={field.value as string | undefined}
                onChange={field.onChange}
                inputStyle={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#101828",        // Tailwind: bg-dark-400
                    color: "#ffffff",
                    paddingLeft: "3rem",
                    borderRadius: "0.25rem",            // Tailwind: rounded-md
                    border: "1px solid #101828",       // Tailwind: border-dark-500
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "16px"
                }}
                containerStyle={{
                    width: "100%",
                    backgroundColor: "#101828",        // bg-dark-400
                    border: "none",
                    borderRadius: "0.25rem"
                }}
                buttonStyle={{
                    backgroundColor: "#101828",        // bg-dark-400
                    border: "none",
                    borderTopLeftRadius: "0.25rem",
                    borderBottomLeftRadius: "0.25rem"
                }}
                dropdownStyle={{
                    backgroundColor: "101828",        // bg-dark-400
                    color: "#101828"
                }}
                />
            </div>
            </FormControl>
        );

        case FormFieldType.DATE_PICKER:
          return (
              <div className="flex items-center rounded-md bg-gray-900 border border-gray-800 h-11 px-3 ">
                {/* Calendar Icon */}
                <Image
                  src="/assets/icons/calendar.svg"
                  height={20}
                  width={20}
                  alt="calendar"
                  className="mr-2 opacity-70"
                />

                {/* Date Picker Input */}
                <FormControl className="flex-1">
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat={dateFormat ?? 'dd/MM/yyyy'}
                    placeholderText="Choose a date"
                    showTimeSelect= {showTimeSelect ?? false}
                    timeInputLabel = "Time:"
                    wrapperClassName='date-picker'
                    className="bg-gray-900 text-white placeholder-gray-400 focus:outline-none w-full"
                    calendarClassName="!bg-gray-900 !text-white !border-gray-800"
                    dayClassName={() => "!text-white hover:!bg-gray-700"}
                  />
                </FormControl>
              </div>
          )

        case FormFieldType.SKELETON:
            return renderSkeleton ? renderSkeleton(field) : null;

        case FormFieldType.READONLY:
           return (
              <FormControl>
                <Input
                  value={field.value}
                  readOnly
                  className="bg-gray-900 text-white placeholder:text-gray-500 border border-gray-800 h-11 rounded-md px-4"
                />
              </FormControl>
            )

        case FormFieldType.TEXTAREA:
          return (
            <FormControl>
              <Textarea
               placeholder={placeholder}
               {...field}
               className = "bg-gray-900 placeholder:text-gray-700 border-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
               disabled = {props.disabled}
               ></Textarea>
            </FormControl>
          )
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
           
              <SelectTrigger className="bg-gray-900  placeholder:text-gray-700 border-gray-800 h-11 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            
            <SelectContent className="bg-gray-900 border-gray-800 ">
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );
      case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="cursor-pointer text-sm font-medium text-amber-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 md:leading-none">
              {props.label}
            </label>
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