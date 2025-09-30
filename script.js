// Initial repository data
const repositories = {
	"User End React": {
		url: "https://github.com/Easeworkai-com/Easework_User_End_React",
		branch: "main",
		envVars: [],
		docker: {
			containers: [],
			ports: [],
		},
	},
};

let currentRepo = null;
let currentDockerRepo = null;

// Update project info display
function updateProjectInfo() {
	document.getElementById("projectNameDisplay").textContent =
		document.getElementById("projectName").value || "[Enter project name]";
}

// Initialize repositories dropdown
function initRepositories() {
	const selector = document.getElementById("repoSelector");
	const dockerSelector = document.getElementById("dockerRepoSelector");

	// Clear all options except the first two for repoSelector
	while (selector.options.length > 2) {
		selector.remove(2);
	}

	// Clear all options except the first for dockerSelector
	while (dockerSelector.options.length > 1) {
		dockerSelector.remove(1);
	}

	// Add repositories from our data
	Object.keys(repositories).forEach((repoName) => {
		// Add to main repo selector
		const option = document.createElement("option");
		option.value = repoName;
		option.textContent = repoName;
		selector.appendChild(option);

		// Add to docker repo selector
		const dockerOption = document.createElement("option");
		dockerOption.value = repoName;
		dockerOption.textContent = repoName;
		dockerSelector.appendChild(dockerOption);
	});

	// Create repository containers
	updateRepoContainers();
	updateDockerConfigurations();
}

// Show/hide the add repository form
function toggleAddRepoForm(show) {
	document.getElementById("addRepoForm").style.display = show
		? "block"
		: "none";
	if (show) {
		document.getElementById("newRepoName").value = "";
		document.getElementById("newRepoUrl").value = "";
		document.getElementById("newRepoName").focus();
	}
}

// Add a new repository
function addRepository() {
	const name = document.getElementById("newRepoName").value.trim();
	const url = document.getElementById("newRepoUrl").value.trim();

	if (!name || !url) {
		alert("Please enter both repository name and URL");
		return;
	}

	if (repositories[name]) {
		alert("A repository with this name already exists");
		return;
	}

	repositories[name] = {
		url: url,
		branch: "main", // Default branch
		envVars: [],
		docker: {
			containers: [],
			branch: "main", // Default branch for Docker
			envVars: [],
		},
	};

	// Reset form and update UI
	toggleAddRepoForm(false);
	initRepositories();

	// Select the newly added repository
	document.getElementById("repoSelector").value = name;
	selectRepository();
}

function cancelAddRepo() {
	toggleAddRepoForm(false);
	document.getElementById("repoSelector").value = currentRepo || "";
}

// Switch between tabs (repositories and docker)
function switchTab(tabName, tabElement) {
	// Update tab active state
	document.querySelectorAll(".tab").forEach((tab) => {
		tab.classList.remove("active");
	});
	tabElement.classList.add("active");

	// Show the selected tab content
	document.querySelectorAll(".tab-content").forEach((content) => {
		content.classList.remove("active");
	});
	document.getElementById(`${tabName}-tab`).classList.add("active");
}

// Select a repository from the dropdown
function selectRepository() {
	const selectedRepo = document.getElementById("repoSelector").value;

	if (selectedRepo === "add-new") {
		toggleAddRepoForm(true);
		return;
	}

	toggleAddRepoForm(false);
	currentRepo = selectedRepo;

	// Update UI to show the selected repository
	updateRepoContainers();
}

// Select a repository for Docker configuration
function selectDockerRepo() {
	const selectedRepo = document.getElementById("dockerRepoSelector").value;
	currentDockerRepo = selectedRepo;

	// Update UI to show the selected Docker configuration
	updateDockerConfigurations();
}

