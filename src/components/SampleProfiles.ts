import { UserProfile } from '../types';

export interface SampleProfileItem {
  name: string;
  avatar: string;
  role: string;
  description: string;
  profile: UserProfile;
  resumeText: string;
}

export const sampleProfiles: SampleProfileItem[] = [
  {
    name: "Alex Peterson",
    avatar: "💻",
    role: "CS Sophomore",
    description: "Computer Science major targeting Software Engineering internships. Strong in web tech, but resume is empty of office work.",
    profile: {
      major: "Computer Science",
      year: "Sophomore",
      experience: "Completed advanced data structures. Built a personal React task-tracking application as a class project. Worked as a campus IT support assistant.",
      strengths: "Programming in TypeScript, Python, and Java. Core knowledge of web development, simple REST APIs, Git. Quick learner.",
      intentions: "Wants to secure a Summer software engineering internship. Prefers tech startups or mid-market companies."
    },
    resumeText: `ALEX PETERSON
alex.peterson@university.edu | (555) 019-2831

EDUCATION
State University, BS in Computer Science (GPA: 3.4) — Expected May 2028
Relevant Coursework: Data Structures, Web Development, Software Engineering 101

EXPERIENCE
Campus IT Support Assistant (Sep 2025 - Present)
* Handled general technical problems for university faculty and students.
* Cleaned computers and fixed routers.
* Talked to a lot of people to help solve their IT troubles.

PROJECTS
Task Tracker React Application (Coursework Project)
* Created a web app for managing school tasks.
* Used React & local storage.
* It works well and my friends liked it.

SKILLS
* Languages: TS, Python, Java
* Tools: Git, VS Code, Windows`
  },
  {
    name: "Emily Chen",
    avatar: "📊",
    role: "Marketing Senior",
    description: "Marketing & Communication major eyeing APM (Associate Product Manager) positions. High GPA, has a digital startup venture.",
    profile: {
      major: "Marketing & Communications",
      year: "Senior",
      experience: "Completed a 3-month Digital Marketing internship at 'Nova Creative Agency'. Run an active online student thrift store on Instagram with over 5,000 followers.",
      strengths: "Data analytics (Google Analytics), social media strategic coordination, collaborative teamwork, high copywriting proficiency, Figma basics.",
      intentions: "Seeking starting graduate Associate Product Manager (APM) or Junior Growth Marketer positions. Keen on tech, education-tech, or lifestyle brands."
    },
    resumeText: `EMILY CHEN
emily.chen@communications.com | (555) 234-5678

EDUCATION
Metro University, BA in Marketing & Communications — May 2026
GPA: 3.85 / 4.0 | Marketing Club Vice President

WORK EXPERIENCE
Nova Creative Agency — Digital Marketing Intern (June 2025 - August 2025)
* Oversaw social media accounts and posted content.
* Analyzed Google Analytics traffic and designed spreadsheets.
* Interacted with 10 brands to coordinate creative mood boards.

Instagram Thrift Business — Founder & Operator (2024 - Present)
* Found and listed vintage clothes on Instagram.
* Had 5,000 followers and did shipping and marketing.
* Earned some good revenue on weekends.

SKILLS
* Analytics: Google Analytics, MS Excel
* Design: Figma, Canva
* Soft Skills: Project Coordination, Oral Communication`
  },
  {
    name: "Marcus Thorne",
    avatar: "🧪",
    role: "BioTech Junior",
    description: "Bio-Medical Science junior exploring Medical Device Sales or Healthcare Consulting. Needs strong help shifting from lab roles.",
    profile: {
      major: "Bio-Medical Science",
      year: "Junior",
      experience: "2-year voluntary lab research assistant in biochemistry department. Assisted in genetic assay preparation and sterile environment management.",
      strengths: "Accurate laboratory workflows, biochem research, statistical software (SPSS), technical document drafting, public speaking.",
      intentions: "Looking to pivot into Commercial Biotech or Healthcare Consulting. Intending to secure field sales or advisory apprentice roles."
    },
    resumeText: `MARCUS THORNE
marcus.thorne@biology.edu | (555) 890-1234

EDUCATION
University of Biotech, BS in Bio-Medical Science — Expected Graduation May 2027
Minor in Chemistry | Chancellor Scholar Merit List (2024, 2025)

RESEARCH & ACADEMIC EXPERIENCES
Department of Biochemistry — Research Fellow Assistant (Jan 2024 - Present)
* Prepared chemical assays and washed glassware in the sterile lab space.
* Recorded research notes into the central laboratory database system.
* Checked that everything conformed with medical standards.

Biomedical Science Club — Academic Coordinator (Aug 2024 - Present)
* Invited 5 scientists to present lectures at biochemical events.
* Handled simple budgets for flyers.

SKILLS & CERTIFICATIONS
* Lab Skills: Biochemistry Assaying, Cell Culture, PCR setups
* Software: SPSS Statistics, MS Office`
  }
];
