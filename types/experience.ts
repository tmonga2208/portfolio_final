export interface Experience {
    company: string;
    /** Optional company site — renders the name as a link when present. */
    url?: string;
    /**
     * Wordmark logo. When present it stands in for the company name rather than
     * sitting beside it — the mark already reads as the name, so showing both
     * says it twice. Needs a transparent background.
     */
    logo?: { src: string; width: number; height: number };
    role: string;
    period: string;
    location?: string;
    /** One or two sentences of context: what the team was, what you owned. */
    blurb?: string;
    /** Concrete things shipped. Keep them specific and outcome-shaped. */
    highlights?: string[];
    stack?: string[];
}

export const experienceData: Experience[] = [
    {
        company: "IoT83",
        logo: { src: "/logos/iot83.png", width: 1197, height: 490 },
        role: "Software Engineer Intern",
        period: "February 2026 — Present",
        location: "Gurugram, India",
        blurb:
            "Building internal platform tooling — the identity and access layer the rest of the organization runs on, across both the React front end and the services behind it.",
        highlights: [
            "Built a full-stack internal IAM tool in React and TypeScript over SQL-backed REST APIs, bringing role-based access control to teams across the organization.",
            "Worked with senior engineers to integrate front end and back end, through Git-based review and CI/CD pipelines.",
            "Wrote automated test suites in Selenium (Java) alongside manual testing and Jira bug tracking, reducing regressions before release.",
            "Used GitHub Copilot to move faster, and kept technical documentation in Markdown so the team could pick the work up without me.",
        ],
        stack: ["React", "TypeScript", "REST APIs", "SQL", "Selenium", "Java", "CI/CD", "Jira"],
    },
];