// Create and update repository containers
function updateRepoContainers() {
	const containersDiv = document.getElementById("repoContainers");
	containersDiv.innerHTML = ""; // Clear existing containers

	Object.keys(repositories).forEach((repoName) => {
		const repo = repositories[repoName];
		const container = document.createElement("div");
		container.id = `repo-${repoName.replace(/\s+/g, "-").toLowerCase()}`;
		container.className = "repo-info";
		if (repoName === currentRepo) {
			container.classList.add("active-repo");
		}

		container.innerHTML = `
      <h3><i class="fas fa-code-branch"></i> ${repoName}</h3>
      <div class="form-section">
        <div class="field-group">
          <div>
            <label class="field-label">Repository URL</label>
            <input type="text" id="repoUrl-${repoName}" value="${repo.url}" readonly>
          </div>
          <div>
            <label class="field-label">Branch</label>
            <input type="text" id="repoBranch-${repoName}" value="${repo.branch}" 
              onchange="updateRepoBranch('${repoName}', this.value)">
          </div>
        </div>
      </div>
      
      <h3><i class="fas fa-key"></i> Environment Variables</h3>
      <div class="form-section">
        <textarea id="bulkEnv-${repoName}" placeholder="Paste your entire .env file here to auto-populate variables"></textarea>
        <button type="button" onclick="parseEnvFile('${repoName}')">
          <i class="fas fa-file-import"></i> Parse .env File
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Variable Name</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="envTableBody-${repoName}">
          <!-- Env rows appear here -->
        </tbody>
      </table>
      
      <div class="form-section" style="margin-top: 1em;">
        <div class="field-group">
          <div>
            <label class="field-label">Variable Name</label>
            <input type="text" id="envVarName-${repoName}" placeholder="Variable Name">
          </div>
          <div>
            <label class="field-label">Value</label>
            <input type="text" id="envVarValue-${repoName}" placeholder="Value">
          </div>
          <button type="button" onclick="addEnvVar('${repoName}')" class="btn-success">
            <i class="fas fa-plus"></i> Add Variable
          </button>
        </div>
        <button type="button" onclick="copyAllEnvVars('${repoName}')" class="copy-button">
          <i class="fas fa-copy"></i> Copy All
        </button>
      </div>
    `;

		containersDiv.appendChild(container);
		renderEnvVars(repoName);
	});
}

// Create and update Docker configurations
function updateDockerConfigurations() {
	const containersDiv = document.getElementById("dockerConfigurations");
	containersDiv.innerHTML = ""; // Clear existing configurations

	if (!currentDockerRepo || !repositories[currentDockerRepo]) {
		containersDiv.innerHTML = "<p>Please select a repository first</p>";
		return;
	}

	const repo = repositories[currentDockerRepo];

	const container = document.createElement("div");
	container.className = "docker-section";
	container.innerHTML = `
    <div class="docker-header">
      <i class="fab fa-docker"></i>
      <h3>Docker Configuration for ${currentDockerRepo}</h3>
    </div>
    
    <div class="form-section">
      <div class="field-group">
        <div>
          <label class="field-label">Repository</label>
          <input type="text" value="${repo.url}" readonly>
        </div>
        <div>
          <label class="field-label">Branch for Docker</label>
          <input type="text" id="dockerBranch-${currentDockerRepo}" 
            value="${repo.docker.branch || repo.branch}" 
            onchange="updateDockerBranch('${currentDockerRepo}', this.value)">
        </div>
      </div>
    </div>
    
    <h3><i class="fas fa-cubes"></i> Docker Containers</h3>
    <div id="dockerContainers-${currentDockerRepo}">
      <!-- Docker containers appear here -->
    </div>
    
    <div class="form-section">
      <div class="field-group">
        <div>
          <label class="field-label">Container Name</label>
          <input type="text" id="dockerContainerName-${currentDockerRepo}" placeholder="Container Name">
        </div>
        <div>
          <label class="field-label">Image</label>
          <input type="text" id="dockerContainerImage-${currentDockerRepo}" placeholder="Image">
        </div>
        <div>
          <label class="field-label">Port</label>
          <input type="text" id="dockerContainerPort-${currentDockerRepo}" placeholder="Port">
        </div>
      </div>
      <button type="button" onclick="addDockerContainer('${currentDockerRepo}')" class="btn-success">
        <i class="fas fa-plus"></i> Add Container
      </button>
    </div>

    <h3><i class="fas fa-key"></i> Environment Variables for Docker</h3>
    <div class="form-section">
      <textarea id="dockerBulkEnv-${currentDockerRepo}" placeholder="Paste your entire Docker .env file here to auto-populate variables"></textarea>
      <button type="button" onclick="parseDockerEnvFile('${currentDockerRepo}')">
        <i class="fas fa-file-import"></i> Parse Docker .env File
      </button>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Variable Name</th>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="dockerEnvTableBody-${currentDockerRepo}">
        <!-- Docker Env rows appear here -->
      </tbody>
    </table>
    
    <div class="form-section" style="margin-top: 1em;">
      <div class="field-group">
        <div>
          <label class="field-label">Variable Name</label>
          <input type="text" id="dockerEnvVarName-${currentDockerRepo}" placeholder="Variable Name">
        </div>
        <div>
          <label class="field-label">Value</label>
          <input type="text" id="dockerEnvVarValue-${currentDockerRepo}" placeholder="Value">
        </div>
        <button type="button" onclick="addDockerEnvVar('${currentDockerRepo}')" class="btn-success">
          <i class="fas fa-plus"></i> Add Variable
        </button>
      </div>
      <button type="button" onclick="copyAllDockerEnvVars('${currentDockerRepo}')" class="copy-button">
        <i class="fas fa-copy"></i> Copy All
      </button>
    </div>
  `;

	containersDiv.appendChild(container);
	renderDockerContainers(currentDockerRepo);
	renderDockerEnvVars(currentDockerRepo);
}

