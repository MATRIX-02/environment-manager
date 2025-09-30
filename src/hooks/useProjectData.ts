import { useState, useCallback } from "react";
import {
	Repository,
	TeamMembers,
	ProjectData,
	EnvVar,
	DockerConfig,
	TeamRole,
	TeamMember,
} from "@/types";

const initialTeamMembers: TeamMembers = {
	Frontend: [],
	Backend: [],
	"AI/ML": [],
	DevOps: [],
};

const initialRepositories: Record<string, Repository> = {
	// "User End React": {
	//   url: "https://github.com/Easeworkai-com/Easework_User_End_React",
	//   branch: "main",
	//   envVars: [],
	//   dockerConfigs: [],
	// },
};

export const useProjectData = () => {
	const [projectName, setProjectName] = useState<string>("");
	const [repositories, setRepositories] =
		useState<Record<string, Repository>>(initialRepositories);
	const [teamMembers, setTeamMembers] =
		useState<TeamMembers>(initialTeamMembers);

	const updateProjectName = useCallback((name: string) => {
		setProjectName(name);
	}, []);

	const addRepository = useCallback(
		(name: string, url: string) => {
			if (repositories[name]) {
				throw new Error("A repository with this name already exists");
			}

			setRepositories((prev) => ({
				...prev,
				[name]: {
					url,
					branch: "main",
					envVars: [],
					dockerConfigs: [],
				},
			}));
		},
		[repositories]
	);

	const deleteRepository = useCallback((name: string) => {
		setRepositories((prev) => {
			const newRepos = { ...prev };
			delete newRepos[name];
			return newRepos;
		});
	}, []);

	const updateRepositoryBranch = useCallback(
		(repoName: string, branch: string) => {
			setRepositories((prev) => ({
				...prev,
				[repoName]: {
					...prev[repoName],
					branch,
				},
			}));
		},
		[]
	);

	const addEnvVar = useCallback((repoName: string, envVar: EnvVar) => {
		setRepositories((prev) => {
			const repo = prev[repoName];
			if (!repo) return prev;

			const existingIndex = repo.envVars.findIndex(
				(v) => v.name === envVar.name
			);
			const newEnvVars = [...repo.envVars];

			if (existingIndex >= 0) {
				newEnvVars[existingIndex] = envVar;
			} else {
				newEnvVars.push(envVar);
			}

			return {
				...prev,
				[repoName]: {
					...repo,
					envVars: newEnvVars,
				},
			};
		});
	}, []);

	const removeEnvVar = useCallback((repoName: string, index: number) => {
		setRepositories((prev) => {
			const repo = prev[repoName];
			if (!repo) return prev;

			const newEnvVars = repo.envVars.filter((_, i) => i !== index);

			return {
				...prev,
				[repoName]: {
					...repo,
					envVars: newEnvVars,
				},
			};
		});
	}, []);

	const parseBulkEnvVars = useCallback(
		(repoName: string, envText: string) => {
			const repo = repositories[repoName];
			if (!repo) return;

			const lines = envText.split("\n");
			const newEnvVars: EnvVar[] = [];

			lines.forEach((line) => {
				line = line.trim();
				if (!line || line.startsWith("#")) return;

				const parts = line.split("=");
				if (parts.length >= 2) {
					const name = parts[0].trim();
					const value = parts.slice(1).join("=").trim();
					newEnvVars.push({ name, value });
				}
			});

			setRepositories((prev) => ({
				...prev,
				[repoName]: {
					...repo,
					envVars: newEnvVars,
				},
			}));
		},
		[repositories]
	);

	const addDockerConfig = useCallback(
		(repoName: string, config: Omit<DockerConfig, "id">) => {
			setRepositories((prev) => {
				const repo = prev[repoName];
				if (!repo) return prev;

				const newConfig: DockerConfig = {
					...config,
					id: Date.now(),
				};

				return {
					...prev,
					[repoName]: {
						...repo,
						dockerConfigs: [...repo.dockerConfigs, newConfig],
					},
				};
			});
		},
		[]
	);

	const updateDockerConfig = useCallback(
		(repoName: string, index: number, config: DockerConfig) => {
			setRepositories((prev) => {
				const repo = prev[repoName];
				if (!repo) return prev;

				const newConfigs = [...repo.dockerConfigs];
				newConfigs[index] = config;

				return {
					...prev,
					[repoName]: {
						...repo,
						dockerConfigs: newConfigs,
					},
				};
			});
		},
		[]
	);

	const deleteDockerConfig = useCallback((repoName: string, index: number) => {
		setRepositories((prev) => {
			const repo = prev[repoName];
			if (!repo) return prev;

			const newConfigs = repo.dockerConfigs.filter((_, i) => i !== index);

			return {
				...prev,
				[repoName]: {
					...repo,
					dockerConfigs: newConfigs,
				},
			};
		});
	}, []);

	const addTeamMember = useCallback((role: TeamRole, member: TeamMember) => {
		setTeamMembers((prev) => ({
			...prev,
			[role]: [...prev[role], member],
		}));
	}, []);

	const removeTeamMember = useCallback((role: TeamRole, index: number) => {
		setTeamMembers((prev) => ({
			...prev,
			[role]: prev[role].filter((_, i) => i !== index),
		}));
	}, []);

	const exportData = useCallback((): ProjectData => {
		return {
			repositories,
			teamMembers,
			projectName,
			exportDate: new Date().toISOString(),
		};
	}, [repositories, teamMembers, projectName]);

	const importData = useCallback((data: ProjectData) => {
		if (data.repositories) {
			// Ensure dockerConfigs exists for backward compatibility
			const cleanedRepos: Record<string, Repository> = {};
			Object.keys(data.repositories).forEach((key) => {
				cleanedRepos[key] = {
					...data.repositories[key],
					dockerConfigs: data.repositories[key].dockerConfigs || [],
				};
			});
			setRepositories(cleanedRepos);
		}

		if (data.teamMembers) {
			setTeamMembers(data.teamMembers);
		}

		if (data.projectName) {
			setProjectName(data.projectName);
		}
	}, []);

	return {
		projectName,
		repositories,
		teamMembers,
		updateProjectName,
		addRepository,
		deleteRepository,
		updateRepositoryBranch,
		addEnvVar,
		removeEnvVar,
		parseBulkEnvVars,
		addDockerConfig,
		updateDockerConfig,
		deleteDockerConfig,
		addTeamMember,
		removeTeamMember,
		exportData,
		importData,
	};
};
