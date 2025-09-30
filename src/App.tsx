import { useState } from "react";
import { ProjectHeader } from "./components/ProjectHeader";
import { RepositorySection } from "./components/RepositorySection";
import { TeamMemberSection } from "./components/TeamMemberSection";
import { Sidebar } from "./components/Sidebar";
import { useProjectData } from "./hooks/useProjectData";

function App() {
	const projectData = useProjectData();
	const [activeSection, setActiveSection] = useState("repositories");
	const [selectedRepo, setSelectedRepo] = useState<string>("");
	const [darkMode, setDarkMode] = useState(false);

	const renderActiveSection = () => {
		switch (activeSection) {
			case "repositories":
				return (
					<RepositorySection
						repositories={projectData.repositories}
						selectedRepo={selectedRepo}
						onSelectedRepoChange={setSelectedRepo}
						onAddRepository={projectData.addRepository}
						onDeleteRepository={projectData.deleteRepository}
						onUpdateRepositoryBranch={projectData.updateRepositoryBranch}
						onAddEnvVar={projectData.addEnvVar}
						onRemoveEnvVar={projectData.removeEnvVar}
						onParseBulkEnvVars={projectData.parseBulkEnvVars}
						onAddDockerConfig={projectData.addDockerConfig}
						onUpdateDockerConfig={projectData.updateDockerConfig}
						onDeleteDockerConfig={projectData.deleteDockerConfig}
					/>
				);
			case "team":
				return (
					<TeamMemberSection
						teamMembers={projectData.teamMembers}
						onAddTeamMember={projectData.addTeamMember}
						onRemoveTeamMember={projectData.removeTeamMember}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className={darkMode ? "dark" : ""}>
			<div className="h-screen w-screen bg-background flex overflow-hidden transition-colors">
				{/* Sidebar */}
				<Sidebar
					activeSection={activeSection}
					onSectionChange={setActiveSection}
					projectName={projectData.projectName}
					repositories={projectData.repositories}
					teamMembers={projectData.teamMembers}
				/>

				{/* Main Content */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Header */}
					<ProjectHeader
						projectName={projectData.projectName}
						onProjectNameChange={projectData.updateProjectName}
						onExportData={projectData.exportData}
						onImportData={projectData.importData}
						darkMode={darkMode}
						onToggleDarkMode={() => setDarkMode(!darkMode)}
					/>

					{/* Content Area */}
					<div className="flex-1 overflow-auto">{renderActiveSection()}</div>
				</div>
			</div>
		</div>
	);
}

export default App;
