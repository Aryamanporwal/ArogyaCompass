"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { Form, FormControl } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../ui/CustomFormField";
import SubmitButton from "../ui/SubmitButton";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/lib/constants";
import { Label } from "@radix-ui/react-label";
import { getUserIdFromCookie } from "@/lib/actions/user.action";
import { getAppointmentByUserId, getPendingAppointmentByUserId } from "@/lib/actions/appointment.action";
import { SelectItem } from "../ui/select";
import FileUpload from "../ui/FileUploader";
import { registerPatient } from "@/lib/actions/patient.action";
import { generateReceiptPDF } from "@/lib/utils/generateReceipt";
import { getHospitalById, getLabById } from "@/lib/actions/payment.action";
import SuccessAppointment from "../ui/Success";

export const PatientRegisterForm = ({ user }:{user : User}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [doctorName, setDoctorName] = useState("")
  const [test, setTest] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<FieldValues>({
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
        const appointment = await getPendingAppointmentByUserId(userId)
        if (appointment?.doctorName) {
          setDoctorName(appointment.doctorName)
          form.setValue("primaryPhysician", appointment.doctorName)
        }
        if (appointment?.test) {
          setTest(appointment.test)
          form.setValue("test", appointment.test)
        }
      }
    }
    fetchDoctorName()
  }, [form])

  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    let formData;
    if (values.identificationDocument && values.identificationDocument.length > 0) {
      const blobFile = values.identificationDocument[0];
      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", blobFile.name);
    }
    try {
      const patientData = {
        userId: user.$id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthDate: new Date(values.birthDate),
        gender: values.gender,
        address: values.address,
        occupation: values.occupation,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        primaryPhysician: values.primaryPhysician,
        test: values.test,
        insuranceProvider: values.insuranceProvider,
        insurancePolicyNumber: values.insurancePolicyNumber,
        allergies: values.allergies,
        currentMedication: values.currentMedication,
        familyMedicalHistory: values.familyMedicalHistory,
        pastMedicalHistory: values.pastMedicalHistory,
        identificationType: values.identificationType,
        identificationNumber: values.identificationNumber,
        identificationDocument: formData || undefined,
        privacyConsent: values.privacyConsent,
        treatmentConsent: values.treatmentConsent,
        disclosureConsent: values.disclosureConsent,
      };
      const patient = await registerPatient(patientData);
      if (patient) setShowSuccessModal(true);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const handleSuccessOk = async () => {
    setShowSuccessModal(false);
    const appointment = await getAppointmentByUserId(user.$id);
    if (!appointment) throw new Error("Appointment not found");
    let institutionDoc = null;
    if (appointment.hospitalId) {
      institutionDoc = await getHospitalById(appointment.hospitalId);
    } else if (appointment.labId) {
      institutionDoc = await getLabById(appointment.labId);
    }
    const appointmentData = {
      timestamp: appointment.timestamp ?? new Date().toISOString(),
      hospitalId: appointment.hospitalId,
      labId: appointment.labId,
      doctorName: appointment.doctorName,
      test: appointment.test,
    };
    if (!institutionDoc) throw new Error("Institution not found");
    const institution = {
      name: institutionDoc.name,
      address: institutionDoc.address,
    };
    await generateReceiptPDF(user, "/assets/icons/logo-full.png", appointmentData, institution);
    router.push(`/patients/${user.$id}/directions`);
  };

  // Theme classes for fields and labels
  const inputClass = "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 h-11 px-9 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
  const labelClass = "text-gray-700 font-semibold mb-1";
  const sectionTitle = "text-blue-700 font-extrabold text-2xl";
  const amberSectionTitle = "text-amber-700 font-extrabold text-2xl";
  const checkboxLabel = "text-gray-700 font-medium";
  const checkboxClass = "accent-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500";
  // const datePickerInputClass = "w-full h-11 px-9 rounded-md text-sm transition-all bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
          <section>
            <p className={sectionTitle}>Personal Information</p>
          </section>
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Full name"
            placeholder="Patient name"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
            className={inputClass}
            labelClass={labelClass}
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
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.PHONE_INPUT}
              control={form.control}
              name="phone"
              label="Phone Number"
              placeholder="(91) 123-456-7890"
              // className={inputClass}
              labelClass={labelClass}
            />
          </div>

          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="birthDate"
              label="Date of Birth"
              // className={datePickerInputClass}
              // labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.SKELETON}
              control={form.control}
              name="gender"
              label="Gender"
              labelClass={labelClass}
              renderSkeleton={(field) => (
                <FormControl>
                  <RadioGroup className="flex h-11 gap-6 xl:justify-between" onValueChange={field.onChange} defaultValue={field.value}>
                    {GenderOptions.map((option) => (
                      <div key={option} className="flex h-full flex-1 items-center gap-2 rounded-md border border-dashed border-gray-200 bg-gray-100 p-3 ">
                        <RadioGroupItem value={option} id={option} className="h-4 w-4 shrink-0 rounded-full border border-blue-700 data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700 " />
                        <Label htmlFor={option} className="cursor-pointer text-gray-700">{option}</Label>
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
              placeholder="14th Street Delhi"
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="occupation"
              label="Occupation"
              placeholder="Software Engineer"
              className={inputClass}
              labelClass={labelClass}
            />
          </div>
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="emergencyContactName"
              label="Emergency Contact Person"
              placeholder="Guardian's Name"
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.PHONE_INPUT}
              control={form.control}
              name="emergencyContactNumber"
              label="Emergency Contact Number"
              placeholder="(91) 123-456-7890"
              // className={inputClass}
              labelClass={labelClass}
            />
          </div>

          <section>
            <p className={sectionTitle}>Medical Information</p>
          </section>
          <div className="flex flex-col gap-6 xl:flex-row">
            {doctorName ? (
              <CustomFormField
                fieldType={FormFieldType.READONLY}
                control={form.control}
                name="primaryPhysician"
                label="Primary Physician"
                className={inputClass}
                labelClass={labelClass}
              />
            ) : test ? (
              <CustomFormField
                fieldType={FormFieldType.READONLY}
                control={form.control}
                name="test"
                label="Test Prescribed"
                className={inputClass}
                labelClass={labelClass}
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
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="insurancePolicyNumber"
              label="Insurance Policy Number"
              placeholder="XXX-1234-XXX"
              className={inputClass}
              labelClass={labelClass}
            />
          </div>
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="allergies"
              label="Allergies (if any)"
              placeholder="ex: Peanuts, Cilantro , Pollen"
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="currentMedication"
              label="Current Medication (if any)"
              placeholder="ex: Paracetamol (500mg) etc"
              className={inputClass}
              labelClass={labelClass}
            />
          </div>
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="familyMedicalHistory"
              label="Family Medical History (if any)"
              placeholder="ex: GrandFather had Vitiligo"
              className={inputClass}
              labelClass={labelClass}
            />
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="pastMedicalHistory"
              label="Past Medical History (if any)"
              placeholder="ex: Had Typhoid before 2 weeks"
              className={inputClass}
              labelClass={labelClass}
            />
          </div>

          <section>
            <p className={amberSectionTitle}>Identification and Verification</p>
          </section>
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="identificationType"
            label="Identification Type"
            placeholder="Select Identification Type"
            className={inputClass}
            labelClass={labelClass}
          >
            {IdentificationTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200">
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
              className={inputClass}
              labelClass={labelClass}
            />
          </div>
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.SKELETON}
              control={form.control}
              name="identificationDocument"
              label="Scanned copy of identification document"
              labelClass={labelClass}
              className={inputClass} // Pass your light theme input class
              renderSkeleton={(field) => (
      <FormControl>
        <div className="w-full p-0">
          <div className="
            bg-white border border-gray-200 rounded-xl
            p-6 flex flex-col items-center justify-center gap-3
            shadow-sm transition
            hover:shadow-md
            ">
          <FileUpload
            files={field.value}
            onChange={field.onChange}
            className="
              flex flex-col items-center justify-center w-full
              bg-white border-0 shadow-none
              text-gray-700
              min-h-[120px]
              "
          />
          {/* Optional: Show a note or preview below */}
          {field.value && field.value.length > 0 && (
            <div className="mt-3 text-sm text-gray-500 text-center">
              Uploaded: {field.value[0].name}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Accepted: SVG, PNG, JPG, GIF (max 800x400)
        </div>
      </div>
    </FormControl>

              )}
            />
          </div>

          <section>
            <p className={amberSectionTitle}>Consent and Privacy</p>
          </section>

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="treatmentConsent"
            label="I consent to treatment"
            labelClass={checkboxLabel}
            className= {checkboxClass}
          />
          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="disclosureConsent"
            label="I consent to disclosure"
            labelClass={checkboxLabel}
            className= {checkboxClass}
          />
          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="privacyConsent"
            label="I consent to privacy policy"
            labelClass={checkboxLabel}
            className= {checkboxClass}
          />
          <div className="pt-4">
            <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
          </div>
        </form>
      </Form>
      <SuccessAppointment userId={user.$id} open={showSuccessModal} onOk={handleSuccessOk} />
    </>
  );
};

export default PatientRegisterForm;
