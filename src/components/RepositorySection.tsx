import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GitBranch, Settings, Database } from "lucide-react";
import { Repository, EnvVar, DockerConfig } from "@/types";
import { EnvironmentVariables } from "./EnvironmentVariables";
import { DockerConfigurations } from "./DockerConfigurations";

interface RepositorySectionProps {
	repositories: Record<string, Repository>;
	selectedRepo: string;
	onSelectedRepoChange: (repo: string) => void;
	onAddRepository: (name: string, url: string) => void;
	onDeleteRepository: (name: string) => void;
	onUpdateRepositoryBranch: (repoName: string, branch: string) => void;
	onAddEnvVar: (repoName: string, envVar: EnvVar) => void;
	onRemoveEnvVar: (repoName: string, index: number) => void;
	onParseBulkEnvVars: (repoName: string, envText: string) => void;
	onAddDockerConfig: (
		repoName: string,
		config: Omit<DockerConfig, "id">
	) => void;
	onUpdateDockerConfig: (
		repoName: string,
		index: number,
		config: DockerConfig
	) => void;
	onDeleteDockerConfig: (repoName: string, index: number) => void;
}

export const RepositorySection: React.FC<RepositorySectionProps> = ({
	repositories,
	selectedRepo,
	onSelectedRepoChange,
	onAddRepository,
	onDeleteRepository,
	onUpdateRepositoryBranch,
	onAddEnvVar,
	onRemoveEnvVar,
	onParseBulkEnvVars,
	onAddDockerConfig,
	onUpdateDockerConfig,
	onDeleteDockerConfig,
}) => {
	const [showAddForm, setShowAddForm] = useState(false);
	const [newRepoName, setNewRepoName] = useState("");
	const [newRepoUrl, setNewRepoUrl] = useState("");
	const [activeSection, setActiveSection] = useState<"env" | "docker">("env");

	const handleSelectRepository = (value: string) => {
		if (value === "add-new") {
			setShowAddForm(true);
			onSelectedRepoChange("");
		} else {
			setShowAddForm(false);
			onSelectedRepoChange(value);
		}
	};

	const handleAddRepository = () => {
		if (!newRepoName.trim() || !newRepoUrl.trim()) {
			alert("Please enter both repository name and URL");
			return;
		}

		try {
			onAddRepository(newRepoName.trim(), newRepoUrl.trim());
			setNewRepoName("");
			setNewRepoUrl("");
			setShowAddForm(false);
			onSelectedRepoChange(newRepoName.trim());
		} catch (error) {
			alert((error as Error).message);
		}
	};

	const handleDeleteRepository = (repoName: string) => {
		if (
			confirm(
				`Are you sure you want to delete "${repoName}" and all its configurations?`
			)
		) {
			onDeleteRepository(repoName);
			if (selectedRepo === repoName) {
				onSelectedRepoChange("");
			}
		}
	};

	const repoOptions = Object.keys(repositories);
	const selectedRepository = selectedRepo ? repositories[selectedRepo] : null;

	if (repoOptions.length === 0 && !showAddForm) {
		return (
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="text-center max-w-md">
					<GitBranch className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						No Repositories Yet
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Start by adding your first repository to manage environment
						variables and Docker configurations.
					</p>
					<Button
						onClick={() => setShowAddForm(true)}
						className="bg-gray-900 hover:bg-gray-800 text-white"
						size="lg"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add First Repository
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold text-foreground">
							Repository Management
						</h1>
						<p className="text-muted-foreground">
							Manage environment variables and Docker configurations
						</p>
					</div>

					{/* Repository Selector */}
					<div className="flex items-center gap-4 text-foreground">
						<div className="w-80">
							<Select
								value={selectedRepo}
								onValueChange={handleSelectRepository}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a repository..." />
								</SelectTrigger>
								<SelectContent className="bg-background">
									{repoOptions.map((repoName) => (
										<SelectItem key={repoName} value={repoName}>
											<div className="flex items-center gap-2 ">
												<GitBranch className="w-4 h-4" />
												{repoName}
											</div>
										</SelectItem>
									))}
									<SelectItem
										value="add-new"
										className="text-gray-900 font-medium"
									>
										<div className="flex items-center gap-2">
											<Plus className="w-4 h-4" />
											Add New Repository
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Add Repository Form */}
				{showAddForm && (
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Add New Repository
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground">
							<div>
								<Label htmlFor="newRepoName" className="text-sm font-medium ">
									Repository Name
								</Label>
								<Input
									id="newRepoName"
									value={newRepoName}
									onChange={(e) => setNewRepoName(e.target.value)}
									placeholder="My Project"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="newRepoUrl" className="text-sm font-medium ">
									Repository URL
								</Label>
								<Input
									id="newRepoUrl"
									value={newRepoUrl}
									onChange={(e) => setNewRepoUrl(e.target.value)}
									placeholder="https://github.com/org/repo"
									className="mt-1"
								/>
							</div>
						</div>
						<div className="flex gap-3 mt-4">
							<Button
								onClick={handleAddRepository}
								className="bg-gray-900 hover:bg-gray-800 text-white"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Repository
							</Button>
							<Button variant="outline" onClick={() => setShowAddForm(false)}>
								Cancel
							</Button>
						</div>
					</div>
				)}

				{/* Repository Details */}
				{selectedRepository && (
					<div className="space-y-8">
						{/* Repository Info */}
						<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
										<GitBranch className="w-5 h-5" />
										{selectedRepo}
									</h2>
									<p className="text-gray-600 dark:text-gray-400 mt-1">
										{selectedRepository.url}
									</p>
								</div>
								<Button
									variant="outline"
									onClick={() => handleDeleteRepository(selectedRepo)}
									className="text-red-600 border-red-200 hover:bg-red-50"
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>

							<div className="max-w-xs">
								<Label
									htmlFor="repoBranch"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Branch
								</Label>
								<Input
									id="repoBranch"
									value={selectedRepository.branch}
									onChange={(e) =>
										onUpdateRepositoryBranch(selectedRepo, e.target.value)
									}
									className="mt-1 font-mono dark:text-gray-300"
									placeholder="main"
								/>
							</div>
						</div>

						{/* Navigation */}
						<div className="border-b border-gray-200">
							<nav className="flex space-x-8">
								<button
									onClick={() => setActiveSection("env")}
									className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
										activeSection === "env"
											? "border-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-100"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
									}`}
								>
									<div className="flex items-center gap-2">
										<Database className="w-4 h-4" />
										Environment Variables ({selectedRepository.envVars.length})
									</div>
								</button>
								<button
									onClick={() => setActiveSection("docker")}
									className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
										activeSection === "docker"
											? "border-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-100"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
									}`}
								>
									<div className="flex items-center gap-2">
										<Settings className="w-4 h-4" />
										Docker Configurations (
										{selectedRepository.dockerConfigs.length})
									</div>
								</button>
							</nav>
						</div>

						{/* Content */}
						<div className="min-h-[400px]">
							{activeSection === "env" ? (
								<EnvironmentVariables
									repoName={selectedRepo}
									envVars={selectedRepository.envVars}
									onAddEnvVar={onAddEnvVar}
									onRemoveEnvVar={onRemoveEnvVar}
									onParseBulkEnvVars={onParseBulkEnvVars}
								/>
							) : (
								<DockerConfigurations
									repoName={selectedRepo}
									dockerConfigs={selectedRepository.dockerConfigs}
									onAddDockerConfig={onAddDockerConfig}
									onUpdateDockerConfig={onUpdateDockerConfig}
									onDeleteDockerConfig={onDeleteDockerConfig}
								/>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
