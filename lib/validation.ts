import { z } from "zod";
export const UserFormValidation = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").max(50, "Name must be at most 50 Characters"),
  email : z.string().email("Invalid email Address"),
  phone : z.string().refine((phone) => /^\+?[1-9]\d{1,14}$/.test(phone) ,"Invalid Phone Number"),
})

// Gender enum
export const GenderEnum = z.enum(["Male", "Female", "Other"]);

export const PatientFormValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),

  birthDate: z
  .union([
    z.string(),
    z.date(),
  ])
  .transform((val) => (typeof val === "string" ? new Date(val) : val)),

  gender: GenderEnum,
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
  occupation: z.string().min(2, "Occupation must be at least 2 characters").max(100),

  emergencyContactName: z.string().min(2).max(50),
  emergencyContactNumber: z.string().min(10).max(15),

  insuranceProvider: z.string().min(2).max(50),
  insurancePolicyNumber: z.string().min(2).max(50),

  allergies: z.string().optional().or(z.literal("")),
  currentMedication: z.string().optional().or(z.literal("")),
  familyMedicalHistory: z.string().optional().or(z.literal("")),
  pastMedicalHistory: z.string().optional().or(z.literal("")),

  identificationType: z.string().optional().or(z.literal("")),
  identificationNumber: z.string().optional().or(z.literal("")),

  // This handles File[] upload correctly in react-hook-form
  identificationDocument: z
    .any()
    .optional()
    .refine(
      (files) => files === undefined || Array.isArray(files),
      "Invalid file format"
    ),

  primaryPhysician: z.string().optional().or(z.literal("")),
  test: z.string().optional().or(z.literal("")),

  treatmentConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Treatment consent required" }),

  disclosureConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Disclosure consent required" }),

  privacyConsent: z
    .boolean()
    .refine((val) => val === true, { message: "Privacy consent required" }),
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