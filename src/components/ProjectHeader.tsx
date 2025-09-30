import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Search, Moon, Sun } from "lucide-react";
import { ProjectData } from "@/types";

interface ProjectHeaderProps {
	projectName: string;
	onProjectNameChange: (name: string) => void;
	onExportData: () => ProjectData;
	onImportData: (data: ProjectData) => void;
	darkMode: boolean;
	onToggleDarkMode: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
	projectName,
	onProjectNameChange,
	onExportData,
	onImportData,
	darkMode,
	onToggleDarkMode,
}) => {
	const handleImportHTML = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".html";

		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = function (event) {
				try {
					const htmlContent = event.target?.result as string;

					if (
						Object.keys(onExportData().repositories).length > 0 ||
						Object.values(onExportData().teamMembers).some(
							(members) => members.length > 0
						)
					) {
						if (!confirm("This will replace all existing data. Continue?")) {
							return;
						}
					}

					// Create a temporary DOM element to parse HTML
					const parser = new DOMParser();
					const doc = parser.parseFromString(htmlContent, "text/html");

					// Extract project name
					const projectElement = doc.querySelector("h1");
					if (projectElement) {
						const projectText = projectElement.textContent || "";
						const projectMatch = projectText.match(/^(.+?)$/);
						if (projectMatch) {
							onProjectNameChange(projectMatch[1].trim());
						}
					}

					// Parse repositories and their data
					const repositoryCards = doc.querySelectorAll(".repository-card");
					const importedData: any = {
						repositories: {},
						teamMembers: {
							Frontend: [],
							Backend: [],
							"AI/ML": [],
							DevOps: [],
						},
					};

					repositoryCards.forEach((card) => {
						const repoHeader = card.querySelector(".repo-header h3");
						if (!repoHeader) return;

						const repoName =
							repoHeader.textContent?.replace(/.*?\s/, "").trim() || "";
						const repoUrl =
							card.querySelector(".repo-url")?.textContent?.trim() || "";
						const repoBranch =
							card
								.querySelector(".repo-branch")
								?.textContent?.replace("Branch: ", "")
								.trim() || "main";

						// Extract environment variables
						const envElement = card.querySelector(".env-content");
						const envVars: any[] = [];
						if (envElement) {
							const envText = envElement.textContent || "";
							envText.split("\n").forEach((line) => {
								const [name, ...valueParts] = line.split("=");
								if (name && valueParts.length > 0) {
									envVars.push({
										name: name.trim(),
										value: valueParts.join("=").trim(),
									});
								}
							});
						}

						// Extract Docker configurations
						const dockerConfigs: any[] = [];
						const dockerConfigElements =
							card.querySelectorAll(".docker-config");
						dockerConfigElements.forEach((dockerEl, index) => {
							const nameEl = dockerEl.querySelector(".config-header h5");
							const imageEl = dockerEl.querySelector(".image-tag");
							const portEl = dockerEl.querySelector(
								'.detail-item:contains("Port:")'
							);
							const volumeEl = dockerEl.querySelector(
								'.detail-item:contains("Volume:")'
							);

							const dockerEnvEl = dockerEl.querySelector(".env-content.small");
							const dockerEnvVars: any[] = [];
							if (dockerEnvEl) {
								const dockerEnvText = dockerEnvEl.textContent || "";
								dockerEnvText.split("\n").forEach((line) => {
									const [name, ...valueParts] = line.split("=");
									if (name && valueParts.length > 0) {
										dockerEnvVars.push({
											name: name.trim(),
											value: valueParts.join("=").trim(),
										});
									}
								});
							}

							if (nameEl && imageEl) {
								dockerConfigs.push({
									id: Date.now() + index,
									name: nameEl.textContent?.trim() || "",
									image: imageEl.textContent?.trim() || "",
									port:
										portEl?.textContent?.replace("Port:", "").trim() ||
										undefined,
									volume:
										volumeEl?.textContent?.replace("Volume:", "").trim() ||
										undefined,
									envVars: dockerEnvVars,
								});
							}
						});

						if (repoName) {
							importedData.repositories[repoName] = {
								url: repoUrl,
								branch: repoBranch,
								envVars: envVars,
								dockerConfigs: dockerConfigs,
							};
						}
					});

					// Parse team members
					const teamRoles = doc.querySelectorAll(".team-role");
					teamRoles.forEach((roleEl) => {
						const roleHeader = roleEl.querySelector("h4");
						if (!roleHeader) return;

						const roleText = roleHeader.textContent || "";
						const roleMatch = roleText.match(/^(.+?)\s*\(/);
						const roleName = roleMatch ? roleMatch[1].trim() : "";

						if (roleName && importedData.teamMembers[roleName]) {
							const memberCards = roleEl.querySelectorAll(".member-card");
							memberCards.forEach((memberEl) => {
								const nameEl = memberEl.querySelector(".member-name");
								const contributionEl = memberEl.querySelector(
									".member-contribution"
								);

								if (nameEl) {
									importedData.teamMembers[roleName].push({
										name: nameEl.textContent?.trim() || "",
										contribution:
											contributionEl?.textContent?.trim() || undefined,
									});
								}
							});
						}
					});

					// Import the parsed data
					onImportData(importedData);

					alert("Project data imported successfully from HTML!");
				} catch (error) {
					alert("Error importing HTML file: " + (error as Error).message);
				}
			};
			reader.readAsText(file);
		};

		input.click();
	};

	const handleExportHTML = () => {
		const data = onExportData();
		const projectName = data.projectName || "[Not Provided]";

		// Generate repositories HTML with improved styling
		let reposHTML = "";
		Object.keys(data.repositories).forEach((repoName) => {
			const repo = data.repositories[repoName];

			// Environment variables with copy functionality
			let envVarsHTML = "";
			if (repo.envVars.length > 0) {
				const envText = repo.envVars
					.map((v) => `${v.name}=${v.value}`)
					.join("\n");
				envVarsHTML = `
          <div class="env-section">
            <div class="section-header">
              <h4><i class="fas fa-key"></i> Environment Variables</h4>
              <button class="copy-btn" onclick="copyEnvVars('env-${repoName.replace(
								/\s+/g,
								"-"
							)}')" title="Copy all environment variables">
                <i class="fas fa-copy"></i> Copy All
              </button>
            </div>
            <div class="env-container">
              <pre id="env-${repoName.replace(
								/\s+/g,
								"-"
							)}" class="env-content">${envText}</pre>
            </div>
          </div>`;
			}

			// Docker configurations
			let dockerHTML = "";
			if (repo.dockerConfigs.length > 0) {
				dockerHTML = `
          <div class="docker-section">
            <h4><i class="fab fa-docker"></i> Docker Configurations</h4>
            ${repo.dockerConfigs
							.map(
								(config) => `
              <div class="docker-config">
                <div class="config-header">
                  <h5>${config.name}</h5>
                  <span class="image-tag">${config.image}</span>
                </div>
                <div class="config-details">
                  ${
										config.port
											? `<div class="detail-item"><strong>Port:</strong> ${config.port}</div>`
											: ""
									}
                  ${
										config.volume
											? `<div class="detail-item"><strong>Volume:</strong> ${config.volume}</div>`
											: ""
									}
                  ${
										config.envVars.length > 0
											? `
                    <div class="docker-env">
                      <div class="section-header">
                        <strong>Environment Variables:</strong>
                        <button class="copy-btn small" onclick="copyEnvVars('docker-env-${
													config.id
												}')" title="Copy Docker environment variables">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                      <pre id="docker-env-${
												config.id
											}" class="env-content small">${config.envVars
													.map((v) => `${v.name}=${v.value}`)
													.join("\n")}</pre>
                    </div>
                  `
											: ""
									}
                </div>
              </div>
            `
							)
							.join("")}
          </div>`;
			}

			reposHTML += `
        <div class="repository-card">
          <div class="repo-header">
            <h3><i class="fas fa-code-branch"></i> ${repoName}</h3>
            <div class="repo-meta">
              <span class="repo-url">${repo.url}</span>
              <span class="repo-branch">Branch: ${repo.branch}</span>
            </div>
          </div>
          ${envVarsHTML}
          ${dockerHTML}
        </div>
      `;
		});

		// Generate team members HTML
		let teamHTML = "";
		Object.keys(data.teamMembers).forEach((role) => {
			const members = (data.teamMembers as any)[role];
			if (members.length > 0) {
				teamHTML += `
          <div class="team-role">
            <h4><i class="fas fa-users"></i> ${role} (${members.length})</h4>
            <div class="members-grid">
              ${members
								.map(
									(member: any) => `
                <div class="member-card">
                  <div class="member-name">${member.name}</div>
                  ${
										member.contribution
											? `<div class="member-contribution">${member.contribution}</div>`
											: ""
									}
                </div>
              `
								)
								.join("")}
            </div>
          </div>
        `;
			}
		});

		const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Environment Documentation - ${projectName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 3rem;
            border-radius: 12px;
            margin-bottom: 3rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }

        .header .generated-date {
            font-size: 0.9rem;
            opacity: 0.7;
        }

        .section {
            margin-bottom: 3rem;
        }

        .section-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .repository-card {
            background: white;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .repo-header {
            background: #f8fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }

        .repo-header h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .repo-meta {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.875rem;
            color: #64748b;
        }

        .repo-url {
            font-family: 'JetBrains Mono', monospace;
        }

        .env-section, .docker-section {
            padding: 1.5rem;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .section-header h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.1rem;
            color: #1e293b;
        }

        .copy-btn {
            background: #1e293b;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            transition: all 0.2s;
        }

        .copy-btn:hover {
            background: #334155;
        }

        .copy-btn.small {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }

        .env-container {
            background: #1e293b;
            border-radius: 8px;
            overflow: hidden;
        }

        .env-content {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1.5rem;
            margin: 0;
            white-space: pre-wrap;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            overflow-x: auto;
        }

        .env-content.small {
            padding: 1rem;
            font-size: 0.8rem;
        }

        .docker-config {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border: 1px solid #e2e8f0;
        }

        .config-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .config-header h5 {
            font-size: 1rem;
            font-weight: 600;
        }

        .image-tag {
            background: #1e293b;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: monospace;
        }

        .config-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .detail-item {
            font-size: 0.875rem;
        }

        .docker-env {
            grid-column: 1 / -1;
            margin-top: 1rem;
        }

        .team-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .team-role {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .team-role h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .members-grid {
            display: grid;
            gap: 0.75rem;
        }

        .member-card {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 6px;
            border-left: 3px solid #1e293b;
        }

        .member-name {
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .member-contribution {
            font-size: 0.875rem;
            color: #64748b;
        }

        .success-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s;
        }

        .success-message.show {
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-project-diagram"></i> ${projectName}</h1>
            <div class="subtitle">Project Environment Documentation</div>
            <div class="generated-date">Generated on ${new Date().toLocaleString()}</div>
        </div>

        <div class="section">
            <h2 class="section-title"><i class="fas fa-code-branch"></i> Repositories</h2>
            ${
							reposHTML ||
							'<div style="text-align: center; padding: 2rem; color: #64748b;">No repositories configured</div>'
						}
        </div>

        <div class="section">
            <h2 class="section-title"><i class="fas fa-users"></i> Team Members</h2>
            <div class="team-section">
                ${
									teamHTML ||
									'<div style="text-align: center; padding: 2rem; color: #64748b;">No team members added</div>'
								}
            </div>
        </div>
    </div>

    <div id="successMessage" class="success-message">
        <i class="fas fa-check"></i> Copied to clipboard!
    </div>

    <script>
        function copyEnvVars(elementId) {
            const element = document.getElementById(elementId);
            if (!element) return;

            const text = element.textContent;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showSuccessMessage();
                }).catch(() => {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        }

        function fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showSuccessMessage();
        }

        function showSuccessMessage() {
            const message = document.getElementById('successMessage');
            message.classList.add('show');
            setTimeout(() => {
                message.classList.remove('show');
            }, 2000);
        }
    </script>
</body>
</html>`;

		const blob = new Blob([fullHTML], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${projectName
			.replace(/[^a-z0-9]/gi, "-")
			.toLowerCase()}-documentation-${new Date()
			.toISOString()
			.slice(0, 10)}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 transition-colors">
			<div className="flex items-center justify-between">
				{/* Project Name Input */}
				<div className="flex items-center gap-4 flex-1 max-w-md">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
						<Input
							value={projectName}
							onChange={(e) => onProjectNameChange(e.target.value)}
							placeholder="Enter project name..."
							className="pl-10 border-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 transition-all dark:text-white dark:placeholder-gray-400"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={handleImportHTML}
						className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<Upload className="w-4 h-4 mr-2" />
						Import
					</Button>
					<Button
						onClick={handleExportHTML}
						className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white"
					>
						<FileText className="w-4 h-4 mr-2" />
						Export
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggleDarkMode}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						{darkMode ? (
							<Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
						) : (
							<Moon className="w-4 h-4 text-gray-600" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};
