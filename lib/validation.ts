import { z } from "zod";
export const UserFormValidation = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").max(50, "Name must be at most 50 Characters"),
  email : z.string().email("Invalid email Address"),
  phone : z.string().refine((phone) => /^\+?[1-9]\d{1,14}$/.test(phone) ,"Invalid Phone Number"),
})

export const PatientFormValidation = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15), // Simple fallback

  primaryPhysician: z.string().optional().or(z.literal("")),
  test: z.string().optional().or(z.literal("")),

  birthDate: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : undefined),
    z.date()
  ),

  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(5).max(500),
  occupation: z.string().min(2).max(500),

  emergencyContactName: z.string().min(2).max(50),
  emergencyContactNumber: z.string().min(10).max(15),

  insuranceProvider: z.string().min(2).max(50),
  insurancePolicyNumber: z.string().min(2).max(50),

  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),

  identificationType: z.string().optional().or(z.literal("")),
  identificationNumber: z.string().optional().or(z.literal("")),

  identificationDocument: z.array(z.instanceof(File)).optional(),

  treatmentConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Consent required" }),

  disclosureConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Consent required" }),

  privacyConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Consent required" }),
});


export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}