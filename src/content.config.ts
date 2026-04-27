import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    canonical: z.string().url(),
    ogImage: z.string().url().optional(),
    section: z.enum(["news", "learn"]),
    published: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

export const collections = { posts };
