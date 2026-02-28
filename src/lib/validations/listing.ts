import { z } from "zod";
import { MIN_LISTING_IMAGES, MAX_LISTING_IMAGES } from "@/lib/constants";

export const createListingSchema = z.object({
  card_name: z
    .string()
    .min(2, "Card name must be at least 2 characters")
    .max(100, "Card name must be under 100 characters"),
  card_number: z.string().max(20).optional(),
  card_set: z.string().min(1, "Please select a card set"),
  rarity: z.string().min(1, "Please select a rarity"),
  condition: z.string().min(1, "Please select a condition"),
  language: z.string().min(1, "Please select a language").default("English"),
  is_foil: z.boolean().default(false),
  quantity: z.number().int().min(1).max(100).default(1),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be under 150 characters"),
  description: z.string().max(2000).optional(),
  price: z
    .number()
    .min(1, "Price must be at least ₱1")
    .max(1_000_000, "Price must be under ₱1,000,000"),
  is_negotiable: z.boolean().default(false),
  location_province: z.string().min(1, "Please select a province"),
  location_city: z.string().min(1, "Please enter your city"),
  allows_meetup: z.boolean().default(false),
  meetup_details: z.string().max(300).optional(),
  shipping_options: z
    .array(z.string())
    .min(1, "Please select at least one shipping option"),
  shipping_fee: z.number().min(0).default(0),
  free_shipping: z.boolean().default(false),
  image_paths: z
    .array(z.string())
    .min(MIN_LISTING_IMAGES, `Please upload at least ${MIN_LISTING_IMAGES} photos`)
    .max(MAX_LISTING_IMAGES, `Maximum ${MAX_LISTING_IMAGES} photos allowed`),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
