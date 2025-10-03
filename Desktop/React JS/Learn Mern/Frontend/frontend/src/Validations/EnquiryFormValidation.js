import { z } from "zod";

export const EnquiryFormValidation = z.object({
  username: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
    
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
    
  phone_no: z
    .string()
    .length(10, { message: "Mobile number must be exactly 10 digits" }),
});