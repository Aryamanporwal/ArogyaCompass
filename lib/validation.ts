import { z } from "zod";
export const UserFormValidation = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").max(50, "Name must be at most 50 Characters"),
  email : z.string().email("Invalid email Address"),
  phone : z.string().refine((phone) => /^\+?[1-9]\d{1,14}$/.test(phone) ,"Invalid Phone Number"),
})


export const PatientFormValidation = UserFormValidation.extend({
  name: z.string().min(2, "Username must be at least 2 characters.").max(50, "Name must be at most 50 Characters"),
  email : z.string().email("Invalid email Address"),
  phone : z.string().refine((phone) => /^\+?[1-9]\d{1,14}$/.test(phone) ,"Invalid Phone Number"),
  primaryPhysician: z.string().min(2, "Primary physician name must be valid.").optional(),
})