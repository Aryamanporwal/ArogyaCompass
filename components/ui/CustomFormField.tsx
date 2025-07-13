"use client";
import Image from 'next/image'
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
    className?: string,        // <-- NEW
    labelClass?: string,       // <-- NEW
    children ?: React.ReactNode,
    renderSkeleton?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode,
}

// const wrapperClass = "flex items-center rounded-md bg-gray-900 border border-gray-800 h-11 px-3";
const inputClass = "w-full h-11 px-3 rounded-md text-sm transition-all bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image
              src={iconSrc}
              alt={iconAlt || "icon"}
              height={20}
              width={20}
              className="opacity-80" // Make icon more visible
              style={{ filter: "brightness(0.5)" }} // Even darker if needed
            />
          </span>
        )}
        <Input
          placeholder={placeholder}
          disabled={disabled}
          {...field}
          className={props.className || `
            h-11 pl-10 rounded-md transition-all
            bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        />
      </div>
    </FormControl>
  );

    case FormFieldType.PHONE_INPUT:
        return (
            <FormControl>
            <div className={props.className || `relative w-full  rounded-md border focus-visible:ring-0 focus-visible:ring-offset-0`}>
            <PhoneInput
              country={"in"}
              placeholder={placeholder}
              value={field.value as string | undefined}
              onChange={field.onChange}
              inputClass="form-control"
              containerClass="custom-phone-input w-full"
            />
            </div>
            </FormControl>
        );

    case FormFieldType.DATE_PICKER:
      return (
        <div className={`flex items-center rounded-md bg-white border border-gray-300 h-11 px-3 `}>
          {/* Calendar Icon */}
          <Image
            src="/assets/icons/calendar.svg"
            height={20}
            width={20}
            alt="calendar"
            className="mr-2 opacity-70"
            style={{ filter: "brightness(0.5)" }}

          />
          {/* Date Picker Input */}
          <FormControl className="flex-1">
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat={dateFormat ?? "dd/MM/yyyy"}
              placeholderText="Choose a date"
              showTimeSelect={showTimeSelect ?? false}
              timeInputLabel="Time:"
              wrapperClassName="date-picker"
              className={inputClass}
              calendarClassName={
                `!rounded-md !text-sm !shadow-lg
                !bg-white !text-gray-900 !border !border-gray-300
                dark:!bg-[#1f2937] dark:!text-white dark:!border-gray-700
              `}
              dayClassName={() =>
                "rounded-md transition-colors " +
                "hover:!bg-gray-200 dark:hover:!bg-gray-700 !text-gray-900 dark:!text-white"
              }
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
            className={props.className || `
              h-11 px-4 rounded-md transition-all
              bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300
              dark:bg-[#101828] dark:text-white dark:placeholder:text-gray-400 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          />
        </FormControl>
      )

    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            {...field}
            className={props.className || `
              h-11 px-4 rounded-md transition-all
              bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-blue-500
              dark:bg-[#101828] dark:text-white dark:placeholder:text-gray-400 dark:border-gray-700
            `}
            disabled={props.disabled}
          ></Textarea>
        </FormControl>
      )

    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className={props.className || `
              h-11 px-4 rounded-md transition-all
              bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300
              focus:ring-0 focus:ring-offset-0 focus:outline-none
                dark:placeholder:text-gray-400 dark:border-gray-700
            `}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-gray-200 border-gray-800 ">
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
              className={props.className}
            />
            <label htmlFor={props.name} className={props.labelClass || `
                cursor-pointer text-sm font-medium
                text-gray-700 dark:text-amber-100
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                md:leading-none transition-colors
              `}>
              {props.label}
            </label>
          </div>
        </FormControl>
      );

    default:
      return null;
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
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className={props.labelClass || ""}>
              {label}
            </FormLabel>
          )}
          <RenderField field={field} props={props}/>
          <FormMessage className="shad-error"/>
        </FormItem>
      )}
    />
  )
}

export default CustomFormField
