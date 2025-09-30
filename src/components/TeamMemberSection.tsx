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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Users, User, Server, Brain, Shield } from "lucide-react";
import { TeamMembers, TeamRole, TeamMember } from "@/types";

interface TeamMemberSectionProps {
	teamMembers: TeamMembers;
	onAddTeamMember: (role: TeamRole, member: TeamMember) => void;
	onRemoveTeamMember: (role: TeamRole, index: number) => void;
}

const roleIcons = {
	Frontend: User,
	Backend: Server,
	"AI/ML": Brain,
	DevOps: Shield,
};

const memberSuggestions = {
	Frontend: ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Wilson"],
	Backend: ["Mike Chen", "Emily Davis", "David Brown", "Lisa Garcia"],
	"AI/ML": ["Dr. James Lee", "Anna Rodriguez", "Chris Kim", "Maya Patel"],
	DevOps: ["Tom Wilson", "Jessica Clark", "Ryan Taylor", "Nicole Adams"],
};

export const TeamMemberSection: React.FC<TeamMemberSectionProps> = ({
	teamMembers,
	onAddTeamMember,
	onRemoveTeamMember,
}) => {
	const [memberName, setMemberName] = useState("");
	const [memberRole, setMemberRole] = useState<TeamRole>("Frontend");
	const [memberContribution, setMemberContribution] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);

	const handleAddMember = () => {
		if (!memberName.trim()) {
			alert("Please enter member name");
			return;
		}

		onAddTeamMember(memberRole, {
			name: memberName.trim(),
			contribution: memberContribution.trim() || undefined,
		});

		setMemberName("");
		setMemberContribution("");
		setShowSuggestions(false);
	};

	const handleNameInputFocus = () => {
		setShowSuggestions(true);
	};

	const handleNameInputBlur = () => {
		// Delay hiding suggestions to allow for selection
		setTimeout(() => setShowSuggestions(false), 200);
	};

	const handleSuggestionClick = (name: string) => {
		setMemberName(name);
		setShowSuggestions(false);

		// Auto-fill the role based on the selected member name
		const foundRole = Object.keys(memberSuggestions).find((role) =>
			memberSuggestions[role as TeamRole].includes(name)
		) as TeamRole;

		if (foundRole) {
			setMemberRole(foundRole);
		}
	};

	const hasMembers = Object.values(teamMembers).some(
		(members) => members.length > 0
	);

	const filteredSuggestions = memberSuggestions[memberRole].filter(
		(name) =>
			name.toLowerCase().includes(memberName.toLowerCase()) &&
			!teamMembers[memberRole].some((member) => member.name === name)
	);

	return (
		<div className="flex-1 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Team Management
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage team members and their roles
					</p>
				</div>

				<div className="space-y-8">
					{/* Add Member Form */}
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Add Team Member
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="relative">
								<Label
									htmlFor="memberName"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Member Name
								</Label>
								<Input
									id="memberName"
									value={memberName}
									onChange={(e) => setMemberName(e.target.value)}
									onFocus={handleNameInputFocus}
									onBlur={handleNameInputBlur}
									placeholder="Enter team member name"
									className="mt-1 dark:text-gray-300"
								/>

								{/* Name Suggestions */}
								{showSuggestions && filteredSuggestions.length > 0 && (
									<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
										{filteredSuggestions.slice(0, 4).map((name, index) => (
											<button
												key={index}
												className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
												onMouseDown={() => handleSuggestionClick(name)}
											>
												{name}
											</button>
										))}
									</div>
								)}
							</div>

							<div>
								<Label
									htmlFor="memberRole"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Role
								</Label>
								<Select
									value={memberRole}
									onValueChange={(value: TeamRole) => setMemberRole(value)}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent>
										{Object.keys(teamMembers).map((role) => {
											const IconComponent = roleIcons[role as TeamRole];
											return (
												<SelectItem key={role} value={role}>
													<div className="flex items-center gap-2 dark:text-gray-300">
														<IconComponent className="w-4 h-4 " />
														{role}
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="mt-4">
							<Label
								htmlFor="memberContribution"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Contribution (Optional)
							</Label>
							<Textarea
								id="memberContribution"
								value={memberContribution}
								onChange={(e) => setMemberContribution(e.target.value)}
								placeholder="Brief description of their main contributions or responsibilities"
								className="mt-1 dark:text-gray-300"
							/>
						</div>

						<div className="flex gap-3 mt-4">
							<Button
								onClick={handleAddMember}
								className="bg-gray-900 hover:bg-gray-800 text-white"
								disabled={!memberName.trim()}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Team Member
							</Button>
						</div>
					</div>

					{/* Team Overview */}
					{!hasMembers ? (
						<div className="text-center py-16 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
							<Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
								No Team Members Yet
							</h3>
							<p className="text-gray-500 dark:text-gray-400">
								Add your first team member to get started
							</p>
						</div>
					) : (
						<div className="space-y-6">
							{/* Team Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{Object.entries(teamMembers).map(([role, members]) => {
									const IconComponent = roleIcons[role as TeamRole];

									return (
										<div
											key={role}
											className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center"
										>
											<IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{members.length}
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400">
												{role}
											</div>
										</div>
									);
								})}
							</div>

							{/* Team Members by Role */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{Object.entries(teamMembers).map(([role, members]) => {
									if (members.length === 0) return null;

									const IconComponent = roleIcons[role as TeamRole];

									return (
										<div
											key={role}
											className="bg-white border border-gray-200 rounded-lg p-6"
										>
											<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
												<IconComponent className="w-5 h-5" />
												{role} ({members.length})
											</h4>
											<div className="space-y-3">
												{members.map(
													(
														member: {
															name:
																| string
																| number
																| boolean
																| React.ReactElement<
																		any,
																		string | React.JSXElementConstructor<any>
																  >
																| Iterable<React.ReactNode>
																| React.ReactPortal
																| null
																| undefined;
															contribution:
																| string
																| number
																| boolean
																| React.ReactElement<
																		any,
																		string | React.JSXElementConstructor<any>
																  >
																| Iterable<React.ReactNode>
																| React.ReactPortal
																| null
																| undefined;
														},
														index: React.Key | null | undefined
													) => (
														<div
															key={index}
															className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
														>
															<div className="flex-1 min-w-0">
																<div className="font-semibold text-gray-900">
																	{member.name}
																</div>
																{member.contribution && (
																	<div className="text-sm text-gray-600 mt-1">
																		{member.contribution}
																	</div>
																)}
															</div>
															<Button
																variant="destructive"
																size="sm"
																onClick={() =>
																	onRemoveTeamMember(
																		role as TeamRole,
																		index as number
																	)
																}
																className="ml-2 flex-shrink-0"
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													)
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
