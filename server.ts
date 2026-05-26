import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Initialize Gemini client with tracking headers
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Ensure API key exists before call
function checkApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is missing on the server. Please add it to your secrets panel.'
    });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // ENDPOINT 1: General Career Advisor Chat Flow
  // -------------------------------------------------------------
  app.post('/api/chat', checkApiKey, async (req, res) => {
    const { profile, messages, module } = req.body;

    try {
      const studentContext = profile
        ? `Student Academic Profile:
- Major: ${profile.major}
- Year level: ${profile.year}
- Experience: ${profile.experience || 'Not provided'}
- Strengths & Skills: ${profile.strengths || 'Not provided'}
- Goals/Intentions: ${profile.intentions || 'Not provided'}`
        : 'Student Profile: (Not yet set)';

      const sysInstruction = `You are an elite, highly empathetic, and professional University Career Advisor assisting undergraduates and fresh graduates. 
Your goal is to guide students to practical, step-by-step career milestones.

Currently, the user is talking in the [${module || 'General'}] section of the application.
Always tailor advice to their Academic Year (${profile?.year || 'Freshman'} level). For example, sophomore advice should focus on personal projects/industry research, whereas senior advice should focus on application strategies, target templates, or negotiation.

Guidelines:
1. Provide structured, actionable checklists.
2. Be student-friendly: encouraging yet highly objective ("university final project assignment quality").
3. Use Markdown tables, bold key headers, and rich bullet points.
4. Keep the output focused, directly answering their core questions or worries. Avoid generic generic boilerplate.

${studentContext}`;

      // Format historical messages for Gemini content chat format:
      const conversationHistoryStr = messages
        .map((msg: any) => `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `Here is our conversation history so far:
${conversationHistoryStr}

Advisor, please generate your next response to the student's comments. Deliver structured, friendly, and deeply valuable insights:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        },
      });

      res.json({ content: response.text });
    } catch (error: any) {
      console.error('Error in general chat:', error);
      res.status(500).json({ error: error.message || 'Error executing career advisor response.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 2: Specific Career Analyzer (Path Prediction)
  // -------------------------------------------------------------
  app.post('/api/career/analyze', checkApiKey, async (req, res) => {
    const { profile } = req.body;

    if (!profile || !profile.major) {
      return res.status(400).json({ error: 'Please furnish key profile attributes (such as Major) first!' });
    }

    try {
      const sysInstruction = `You are a specialist Career Consultant matching graduating students to professional paths. 
Analyze the student's credentials, major, strengths, and goals. Output a highly curated portfolio of exactly 3-4 specific job paths with accurate stats. No generic descriptions.`;

      const prompt = `Analyze this college student profile and return matching career directions:
Major: ${profile.major}
Current Academic Year: ${profile.year}
Previous Work/Experience: ${profile.experience || 'None listed'}
Skillsets & Strengths: ${profile.strengths || 'None listed'}
Interests/Intentions: ${profile.intentions || 'None listed'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'A list of 3-4 professional career path predictions.',
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Job role title, e.g., "Associate Frontend Engineer"' },
                matchScore: { type: Type.INTEGER, description: 'Percentage score representing how strong the student candidate matches (0 to 100).' },
                description: { type: Type.STRING, description: 'Explain specifically why this matches their college major, year, and previous coursework.' },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Top 4 crucial hard and soft skills they need to master.' },
                recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: '1-2 reputable industry certificates or portfolio milestones if applicable.' },
                salaryRange: { type: Type.STRING, description: 'Realistic starting salary range appropriate for entry-level positions, e.g., "$70,000 - $95,000/yr"' },
                marketOutlook: {
                  type: Type.STRING,
                  description: 'Must match one of: "Increasingly Growing" | "Highly Stable" | "Evolving / Shifting"'
                }
              },
              required: ['title', 'matchScore', 'description', 'requiredSkills', 'recommendedCertifications', 'salaryRange', 'marketOutlook']
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || '[]');
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in analyze career:', error);
      res.status(500).json({ error: error.message || 'Failed to trigger career paths generator.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 3: Specific Resume Auditor & Job Matcher
  // -------------------------------------------------------------
  app.post('/api/resume/review', checkApiKey, async (req, res) => {
    const { profile, resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter or paste your resume content!' });
    }

    try {
      const prompt = `Review the undergraduate resume text and suggest fixes and job matches based on the following:
Student Background Context:
- Major: ${profile?.major || 'General'}
- Year: ${profile?.year || 'Freshman'}
- Declared Intentions: ${profile?.intentions || 'None provided'}

Resume Text to Audit:
---
${resumeText}
---`;

      const sysInstruction = `You are a strict, top-tier HR recruiter and resume consultant.
Review the provided raw resume text. Identify grammatical faults, weak verbs, passive descriptions, formatting omission issues, and structural gaps.
Also, recommend exactly 2-3 specific real-world entry-level target jobs that match this resume. Ensure matches are realistic for their undergraduate level.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              defects: {
                type: Type.ARRAY,
                description: 'A structural list of issues identified in the resume text.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING, description: 'Must be exactly: "high" | "medium" | "low"' },
                    originalText: { type: Type.STRING, description: 'The weak phrases or sections to be edited. Be very literal.' },
                    issue: { type: Type.STRING, description: 'What exactly makes this text weak? (e.g. passive verbs, lacks numerical achievements, ambiguous dates)' },
                    suggestion: { type: Type.STRING, description: 'A concrete rephrasing suggestion or improvement advice.' }
                  },
                  required: ['severity', 'originalText', 'issue', 'suggestion']
                }
              },
              jobMatches: {
                type: Type.ARRAY,
                description: 'Matched entry-level target roles.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'The target job role' },
                    company: { type: Type.STRING, description: 'A realistic target employers type or examples' },
                    compatibility: { type: Type.INTEGER, description: 'Compatibility percentage 0-100' },
                    keyFit: { type: Type.STRING, description: '1-2 sentences explaining why they are compatible' },
                    gapsToBridge: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Gaps identified in the resume that must be filled before applying' },
                    applicationTip: { type: Type.STRING, description: 'Insider tip to make their resume stand out for this specific job' }
                  },
                  required: ['title', 'company', 'compatibility', 'keyFit', 'gapsToBridge', 'applicationTip']
                }
              }
            },
            required: ['defects', 'jobMatches']
          }
        }
      });

      const parsedData = JSON.parse(response.text || '{"defects": [], "jobMatches": []}');
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in resume auditing:', error);
      res.status(500).json({ error: error.message || 'Defecparser failure during audit.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 4: Mock Interview Session Initializer
  // -------------------------------------------------------------
  app.post('/api/interview/start', checkApiKey, async (req, res) => {
    const { profile, jobTitle, companyName } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: 'Please supply a target job position to begin interview simulation!' });
    }

    try {
      const prompt = `Construct an interview questions package for:
Target Position: ${jobTitle}
Company: ${companyName || 'General Employer'}

Student Candidate Context:
- Major: ${profile?.major || 'General studies'}
- Year: ${profile?.year || 'Junior'}
- Key Strengths: ${profile?.strengths || 'Not defined'}
- Key Projects/Experience: ${profile?.experience || 'Not defined'}`;

      const sysInstruction = `You are an elite Lead Hiring Director interviewing a fresh college graduate. 
Formulate a professional collection of exactly 4 specific, sequentially logical interview questions.
Questions MUST challenge the candidate with:
1. One general behavioral question (STAR framework format).
2. One domain technical question testing their knowledge in ${profile?.major || 'their field'}.
3. One project scenario question testing how they resolved roadblock challenges.
4. One motivation question testing why they are a high-potential fit for ${companyName || 'this position'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 distinct interview questions sequentially listed.'
              }
            },
            required: ['company', 'jobTitle', 'questions']
          }
        }
      });

      const parsedData = JSON.parse(response.text || '{"company": "", "jobTitle": "", "questions": []}');
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error starting mock interview:', error);
      res.status(500).json({ error: error.message || 'Interview simulation launch failure.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 5: Mock Interview Answer Evaluation
  // -------------------------------------------------------------
  app.post('/api/interview/evaluate-answer', checkApiKey, async (req, res) => {
    const { question, userAnswer, profile, jobTitle } = req.body;

    if (!userAnswer || userAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'Please submit a response to generate evaluation!' });
    }

    try {
      const prompt = `Interview Evaluation Request:
Target Role: ${jobTitle}
Interview Question: "${question}"
Candidate's Answer: "${userAnswer}"

Candidate's Context:
- Major: ${profile?.major || 'General'}
- Year level: ${profile?.year || 'Senior'}`;

      const sysInstruction = `You are a warm list recruiter and tech Lead assessor.
Evaluate the student's mock response on a scale of 0-100.
Point out constructive feedback: what they stated perfectly (e.g. STAR methodology use, action impact), and specific elements they omitted (lack of specific figures, tech depth, or context).
Present a "High-scoring Recommended Response" that reformulates their answer with professional vocabulary and clear structuring. Keep feedback crisp but actionable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.INTEGER, description: 'Evaluation score out of 100.' },
              feedback: { type: Type.STRING, description: 'Empathetic but direct peer review (bullet points preferred).' },
              idealAnswer: { type: Type.STRING, description: 'An outstanding alternative answer the undergraduate could say to impress HR.' }
            },
            required: ['rating', 'feedback', 'idealAnswer']
          }
        }
      });

      const parsedData = JSON.parse(response.text || '{"rating": 75, "feedback": "", "idealAnswer": ""}');
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error evaluating interview answer:', error);
      res.status(500).json({ error: error.message || 'Error processing feedback on answer.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 6: Mock Interview Completion Summary
  // -------------------------------------------------------------
  app.post('/api/interview/summary', checkApiKey, async (req, res) => {
    const { evaluations, jobTitle, companyName, profile } = req.body;

    try {
      const prompt = `Review the completed interview record below to formulate a final performance assessment and summary report.
Job Profile: ${jobTitle} at ${companyName || 'General Employer'}
Candidate Profiles: Major is ${profile?.major} (${profile?.year})

Evaluations Record:
${evaluations.map((ev: any, idx: number) => `\nQ${idx + 1}: ${ev.question}\nStudent Answer: ${ev.userAnswer}\nRating: ${ev.rating}/100\nFeedback: ${ev.feedback}`).join('\n')}`;

      const sysInstruction = `You are a senior recruiter writing an executive interview summary report for a graduate mentorship assignment.
Deliver a final comprehensive overview including cumulative score, highlight strengths, weaknesses, and a structured list of actionable recommendations for future success.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: 'Weighted score of this candidate from 1 to 100.' },
              overallSummary: { type: Type.STRING, description: 'Detailed final breakdown review. Provide comments on core communication, industry-specific knowledge, and tips on body language or response structure.' }
            },
            required: ['overallScore', 'overallSummary']
          }
        }
      });

      const parsedData = JSON.parse(response.text || '{"overallScore": 80, "overallSummary": ""}');
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error during final summary generation:', error);
      res.status(500).json({ error: error.message || 'Error executing overall mock interview summary.' });
    }
  });

  // Configure Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to exact port and host as constrained in instructions
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
