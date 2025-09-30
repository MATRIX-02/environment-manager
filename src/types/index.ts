export interface EnvVar {
  name: string;
  value: string;
}

export interface DockerConfig {
  id: number;
  name: string;
  image: string;
  port?: string;
  volume?: string;
  envVars: EnvVar[];
}

export interface Repository {
  url: string;
  branch: string;
  envVars: EnvVar[];
  dockerConfigs: DockerConfig[];
}

export interface TeamMember {
  name: string;
  contribution?: string;
}

export interface TeamMembers {
  Frontend: TeamMember[];
  Backend: TeamMember[];
  "AI/ML": TeamMember[];
  DevOps: TeamMember[];
}

export interface ProjectData {
  repositories: Record<string, Repository>;
  teamMembers: TeamMembers;
  projectName: string;
  exportDate?: string;
}

export type TeamRole = keyof TeamMembers;