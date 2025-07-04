"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";
import { PatientFormValidation } from "@/lib/validation";
import CustomFormField, { FormFieldType } from "../ui/CustomFormField";
import SubmitButton from "../ui/SubmitButton";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/lib/constants";
import { Label } from "@radix-ui/react-label";
import { getUserIdFromCookie } from "@/lib/actions/user.action";
import { getAppointmentByUserId } from "@/lib/actions/appointment.action";
import { SelectItem } from "../ui/select";
import FileUpload from "../ui/FileUploader";
import { registerPatient } from "@/lib/actions/patient.action";

export const PatientRegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
//   const [newUserId, setNewUserId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState("")
  const [test, setTest] = useState("")

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
        ...PatientFormDefaultValues,
        name: "",
        email: "",
        phone: "",
        primaryPhysician: doctorName,
        test: test,
        treatmentConsent: false,
        disclosureConsent: false,
        privacyConsent: false,
        identificationDocument: [],
    },
  });


  useEffect(() => {
  const fetchDoctorName = async () => {
    const userId = await getUserIdFromCookie()
    if (userId) {
      const appointment = await getAppointmentByUserId(userId)

      if (appointment?.doctorName) {
        setDoctorName(appointment.doctorName)
        form.setValue("primaryPhysician", appointment.doctorName)
      }
      if(appointment?.test){
        setTest(appointment.test)
        form.setValue("test",appointment.test)
      }
    }
  }

  fetchDoctorName()
}, [form])


  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    setIsLoading(true);
     console.log("Submitting form with values: ", values);

    let formData;

    if(values.identificationDocument && values.identificationDocument.length>0){
        const blobFile = new Blob([values.identificationDocument[0]],{
            type: values.identificationDocument[0].type
        })

        formData = new FormData()
        formData.append('blobFile', blobFile);
        formData.append('fileName',values.identificationDocument[0].name)
    }


    try {
        const userId = await getUserIdFromCookie();
            if (!userId) {
            throw new Error("User not logged in or userId not found in cookie");
            }
        const patientData = {
            ...values,
            userId: userId,
            birthDate: new Date(values.birthDate),
            identificationDocument: formData,
        }
        const patient = await registerPatient(patientData);

        if(patient) router.push(`/patients/[userId]/new-appointment`)
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
        <section>
            <p className = "text-amber-100 font-extrabold text-2xl">Personal Information</p>
        </section>
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label = "Full name"
            placeholder="Patient name"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
          />

          <div className="flex flex-col gap-6 xl:flex-row">
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
            />
          </div>

            <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="birthDate"
                label="Date of Birth"
                
            />
            <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="Gender"
                label="Gender"
                renderSkeleton={(field) => (
                    <FormControl>
                        <RadioGroup className="flex h-11 gap-6 xl:justify-between" onValueChange={field.onChange} defaultValue={field.value}>
                            {GenderOptions.map((option) => (
                                <div key={option} className="flex h-full flex-1 items-center gap-2 rounded-md border border-dashed border-gray-800 bg-gray-900 p-3 ">
                                    <RadioGroupItem value={option} id={option} className = "h-4 w-4 shrink-0 rounded-full border border-white data-[state=checked]:bg-white data-[state=checked]:border-white " />
                                    <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                )}
            />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="address"
                    label="Address"
                    placeholder = "14th Street Delhi"    
                />
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="occupation"
                    label="Occupation"
                    placeholder = "Software Engineer"  
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="emergencyContactName"
                label="Emergency Contact Person"
                placeholder="Gaurdian's Name"
            />
            <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="emergencyContactNumber"
                label="Emergency Contact Number"
                placeholder="(91) 123-456-7890"
            />
            </div>

        <section>
            <p className = "text-amber-100 font-extrabold text-2xl">Medical Information</p>
        </section>
            <div className="flex flex-col gap-6 xl:flex-row">
                {/* doctorimage and name*/}
                {doctorName ? (
                <CustomFormField
                    fieldType={FormFieldType.READONLY}
                    control={form.control}
                    name="primaryPhysician"
                    label="Primary Physician"
                />
                ) : test ? (
                <CustomFormField
                    fieldType={FormFieldType.READONLY}
                    control={form.control}
                    name="test"
                    label="Test Prescribed"
                />
                ) : null}

            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="insuranceProvider"
                    label="Insurance Provider"
                    placeholder="ex: LIC, etc"
                />
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="insurancePolicyNumber"
                    label="Insurance Policy Number"
                    placeholder="XXX-1234-XXX"
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="Allergies"
                    label="Allergies (if any)"
                    placeholder="ex: Peanuts, Cilantro , Pollen"
                />
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="currentMedication"
                    label="Current Medication (if any)"
                    placeholder="ex: Paracetamol (500mg) atc"
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="FamilyMedicalHistory"
                    label="Family Medical History (if any)"
                    placeholder="ex: GrandFather had Vitiligo"
                />
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="pastMedicalHistory"
                    label="Past Medical History (if any)"
                    placeholder="ex: Had Typhoid before 2 weeks"
                />
            </div>

        <section>
            <p className = "text-amber-100 font-extrabold text-2xl">Identification and Verification</p>
        </section>
                <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="identificationType"
                    label="Identification Type"
                    placeholder="Select Identifiaction Type"
                >
                    {IdentificationTypes.map((type)=>(
                        <SelectItem key = {type} value = {type} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            {type}
                        </SelectItem>
                    ))}
                </CustomFormField>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="identificationNumber"
                    label="Identification Number"
                    placeholder="1234-5678-XXXX"
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="identificationDocument"
                label="Scanned copy of identification document"
                renderSkeleton={(field) => (
                    <FormControl>
                        <FileUpload files= {field.value} onChange= {field.onChange}/>
                    </FormControl>
                )}
            />
            </div>

        <section>
            <p className = "text-amber-100 font-extrabold text-2xl">Consent and Privacy</p>
        </section>

        <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control = {form.control}
            name = "treatmentConsent"
            label = "I consent to treatment"
        />
        <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control = {form.control}
            name = "disclosureConsent"
            label = "I consent to disclosure"
        />
        <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control = {form.control}
            name = "privacyConsent"
            label = "I consent to privacy policy"
        />
          <div className="pt-4">
            <SubmitButton isLoading={isLoading} >Get Started</SubmitButton>
          </div>
        </form>
      </Form>
        {/* {expectedCode && (
        <EmailVerifyModal expectedCode={expectedCode} onSuccess={handleVerified} />
      )} */}
    </>
  );
};

export default PatientRegisterForm;
