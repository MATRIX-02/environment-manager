import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Edit,
	Plus,
	Trash2,
	Container,
	FileIcon,
	Copy,
	Terminal,
	Play,
} from "lucide-react";
import { DockerConfig, EnvVar } from "@/types";

interface DockerConfigurationsProps {
	repoName: string;
	dockerConfigs: DockerConfig[];
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

export const DockerConfigurations: React.FC<DockerConfigurationsProps> = ({
	repoName,
	dockerConfigs,
	onAddDockerConfig,
	onUpdateDockerConfig,
	onDeleteDockerConfig,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number>(-1);
	const [formData, setFormData] = useState({
		name: "",
		image: "",
		port: "",
		volume: "",
		repository: "",
	});
	const [tempEnvVars, setTempEnvVars] = useState<EnvVar[]>([]);
	const [newEnvName, setNewEnvName] = useState("");
	const [newEnvValue, setNewEnvValue] = useState("");
	const [bulkEnvText, setBulkEnvText] = useState("");

	const resetForm = () => {
		setFormData({
			name: "",
			image: "",
			port: "",
			volume: "",
			repository: "",
		});
		setTempEnvVars([]);
		setNewEnvName("");
		setNewEnvValue("");
		setBulkEnvText("");
		setEditingIndex(-1);
	};

	const openModal = (config?: DockerConfig, index?: number) => {
		if (config && index !== undefined) {
			setFormData({
				name: config.name,
				image: config.image,
				port: config.port || "",
				volume: config.volume || "",
				repository: config.repository || "",
			});
			setTempEnvVars([...config.envVars]);
			setEditingIndex(index);
		} else {
			resetForm();
		}
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		resetForm();
	};

	const handleSave = () => {
		if (!formData.name.trim() || !formData.image.trim()) {
			alert("Please enter container name and image");
			return;
		}

		const config: Omit<DockerConfig, "id"> = {
			name: formData.name.trim(),
			image: formData.image.trim(),
			port: formData.port.trim() || undefined,
			volume: formData.volume.trim() || undefined,
			repository: formData.repository.trim() || undefined,
			envVars: [...tempEnvVars],
		};

		if (editingIndex >= 0) {
			onUpdateDockerConfig(repoName, editingIndex, {
				...config,
				id: dockerConfigs[editingIndex].id,
			});
		} else {
			onAddDockerConfig(repoName, config);
		}

		closeModal();
	};

	const handleAddEnvVar = () => {
		if (!newEnvName.trim()) {
			alert("Please enter variable name");
			return;
		}

		const existingIndex = tempEnvVars.findIndex(
			(v) => v.name === newEnvName.trim()
		);
		if (existingIndex >= 0) {
			const newEnvVars = [...tempEnvVars];
			newEnvVars[existingIndex] = {
				name: newEnvName.trim(),
				value: newEnvValue.trim(),
			};
			setTempEnvVars(newEnvVars);
		} else {
			setTempEnvVars([
				...tempEnvVars,
				{ name: newEnvName.trim(), value: newEnvValue.trim() },
			]);
		}

		setNewEnvName("");
		setNewEnvValue("");
	};

	const handleRemoveEnvVar = (index: number) => {
		setTempEnvVars(tempEnvVars.filter((_, i) => i !== index));
	};

	const handleParseBulkEnv = () => {
		if (!bulkEnvText.trim()) return;

		const lines = bulkEnvText.split("\n");
		const newEnvVars: EnvVar[] = [];

		lines.forEach((line) => {
			line = line.trim();
			if (!line || line.startsWith("#")) return;

			const parts = line.split("=");
			if (parts.length >= 2) {
				const name = parts[0].trim();
				const value = parts.slice(1).join("=").trim();

				const existingIndex = newEnvVars.findIndex((v) => v.name === name);
				if (existingIndex >= 0) {
					newEnvVars[existingIndex].value = value;
				} else {
					newEnvVars.push({ name, value });
				}
			}
		});

		setTempEnvVars(newEnvVars);
		setBulkEnvText("");
	};

	const handleDeleteConfig = (index: number) => {
		if (confirm("Are you sure you want to delete this Docker configuration?")) {
			onDeleteDockerConfig(repoName, index);
		}
	};

	const handleCopyEnvVars = (envVars: EnvVar[]) => {
		if (envVars.length === 0) {
			alert("No environment variables to copy");
			return;
		}

		const envText = envVars.map((v) => `${v.name}=${v.value}`).join("\n");

		navigator.clipboard
			.writeText(envText)
			.then(() => {
				alert("Environment variables copied to clipboard!");
			})
			.catch(() => {
				const textarea = document.createElement("textarea");
				textarea.value = envText;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
				alert("Environment variables copied to clipboard!");
			});
	};

	const handleCopyDockerBuild = (config: DockerConfig) => {
		const buildCommand = `docker build -t ${config.name
			.toLowerCase()
			.replace(/\s+/g, "-")} .`;

		navigator.clipboard
			.writeText(buildCommand)
			.then(() => {
				alert("Docker build command copied to clipboard!");
			})
			.catch(() => {
				const textarea = document.createElement("textarea");
				textarea.value = buildCommand;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
				alert("Docker build command copied to clipboard!");
			});
	};

	const handleCopyDockerRun = (config: DockerConfig) => {
		let runCommand = `docker run`;

		// Add port mapping
		if (config.port) {
			runCommand += ` -d -p ${config.port}`;
		}

		// Add volume mapping
		if (config.volume) {
			runCommand += ` -v ${config.volume}`;
		}

		// Add environment variables
		config.envVars.forEach((env) => {
			runCommand += ` -e ${env.name}="${env.value}"`;
		});

		// Add container name and image
		runCommand += ` --name ${config.name.toLowerCase().replace(/\s+/g, "-")} ${
			config.image
		}`;

		navigator.clipboard
			.writeText(runCommand)
			.then(() => {
				alert("Docker run command copied to clipboard!");
			})
			.catch(() => {
				const textarea = document.createElement("textarea");
				textarea.value = runCommand;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
				alert("Docker run command copied to clipboard!");
			});
	};

	return (
		<div className="space-y-4 text-foreground">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold">Docker Configurations</h3>
					<p className="text-sm text-muted-foreground">
						Manage Docker containers and their configurations
					</p>
				</div>
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => openModal()} className="text-white">
							<Plus className="w-4 h-4 mr-2" />
							Add Docker Config
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-foreground">
						<DialogHeader>
							<DialogTitle>
								{editingIndex >= 0
									? "Edit Docker Configuration"
									: "Add Docker Configuration"}
							</DialogTitle>
							<DialogDescription>
								Configure your Docker container settings and environment
								variables
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							{/* Basic Configuration */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="dockerName">Container Name</Label>
									<Input
										id="dockerName"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="my-app-container"
										className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
									/>
								</div>
								<div>
									<Label htmlFor="dockerImage">Docker Image</Label>
									<Input
										id="dockerImage"
										value={formData.image}
										onChange={(e) =>
											setFormData({ ...formData, image: e.target.value })
										}
										placeholder="node:18-alpine"
										className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="dockerRepository">
									Repository Link (Optional)
								</Label>
								<Input
									id="dockerRepository"
									value={formData.repository}
									onChange={(e) =>
										setFormData({ ...formData, repository: e.target.value })
									}
									placeholder="https://github.com/username/repository"
									className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="dockerPort">Port Mapping</Label>
									<Input
										id="dockerPort"
										value={formData.port}
										onChange={(e) =>
											setFormData({ ...formData, port: e.target.value })
										}
										placeholder="3000:3000"
										className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
									/>
								</div>
								<div>
									<Label htmlFor="dockerVolume">Volume Mapping</Label>
									<Input
										id="dockerVolume"
										value={formData.volume}
										onChange={(e) =>
											setFormData({ ...formData, volume: e.target.value })
										}
										placeholder="./src:/app/src"
										className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
									/>
								</div>
							</div>

							{/* Environment Variables */}
							<div className="space-y-4">
								<h4 className="text-lg font-semibold">Environment Variables</h4>

								{/* Bulk Import */}
								<div>
									<Label htmlFor="bulkEnv">
										Bulk Import (.env file content)
									</Label>
									<Textarea
										id="bulkEnv"
										value={bulkEnvText}
										onChange={(e) => setBulkEnvText(e.target.value)}
										placeholder="Paste your .env file content here..."
										className="mt-2 min-h-[80px] font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
									/>
									<Button
										onClick={handleParseBulkEnv}
										className="mt-2"
										disabled={!bulkEnvText.trim()}
									>
										<FileIcon className="w-4 h-4 mr-2" />
										Parse .env Content
									</Button>
								</div>

								{/* Add Individual Variable */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="envName">Variable Name</Label>
										<Input
											id="envName"
											value={newEnvName}
											onChange={(e) => setNewEnvName(e.target.value)}
											placeholder="VARIABLE_NAME"
											className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
										/>
									</div>
									<div>
										<Label htmlFor="envValue">Value</Label>
										<Input
											id="envValue"
											value={newEnvValue}
											onChange={(e) => setNewEnvValue(e.target.value)}
											placeholder="variable_value"
											className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
										/>
									</div>
								</div>
								<Button onClick={handleAddEnvVar} disabled={!newEnvName.trim()}>
									<Plus className="w-4 h-4 mr-2" />
									Add Variable
								</Button>

								{/* Current Variables */}
								{tempEnvVars.length > 0 && (
									<div>
										<Label>Current Variables ({tempEnvVars.length})</Label>
										<div className="mt-2 max-h-48 overflow-y-auto border rounded-md dark:border-gray-600 dark:bg-gray-700">
											{tempEnvVars.map((envVar, index) => (
												<div
													key={index}
													className="flex items-center justify-between p-3 border-b last:border-b-0 dark:border-gray-600"
												>
													<div className="font-mono text-sm">
														<span className="font-semibold text-blue-600 dark:text-blue-400">
															{envVar.name}
														</span>
														<span className="text-gray-500 dark:text-gray-400">
															{" "}
															={" "}
														</span>
														<span className="text-gray-700 dark:text-gray-300">
															{envVar.value}
														</span>
													</div>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleRemoveEnvVar(index)}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={closeModal}>
								Cancel
							</Button>
							<Button onClick={handleSave}>
								{editingIndex >= 0
									? "Update Configuration"
									: "Save Configuration"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Docker Configurations List */}
			{dockerConfigs.length === 0 ? (
				<Card>
					<CardContent className="py-8">
						<div className="text-center text-muted-foreground">
							<Container className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>No Docker configurations added yet</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{dockerConfigs.map((config, index) => (
						<Card key={config.id}>
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle className="text-lg">{config.name}</CardTitle>
										<p className="text-sm text-muted-foreground">
											{config.image}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleCopyDockerBuild(config)}
											title="Copy Docker build command"
										>
											<Terminal className="w-4 h-4 mr-2" />
											Build
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleCopyDockerRun(config)}
											title="Copy Docker run command"
										>
											<Play className="w-4 h-4 mr-2" />
											Run
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openModal(config, index)}
										>
											<Edit className="w-4 h-4 mr-2" />
											Edit
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteConfig(index)}
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 text-sm">
									{config.port && (
										<div>
											<strong>Port:</strong> {config.port}
										</div>
									)}
									{config.volume && (
										<div>
											<strong>Volume:</strong> {config.volume}
										</div>
									)}
									{config.repository && (
										<div className="col-span-2">
											<strong>Repository:</strong>{" "}
											<a
												href={config.repository}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												{config.repository}
											</a>
										</div>
									)}
									<div>
										<strong>Environment Variables:</strong>{" "}
										{config.envVars.length}
									</div>
								</div>

								{config.envVars.length > 0 && (
									<div className="mt-4">
										<div className="flex items-center justify-between mb-2">
											<Label>Environment Variables</Label>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleCopyEnvVars(config.envVars)}
												title="Copy environment variables"
											>
												<Copy className="w-4 h-4 mr-2" />
												Copy Env
											</Button>
										</div>
										<pre className="p-4 bg-gray-900 text-green-400 rounded-md text-sm overflow-x-auto font-mono">
											{config.envVars
												.map((v) => `${v.name}=${v.value}`)
												.join("\n")}
										</pre>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};
