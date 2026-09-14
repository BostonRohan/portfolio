# Personal Portfolio — Surface Brief

## Job and audience

- A public personal site for people who want to understand Boston as a person, maker, and ongoing work in progress—not only evaluate a résumé.
- The visitor mode is **Experience**: the site should feel like entering a living record, with work and personality visible immediately.

## Outcome and proof

- The first visit should answer three questions quickly: who Boston is, what he is working on, and what his life has looked like lately.
- The daily record is the core proof. It combines public-safe automated signals with selected human-made material: coding activity, AI usage, fitness, music, anime/film/video activity, projects, places or routines when appropriate, and occasional writing or images.
- Work and experience remain visible from the first page rather than being hidden behind a separate résumé path.
- The site earns authenticity through real artifacts, real patterns, and specific relationships—not invented journal copy or decorative “personal” labels.

## Selected direction

- **Journal-informed personal archive:** use the visual evidence of Boston’s actual journal—warm paper, graphite, imperfect marks, lists, underlines, arrows, and marginal notes—as a source of texture and typography, without pretending the website is a literal notebook.
- The composition should remain related to the current site: a clear landing experience, recognizable navigation, visible work/experience, and a direct contact path. The redesign should add life and irregularity, not discard the site’s useful clarity.
- The first viewport opens on the present: Boston’s identity, current work, a compact “today” snapshot, and a visual artifact or handwriting fragment. It should feel like a page with a pulse, not a dashboard hero.
- The main visitor path moves from today → work and experience → interests and recurring signals → people and companions → remembered.
- The daily record is the signature interaction: visitors can move through individual days and see the signals available for that date. Quiet days are valid and should not be filled with fabricated prose.
- Use asymmetry, varied scale, actual images/scans, handwritten annotations, and occasional interruptions in the grid to create personality. Avoid fake notebook chrome, excessive labels, symmetrical card grids, and generic “AI-generated” journal language.

## Scope and boundaries

- Target: the public homepage and its daily-record experience, with supporting work, experience, interests, people/companions, remembered, and contact sections.
- Breadth: production-ready responsive web surface, with the homepage as the primary entry point and daily records as navigable content.
- Automated data should be the default source of daily content wherever a public-safe API or authorized personal integration can provide it.
- Manual input should be optional and lightweight: a short public note, image, journal scan, or other artifact when Boston chooses to publish one. The site must remain meaningful on days with no manual entry.
- Private photos, voice memos, unpublished journal pages, and other private material should simply be absent from the public site. Do not expose provenance labels such as “private source,” “from archive,” or “derived from voice memo.”
- Mom and Mikey belong in the present-life layer. Grandma and Sasha belong in the remembered layer, with space for photographs and personal artifacts when provided.
- Keep factual existing work, experience, contact behavior, and working integrations intact unless a later implementation decision explicitly changes them.
- Anti-goals: a productivity dashboard, a quantified-self spectacle, a fake scrapbook, a generic personal-brand template, or a site that pressures Boston to perform a meaningful thought every day.

## States and ranges

- A day may contain many signals, a few signals, a public note, an image/artifact, or only a quiet timestamp.
- Data sources may be unavailable, delayed, empty, or partially authorized. Each source needs a graceful absent state; missing data should not look like a broken page.
- Daily records should support dense days without becoming a wall of cards, and sparse days without visible emptiness anxiety.
- The archive should scale over years. It needs date navigation and a way to browse patterns without replacing the day-by-day view with a monthly dashboard.

## Interaction and layout

- Homepage hierarchy: identity/current work → today’s record → selected work/experience → life signals and interests → people/companions → remembered → contact.
- Daily records should read as one composed entry with multiple evidence types, not as unrelated provider widgets. Source names can be subtle context, but the life event or activity should lead.
- Use a flexible editorial layout: one strong anchor, a few smaller supporting signals, and occasional full-bleed or offset artifacts. Do not make every module the same size or shape.
- Handwriting should appear as a real asset: annotations, headings, marginal notes, or image-based fragments. Do not use a generated handwriting font for all body copy.
- Responsive behavior should preserve the daily sequence and emotional hierarchy. On small screens, collapse the composition into a clear chronological/reading order rather than shrinking a desktop dashboard.
- Motion should be restrained and purposeful: date transitions, artifact reveals, and subtle signal updates can make the record feel alive; avoid constant animation.

## Constraints and open decisions

- Platform: existing Astro 5 site with React/Svelte/Tailwind conventions and current API utilities. Preserve accessibility, performance, SSR behavior, and current working routes.
- Integrations under consideration include GitHub, Claude/Codex usage where safely available, Apple Fitness/Health data through an authorized bridge, AniList, Last.fm, Letterboxd or another media source, YouTube, and future personal signals. Integrations should be added incrementally behind a normalized daily-event model rather than hard-coded into the layout.
- Real photos of Mom, Mikey, Grandma, and Sasha, album artwork, and additional journal scans can be added later as authored assets. The design should reserve meaningful image space without inventing those images now.
- The exact handwriting treatment, source priority when several signals compete, and first set of live integrations remain implementation decisions.
- No public privacy explanation is needed. The site’s curation should communicate its boundary naturally.
