import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const card = z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    screenshot: z.string().optional(),
    stage: z.enum(['live', 'wip']).default('live'),
    tags: z.array(z.string()).default([]),
    live_url: z.string().optional(),
    github_url: z.string().optional(),
    problem: z.string().optional(),
    approach: z.string().optional(),
    result: z.string().optional(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string().default('') })).default([]),
});

export const collections = {
    projects: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/projects' }), schema: card }),
    prints: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/prints' }), schema: card }),
    tags: defineCollection({ loader: file('./src/content/tags.yaml'), schema: z.object({ title: z.string() }) }),
};
