import React from "react";
import { GitBranch, Users, Settings, BarChart3, FileText } from "lucide-react";
import { Repository, TeamMembers } from "@/types";

interface SidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
	projectName: string;
	repositories: Record<string, Repository>;
	teamMembers: TeamMembers;
}

export const Sidebar: React.FC<SidebarProps> = ({
	activeSection,
	onSectionChange,
	projectName,
	repositories,
	teamMembers,
}) => {
	const repoCount = Object.keys(repositories).length;
	const totalMembers = Object.values(teamMembers).reduce(
		(total, members) => total + members.length,
		0
	);
	const totalEnvVars = Object.values(repositories).reduce(
		(total, repo) => total + repo.envVars.length,
		0
	);
	const totalDockerConfigs = Object.values(repositories).reduce(
		(total, repo) => total + repo.dockerConfigs.length,
		0
	);

	const menuItems = [
		{
			id: "repositories",
			label: "Repositories",
			icon: GitBranch,
			count: repoCount,
			description: `${totalEnvVars} env vars, ${totalDockerConfigs} Docker configs`,
		},
		{
			id: "team",
			label: "Team Members",
			icon: Users,
			count: totalMembers,
			description: `${
				Object.values(teamMembers).filter((members) => members.length > 0)
					.length
			} roles`,
		},
	];

	return (
		<div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
			{/* Brand */}
			<div className="p-6 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center">
						<Settings className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							Environment Manager
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Professional Edition
						</p>
					</div>
				</div>
			</div>

			{/* Project Info */}
			{projectName && (
				<div className="p-6 border-b border-border  bg-card ">
					<div className="flex items-center gap-3">
						<FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Current Project
							</p>
							<p
								className="text-lg font-semibold text-gray-900 dark:text-white truncate"
								title={projectName}
							>
								{projectName}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex-1 p-4">
				<nav className="space-y-2">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeSection === item.id;

						return (
							<button
								key={item.id}
								onClick={() => onSectionChange(item.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
									isActive
										? "bg-gray-900 dark:bg-gray-600 text-white shadow-lg"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								}`}
							>
								<Icon
									className={`w-5 h-5 ${
										isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
									}`}
								/>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<span className="font-medium">{item.label}</span>
										{item.count > 0 && (
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													isActive
														? "bg-white text-gray-900"
														: "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
												}`}
											>
												{item.count}
											</span>
										)}
									</div>
									<p
										className={`text-xs mt-1 ${
											isActive
												? "text-gray-300"
												: "text-gray-500 dark:text-gray-400"
										}`}
									>
										{item.description}
									</p>
								</div>
							</button>
						);
					})}
				</nav>
			</div>

			{/* Stats */}
			<div className="p-6 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-2 mb-3">
					<BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Project Overview
					</span>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="text-xl font-bold text-gray-900 dark:text-white">
							{repoCount}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400">
							Repositories
						</div>
					</div>
					<div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="text-xl font-bold text-gray-900 dark:text-white">
							{totalMembers}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400">
							Team Members
						</div>
					</div>
					<div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="text-xl font-bold text-gray-900 dark:text-white">
							{totalEnvVars}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400">
							Env Variables
						</div>
					</div>
					<div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="text-xl font-bold text-gray-900 dark:text-white">
							{totalDockerConfigs}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400">
							Docker Configs
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
