// @ts-expect-error: swagger-jsdoc has no types
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Machine Manager User API",
      version: "1.0.0",
      description: `
Welcome to the **Vending Machine Manager User API** 👋

This API lets you log in, view your machines, run scripts, and check job results.  
Follow these simple steps:

### 🔑 Workflow for Users
1. **Login**  
   - Call \`POST /api/login\` with your email & password.  
   - Copy the token from the response.

2. **Authorize**  
   - Click the **Authorize** button in Swagger UI.  
   - Paste your token (format: \`Bearer <your_token>\`).  
   - Now all secured endpoints will work.

3. **Get Machines**  
   - Call \`GET /api/machines\`.  
   - This gives you a list of your machines and available scripts.

4. **Run a Script**  
   - Call \`POST /api/jobs\` with:  
     - \`agentId\` (the machine ID)  
     - \`scriptId\` (the script you want to run)  
   - A new job is created.

5. **Check Job Status**  
   - Call \`GET /api/jobs/{id}\` with the job ID from step 4.  
   - You’ll see the script’s output (\`stdout\`, \`stderr\`).

---
💡 **Tip**: Start with Login → Authorize → Machines → Jobs → Job details.
`,
    },
    tags: [
      {
        name: "Auth",
        description: "Endpoints for logging in and getting your token.",
      },
      {
        name: "Machines",
        description: "Endpoints to list your machines and scripts.",
      },
      {
        name: "Jobs",
        description: "Endpoints to run scripts on machines and check job status.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Point only to user API route files
  apis: [
    "./app/api/login/route.ts", 
    "./app/api/machines/route.ts",
    "./app/api/jobs/route.ts",
    "./app/api/jobs/[[]id[]]/route.ts" // escape dynamic route
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
