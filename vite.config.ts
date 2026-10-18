import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const USER_API_KEY = 'AIzaSyDWeTXjVifKoi0C3OKqyWNIixE-p7RQDwQ';

function geminiApiPlugin() {
  return {
    name: 'gemini-api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/generate', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const { command, action, activeFile, existingCode, errorContext } = JSON.parse(body || '{}');
            const { GoogleGenAI, Type } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: USER_API_KEY });

            const isFix = action === 'FIX' || !!errorContext || (command && /(fix|bug|broken|crash|error|repair|heal|not working)/i.test(command));
            const isChange = action === 'CHANGE' || (existingCode && /(change|modify|tweak|update|add|make|replace|switch|turn|increase|decrease)/i.test(command));

            let systemInstruction = `
              You are the Aryan App Maker Autonomous AI Engine with Self-Repair and Dynamic Adaptation capabilities.
              
              CRITICAL STANDARDS:
              1. Always return a self-contained 'index.html' with full HTML5, Tailwind CSS via <script src="https://cdn.tailwindcss.com"></script>, and complete vanilla JavaScript.
              2. The app must be 100% real, runnable, interactive, and responsive on mobile and desktop.
              3. Never leave placeholders or comments like '// TODO'. Write all code completely.
              4. Return valid JSON matching the schema.
            `;

            let userPromptText = '';

            if (isFix && existingCode) {
              systemInstruction += `
              MODE: AUTONOMOUS SELF-REPAIR & HEALING
              Your task is to analyze the existing code and the reported runtime error/bug, identify the exact defect, and surgically heal the code.
              Preserve all working features, styling, and game mechanics while fixing the bug.
              In your explanation, state exactly what was diagnosed and fixed.
              `;
              userPromptText = `AUTONOMOUS SELF-REPAIR REQUEST:
Bug/Fix Instruction: ${command || 'Diagnose and fix runtime error'}
${errorContext ? `Runtime Error Details:\n${errorContext}\n` : ''}
Current Existing Code:
\`\`\`html
${existingCode}
\`\`\`
Return the complete, corrected code in 'index.html' and explain the repair.`;
            } else if (isChange && existingCode) {
              systemInstruction += `
              MODE: CODE ADAPTATION & APP EVOLUTION
              The user wants to CHANGE or EVOLVE the existing application according to their instructions.
              Retain all existing features, game loop, UI components, and layout of the app, and apply the user's requested modifications seamlessly.
              In your explanation, summarize what changes were made.
              `;
              userPromptText = `APP CHANGE REQUEST:
User Directive: ${command}
Current Existing Code:
\`\`\`html
${existingCode}
\`\`\`
Apply the requested changes to the existing app, preserving all other functionality. Return the complete updated 'index.html'.`;
            } else {
              userPromptText = `Action: ${action || 'GENERATE'}\nUser Prompt: ${command}\nTarget: ${activeFile?.name || 'index.html'}`;
            }

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: userPromptText,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    explanation: { type: Type.STRING },
                    files: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          content: { type: Type.STRING },
                          language: { type: Type.STRING }
                        },
                        required: ["name", "content", "language"]
                      }
                    }
                  },
                  required: ["explanation", "files"]
                }
              }
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(response.text || '{}');
          } catch (err: any) {
            console.error('Server Gemini API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = (env.GEMINI_API_KEY && env.GEMINI_API_KEY.startsWith('AIza')) ? env.GEMINI_API_KEY : USER_API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        geminiApiPlugin()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