// Update repository branch
function updateRepoBranch(repoName, branchName) {
	if (repositories[repoName]) {
		repositories[repoName].branch = branchName;
	}
}

// Update Docker branch
function updateDockerBranch(repoName, branchName) {
	if (repositories[repoName] && repositories[repoName].docker) {
		repositories[repoName].docker.branch = branchName;
	}
}

// Parse .env file contents
function parseEnvFile(repoName) {
	const envText = document.getElementById(`bulkEnv-${repoName}`).value.trim();
	if (!envText) return;

	const repo = repositories[repoName];
	if (!repo) return;

	// Clear existing env vars
	repo.envVars = [];

	// Parse env file line by line
	const lines = envText.split("\n");
	lines.forEach((line) => {
		line = line.trim();
		if (!line || line.startsWith("#")) return; // Skip comments and empty lines

		const parts = line.split("=");
		if (parts.length >= 2) {
			const name = parts[0].trim();
			const value = parts.slice(1).join("=").trim();
			repo.envVars.push({ name, value });
		}
	});

	renderEnvVars(repoName);
}

// Parse Docker .env file contents
function parseDockerEnvFile(repoName) {
	const envText = document
		.getElementById(`dockerBulkEnv-${repoName}`)
		.value.trim();
	if (!envText) return;

	const repo = repositories[repoName];
	if (!repo || !repo.docker) return;

	// Clear existing Docker env vars
	repo.docker.envVars = [];

	// Parse env file line by line
	const lines = envText.split("\n");
	lines.forEach((line) => {
		line = line.trim();
		if (!line || line.startsWith("#")) return; // Skip comments and empty lines

		const parts = line.split("=");
		if (parts.length >= 2) {
			const name = parts[0].trim();
			const value = parts.slice(1).join("=").trim();
			repo.docker.envVars.push({ name, value });
		}
	});

	renderDockerEnvVars(repoName);
}

// Add environment variable to repository
function addEnvVar(repoName) {
	const name = document.getElementById(`envVarName-${repoName}`).value.trim();
	const value = document.getElementById(`envVarValue-${repoName}`).value.trim();

	if (!name) {
		alert("Please enter variable name");
		return;
	}

	const repo = repositories[repoName];
	if (!repo) return;

	repo.envVars.push({ name, value });

	document.getElementById(`envVarName-${repoName}`).value = "";
	document.getElementById(`envVarValue-${repoName}`).value = "";

	renderEnvVars(repoName);
}

// Add Docker environment variable
function addDockerEnvVar(repoName) {
	const name = document
		.getElementById(`dockerEnvVarName-${repoName}`)
		.value.trim();
	const value = document
		.getElementById(`dockerEnvVarValue-${repoName}`)
		.value.trim();

	if (!name) {
		alert("Please enter variable name");
		return;
	}

	const repo = repositories[repoName];
	if (!repo || !repo.docker) return;

	repo.docker.envVars.push({ name, value });

	document.getElementById(`dockerEnvVarName-${repoName}`).value = "";
	document.getElementById(`dockerEnvVarValue-${repoName}`).value = "";

	renderDockerEnvVars(repoName);
}

