"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return (
    <SwaggerUI
      url="/api/docs"
      docExpansion="none"
      defaultModelsExpandDepth={-1}
      plugins={[
        () => ({
          statePlugins: {
            spec: {
              wrapSelectors: {
                // 👇 explicitly type ori and req as any
                requestFor:
                  (ori: (req: any) => any) =>
                  (req: any) => {
                    // 🔑 Intercept /api/jobs and inject dropdowns
                    if (req.path === "/api/jobs" && req.method === "post") {
                      fetch("/api/machines", {
                        headers: {
                          Authorization:
                            localStorage.getItem("swagger_token") || "",
                        },
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          const machines = data.user.machines || [];
                          const machineOptions = machines.map((m: any) => ({
                            value: m.id,
                            label: m.hostname,
                            scripts: m.scripts.map((s: any) => ({
                              value: s.id,
                              label: s.filename,
                            })),
                          }));

                          // Attach dropdowns into Swagger UI schema dynamically
                          req.requestBody.content[
                            "application/json"
                          ].schema.properties.agentId.enum =
                            machineOptions.map((m: any) => m.value);

                          req.requestBody.content[
                            "application/json"
                          ].schema.properties.scriptId.enum =
                            machineOptions.flatMap((m: any) =>
                              m.scripts.map((s: any) => s.value)
                            );
                        });
                    }
                    return ori(req);
                  },
              },
            },
          },
        }),
      ]}
    />
  );
}
