import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function solveMathProblem(
  query: string, 
  isThinkingMode: boolean = false,
  isSearchEnabled: boolean = false,
  image?: { data: string; mimeType: string }
): Promise<AIResponse> {
  const model = isThinkingMode ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  
  const systemInstruction = `You are MasterCalc AI, a world-class math tutor and professional computational engine specialized in advanced mathematics. 
  You combine the capabilities of top-tier tools like Julius AI, Mathos AI, and MathGPT to provide accurate, step-by-step solutions.
  
  Your core expertise covers the following advanced topics (JEE/Advanced Level):
  1. Sets, Relations, and Functions (Domain, Range, Types of functions).
  2. Complex Numbers and Quadratic Equations (Argand plane, Roots, Discriminant).
  3. Matrices and Determinants (Linear Algebra, Inverse, Cramer's Rule).
  4. Permutations and Combinations (Factorials, Arrangements, Selections).
  5. Mathematical Induction (Principle of Induction).
  6. Binomial Theorem and its Applications (General term, Coefficients).
  7. Sequences and Series (AP, GP, HP, Special series).
  8. Limit, Continuity, and Differentiability (Calculus, L'Hopital's Rule).
  9. Integral Calculus (Definite and Indefinite, Area under curves).
  10. Differential Equations (Order, Degree, Variable separable, Linear).
  11. Coordinate Geometry (Lines, Circles, Conic Sections - Parabola, Ellipse, Hyperbola).
  12. Three Dimensional Geometry (Lines and Planes in space).
  13. Vector Algebra (Dot product, Cross product, Scalar triple product).
  14. Statistics and Probability (Mean, Variance, Bayes' Theorem, Distributions).
  15. Trigonometry (Identities, Equations, Inverse Trigonometric Functions).
  
  Guidelines:
  - Always provide a final concise 'answer'.
  - Provide a detailed, step-by-step 'explanation' in Markdown.
  - Be thorough but concise to stay within token limits.
  - Use LaTeX formatting for mathematical expressions (e.g., $x^2$, $\int f(x) dx$).
  - For complex problems, break down the logic into clear, understandable parts.
  - If a problem is ambiguous, state your assumptions clearly.`;

  const parts: any[] = [{ text: query || "Solve the math problem in this image." }];
  
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: "The final numerical or short answer to the problem.",
          },
          explanation: {
            type: Type.STRING,
            description: "A clear, step-by-step explanation of how the answer was reached, formatted in Markdown.",
          },
          visualization: {
            type: Type.OBJECT,
            description: "Optional visualization data if the problem involves geometric shapes, complex numbers (Argand plane), or functions.",
            properties: {
              type: {
                type: Type.STRING,
                enum: ["geometry", "argand", "function"],
                description: "The type of visualization.",
              },
              data: {
                type: Type.OBJECT,
                description: "The data for the visualization. For geometry, include 'shape' (circle, triangle, rectangle) and 'params'. For argand, include 're' and 'im' (or an array of them). For function, include 'expression'.",
              },
            },
            required: ["type", "data"],
          },
        },
        required: ["answer", "explanation"],
      },
      maxOutputTokens: 16384,
      ...(isThinkingMode && {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      }),
      ...(isSearchEnabled && {
        tools: [{ googleSearch: {} }],
      }),
    },
  });

  try {
    const text = response.text;
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return {
      answer: "Error",
      explanation: "I encountered an error while trying to solve this problem. Please try again.",
    };
  }
}