// Render environment variables table for repository
function renderEnvVars(repoName) {
	const repo = repositories[repoName];
	if (!repo) return;

	const tbody = document.getElementById(`envTableBody-${repoName}`);
	if (!tbody) return;

	tbody.innerHTML = "";

	if (repo.envVars.length === 0) {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td colspan="3" style="text-align:center;">No environment variables defined</td>`;
		tbody.appendChild(tr);
		return;
	}

	repo.envVars.forEach((v, i) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
      <td><code>${escapeHTML(v.name)}</code></td>
      <td>${escapeHTML(v.value)}</td>
      <td>
        <button onclick="removeEnvVar('${repoName}', ${i})" class="btn-danger btn-sm">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
		tbody.appendChild(tr);
	});
}

// Render Docker environment variables table
function renderDockerEnvVars(repoName) {
	const repo = repositories[repoName];
	if (!repo || !repo.docker) return;

	const tbody = document.getElementById(`dockerEnvTableBody-${repoName}`);
	if (!tbody) return;

	tbody.innerHTML = "";

	if (!repo.docker.envVars || repo.docker.envVars.length === 0) {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td colspan="3" style="text-align:center;">No Docker environment variables defined</td>`;
		tbody.appendChild(tr);
		return;
	}

	repo.docker.envVars.forEach((v, i) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
      <td><code>${escapeHTML(v.name)}</code></td>
      <td>${escapeHTML(v.value)}</td>
      <td>
        <button onclick="removeDockerEnvVar('${repoName}', ${i})" class="btn-danger btn-sm">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
		tbody.appendChild(tr);
	});
}

// Remove env var from repository
function removeEnvVar(repoName, index) {
	const repo = repositories[repoName];
	if (!repo) return;

	repo.envVars.splice(index, 1);
	renderEnvVars(repoName);
}

// Remove Docker env var
function removeDockerEnvVar(repoName, index) {
	const repo = repositories[repoName];
	if (!repo || !repo.docker) return;

	repo.docker.envVars.splice(index, 1);
	renderDockerEnvVars(repoName);
}

// Copy all environment variables to clipboard
function copyAllEnvVars(repoName) {
	const repo = repositories[repoName];
	if (!repo || repo.envVars.length === 0) {
		alert("No environment variables to copy");
		return;
	}

	const envText = repo.envVars.map((v) => `${v.name}=${v.value}`).join("\n");

	navigator.clipboard
		.writeText(envText)
		.then(() => {
			// Show tooltip
			const copyBtn = document.querySelector(`.copy-button`);
			const tooltip = document.createElement("span");
			tooltip.className = "tooltiptext";
			tooltip.textContent = "Copied!";
			copyBtn.appendChild(tooltip);

			// Remove tooltip after 2 seconds
			setTimeout(() => {
				copyBtn.removeChild(tooltip);
			}, 2000);
		})
		.catch((err) => {
			console.error("Failed to copy: ", err);
			// Fallback for browsers that don't support clipboard API
			const textarea = document.createElement("textarea");
			textarea.value = envText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			alert("Environment variables copied to clipboard");
		});
}

// Copy all Docker environment variables to clipboard
function copyAllDockerEnvVars(repoName) {
	const repo = repositories[repoName];
	if (
		!repo ||
		!repo.docker ||
		!repo.docker.envVars ||
		repo.docker.envVars.length === 0
	) {
		alert("No Docker environment variables to copy");
		return;
	}

	const envText = repo.docker.envVars
		.map((v) => `${v.name}=${v.value}`)
		.join("\n");

	navigator.clipboard
		.writeText(envText)
		.then(() => {
			// Show tooltip
			const copyBtn = document.querySelector(`.copy-button`);
			const tooltip = document.createElement("span");
			tooltip.className = "tooltiptext";
			tooltip.textContent = "Copied!";
			copyBtn.appendChild(tooltip);

			// Remove tooltip after 2 seconds
			setTimeout(() => {
				copyBtn.removeChild(tooltip);
			}, 2000);
		})
		.catch((err) => {
			console.error("Failed to copy: ", err);
			const textarea = document.createElement("textarea");
			textarea.value = envText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			alert("Docker environment variables copied to clipboard");
		});
}

// Add Docker container to repository
function addDockerContainer(repoName) {
	const name = document
		.getElementById(`dockerContainerName-${repoName}`)
		.value.trim();
	const image = document
		.getElementById(`dockerContainerImage-${repoName}`)
		.value.trim();
	const port = document
		.getElementById(`dockerContainerPort-${repoName}`)
		.value.trim();

	if (!name || !image) {
		alert("Please enter container name and image");
		return;
	}

	const repo = repositories[repoName];
	if (!repo) return;

	if (!repo.docker.containers) {
		repo.docker.containers = [];
	}

	repo.docker.containers.push({ name, image, port });

	document.getElementById(`dockerContainerName-${repoName}`).value = "";
	document.getElementById(`dockerContainerImage-${repoName}`).value = "";
	document.getElementById(`dockerContainerPort-${repoName}`).value = "";

	renderDockerContainers(repoName);
}

// Render Docker containers for repository
function renderDockerContainers(repoName) {
	const repo = repositories[repoName];
	if (!repo) return;

	const containersDiv = document.getElementById(`dockerContainers-${repoName}`);
	if (!containersDiv) return;

	containersDiv.innerHTML = "";

	if (!repo.docker.containers || repo.docker.containers.length === 0) {
		containersDiv.innerHTML = "<p>No Docker containers configured</p>";
		return;
	}

	repo.docker.containers.forEach((container, i) => {
		const div = document.createElement("div");
		div.className = "docker-container";
		div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong><i class="fas fa-cube"></i> ${escapeHTML(
						container.name
					)}</strong>
          ${
						container.port
							? `<span class="badge badge-primary">Port: ${escapeHTML(
									container.port
							  )}</span>`
							: ""
					}
        </div>
        <button onclick="removeDockerContainer('${repoName}', ${i})" class="btn-danger btn-sm">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div style="margin-top: 10px;">
        <code>${escapeHTML(container.image)}</code>
      </div>
    `;
		containersDiv.appendChild(div);
	});
}

// Remove Docker container from repository
function removeDockerContainer(repoName, index) {
	const repo = repositories[repoName];
	if (!repo || !repo.docker || !repo.docker.containers) return;

	repo.docker.containers.splice(index, 1);
	renderDockerContainers(repoName);
}

// Team members lists
const teamMembers = {
	Frontend: [],
	Backend: [],
	"AI/ML": [],
};

// Add team member
function addMember() {
	const name = document.getElementById("memberName").value.trim();
	const role = document.getElementById("memberRole").value;
	const contribution = document
		.getElementById("memberContribution")
		.value.trim();

	if (!name) return alert("Please enter member name");

	teamMembers[role].push({ name, contribution });

	document.getElementById("memberName").value = "";
	document.getElementById("memberContribution").value = "";

	renderTeamMembers();
}

// Render team members lists
function renderTeamMembers() {
	["Frontend", "Backend", "AI/ML"].forEach((role) => {
		const ul = document.getElementById(role.toLowerCase() + "List");
		ul.innerHTML = "";

		if (teamMembers[role].length === 0) {
			const emptyLi = document.createElement("li");
			emptyLi.style.textAlign = "center";
			emptyLi.style.color = "var(--gray)";
			emptyLi.textContent = "No team members added";
			ul.appendChild(emptyLi);
			return;
		}

		teamMembers[role].forEach((member, index) => {
			const li = document.createElement("li");
			li.innerHTML = `
        <div>
          <span class="member-name">${escapeHTML(member.name)}</span>
          ${
						member.contribution
							? `<div style="font-size: 0.85rem; color: var(--gray); margin-top: 2px;">
            <i class="fas fa-tasks"></i> ${escapeHTML(member.contribution)}
          </div>`
							: ""
					}
        </div>
        <button onclick="removeMember('${role}', ${index})" class="btn-danger btn-sm">
          <i class="fas fa-user-minus"></i>
        </button>
      `;
			ul.appendChild(li);
		});
	});
}

// Remove team member
function removeMember(role, index) {
	teamMembers[role].splice(index, 1);
	renderTeamMembers();
}

// Escape HTML chars to prevent injection
function escapeHTML(text) {
	return (text || "").toString().replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[c])
	);
}

// Save current state as new HTML file to download
function saveToFile() {
	// Build the serializable HTML content string manually
	const projectName = escapeHTML(
		document.getElementById("projectName").value || ""
	);

	// Serialize repositories
	let reposHTML = "";
	Object.keys(repositories).forEach((repoName) => {
		const repo = repositories[repoName];

		// Environment variables
		let envVarsHTML = "";
		repo.envVars.forEach((v) => {
			envVarsHTML += `
        <tr>
          <td><code>${escapeHTML(v.name)}</code></td>
          <td>${escapeHTML(v.value)}</td>
          <td>
            <button onclick="copyToClipboard('${escapeHTML(
							v.name
						)}=${escapeHTML(v.value)}')" class="btn-sm">
              <i class="fas fa-copy"></i>
            </button>
          </td>
        </tr>`;
		});

		// Docker containers
		let dockerHTML = "";
		if (
			repo.docker &&
			repo.docker.containers &&
			repo.docker.containers.length > 0
		) {
			repo.docker.containers.forEach((container) => {
				dockerHTML += `
          <div class="docker-item">
            <p><strong>Name:</strong> ${escapeHTML(container.name)}</p>
            <p><strong>Image:</strong> ${escapeHTML(container.image)}</p>
            ${
							container.port
								? `<p><strong>Port:</strong> ${escapeHTML(container.port)}</p>`
								: ""
						}
          </div>
        `;
			});
		} else {
			dockerHTML = "<p>No Docker containers configured</p>";
		}

		// Docker environment variables
		let dockerEnvVarsHTML = "";
		if (repo.docker && repo.docker.envVars && repo.docker.envVars.length > 0) {
			repo.docker.envVars.forEach((v) => {
				dockerEnvVarsHTML += `
          <tr>
            <td><code>${escapeHTML(v.name)}</code></td>
            <td>${escapeHTML(v.value)}</td>
            <td>
              <button onclick="copyToClipboard('${escapeHTML(
								v.name
							)}=${escapeHTML(v.value)}')" class="btn-sm">
                <i class="fas fa-copy"></i>
              </button>
            </td>
          </tr>`;
			});
		}

		reposHTML += `
      <div class="repository">
        <h3><i class="fas fa-code-branch"></i> ${escapeHTML(repoName)}</h3>
        <p><strong>URL:</strong> ${escapeHTML(repo.url)}</p>
        <p><strong>Branch:</strong> ${escapeHTML(repo.branch)}</p>
        
        <h4><i class="fas fa-key"></i> Environment Variables</h4>
        <div class="env-section">
          <button onclick="copyAllFromTable('env-table-${escapeHTML(
						repoName.replace(/\s+/g, "-").toLowerCase()
					)}')" class="copy-all-btn">
            <i class="fas fa-copy"></i> Copy All
          </button>
          <table class="env-table" id="env-table-${escapeHTML(
						repoName.replace(/\s+/g, "-").toLowerCase()
					)}">
            <thead>
              <tr><th>Variable Name</th><th>Value</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${
								envVarsHTML ||
								'<tr><td colspan="3" style="text-align:center;">No environment variables defined</td></tr>'
							}
            </tbody>
          </table>
        </div>
        
        <h4><i class="fab fa-docker"></i> Docker Configuration</h4>
        <p><strong>Branch for Docker:</strong> ${escapeHTML(
					repo.docker.branch || repo.branch
				)}</p>
        
        <h5><i class="fas fa-cubes"></i> Containers</h5>
        <div class="docker-containers">
          ${dockerHTML}
        </div>
        
        <h5><i class="fas fa-key"></i> Docker Environment Variables</h5>
        <div class="env-section">
          <button onclick="copyAllFromTable('docker-env-table-${escapeHTML(
						repoName.replace(/\s+/g, "-").toLowerCase()
					)}')" class="copy-all-btn">
            <i class="fas fa-copy"></i> Copy All
          </button>
          <table class="env-table" id="docker-env-table-${escapeHTML(
						repoName.replace(/\s+/g, "-").toLowerCase()
					)}">
            <thead>
              <tr><th>Variable Name</th><th>Value</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${
								dockerEnvVarsHTML ||
								'<tr><td colspan="3" style="text-align:center;">No Docker environment variables defined</td></tr>'
							}
            </tbody>
          </table>
        </div>
      </div>
    `;
	});

	// Serialize team members
	function renderTeamToHTML(roleMembers) {
		if (!roleMembers || roleMembers.length === 0) {
			return '<li class="no-members">No team members added</li>';
		}

		return roleMembers
			.map(
				(member) => `
      <li>
        <span class="member-name">${escapeHTML(member.name)}</span>
        ${
					member.contribution
						? `<div class="member-contribution">
          <i class="fas fa-tasks"></i> ${escapeHTML(member.contribution)}
        </div>`
						: ""
				}
      </li>
    `
			)
			.join("\n");
	}

	const frontendHTML = renderTeamToHTML(teamMembers["Frontend"]);
	const backendHTML = renderTeamToHTML(teamMembers["Backend"]);
	const aimlHTML = renderTeamToHTML(teamMembers["AI/ML"]);

	const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Project Environment & Team Documentation</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
<style>
  :root {
    --primary: #4f46e5;
    --primary-light: #818cf8;
    --primary-dark: #4338ca;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --dark: #1f2937;
    --gray: #9ca3af;
    --light-gray: #f3f4f6;
    --white: #ffffff;
    --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    background: #f9fafb;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    margin: 0;
    color: var(--dark);
    line-height: 1.6;
  }
  
  .container {
    background: var(--white);
    margin: 2em auto;
    max-width: 1100px;
    padding: 2em;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
  }
  
  h1, h2, h3, h4, h5 {
    color: var(--dark);
    font-weight: 600;
    line-height: 1.3;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }
  
  h1 {
    font-size: 2.25rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
  }
  
  h2 {
    font-size: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-light);
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  h4 {
    font-size: 1.1rem;
  }
  
  h5 {
    font-size: 1rem;
  }
  
  section {
    margin-bottom: 2.5em;
    position: relative;
    background: var(--white);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  p {
    margin-bottom: 0.75em;
  }
  
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1em 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #edf2f7;
  }
  
  th {
    background: var(--light-gray);
    font-weight: 600;
    color: var(--dark);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover {
    background-color: #f9fafb;
  }
  
  code {
    background: #f2f6ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', monospace;
    font-size: 0.9em;
  }
  
  ul {
    padding-left: 0;
    list-style-type: none;
    margin-bottom: 1.5em;
  }
  
  ul li {
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .team-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .team-column {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .team-heading {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--primary-dark);
  }
  
  .team-heading i {
    margin-right: 8px;
  }
  
  .repository {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 12px;
    background: #f9fafb;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .docker-item {
    margin-bottom: 15px;
    padding: 12px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .docker-containers {
    margin-bottom: 1.5rem;
  }
  
  .member-name {
    font-weight: 500;
  }
  
  .member-contribution {
    font-size: 0.85rem;
    color: var(--gray);
    margin-top: 4px;
  }
  
  .no-members {
    text-align: center;
    color: var(--gray);
  }
  
  .env-section {
    position: relative;
    margin-bottom: 1.5rem;
  }
  
  .copy-all-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--light-gray);
    color: var(--dark);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    z-index: 5;
  }
  
  .copy-all-btn:hover {
    background: #e5e7eb;
  }
  
  .btn-sm {
    padding: 4px 8px;
    background: var(--light-gray);
    color: var(--dark);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-sm:hover {
    background: #e5e7eb;
  }
  
  .env-table {
    margin-top: 2rem;
  }
</style>

<script>
  // Function to copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
     document.execCommand('copy');
      document.body.removeChild(textarea);
    });
    
    // Show copy notification
    alert('Copied to clipboard!');
  }
  
  // Function to copy all environment variables from a table
  function copyAllFromTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    if (!rows.length) return;
    
    let envText = '';
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const name = cells[0].textContent.trim();
        const value = cells[1].textContent.trim();
        
        if (name && name !== 'No environment variables defined') {
          envText += name + '=' + value + '\n';
        }
      }
    });
    
    if (!envText) return;
    
    // Copy to clipboard
    copyToClipboard(envText);
  };
</script>

</head>
<body>
  <div class="container">
    <h1>Project Environment & Team Documentation</h1>
    
    <section>
      <h2><i class="fas fa-project-diagram"></i> Project Information</h2>
      <p><strong>Project:</strong> ${projectName || "[Not Provided]"}</p>
    </section>
    
    <section>
      <h2><i class="fas fa-code-branch"></i> Repositories</h2>
      ${reposHTML}
    </section>
    
    <section>
      <h2><i class="fas fa-users"></i> Team Members</h2>
      <div class="team-section">
        <div class="team-column">
          <div class="team-heading">
            <i class="fas fa-laptop-code"></i> Frontend
          </div>
          <ul>${frontendHTML}</ul>
        </div>

        <div class="team-column">
          <div class="team-heading">
            <i class="fas fa-server"></i> Backend
          </div>
          <ul>${backendHTML}</ul>
        </div>

        <div class="team-column">
          <div class="team-heading">
            <i class="fas fa-brain"></i> AI/ML
          </div>
          <ul>${aimlHTML}</ul>
        </div>
      </div>
    </section>
  </div>
</body>
</html>
`;

	const blob = new Blob([fullHTML], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `project-doc-${new Date().toISOString().slice(0, 10)}.html`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// Initialize on page load
window.onload = function () {
	initRepositories();
	renderTeamMembers();
};
