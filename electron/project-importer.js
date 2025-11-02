/**
 * BigDaddyG IDE - Universal Project Importer/Exporter
 * Import/Export projects from JetBrains, VS Code, Cursor, Visual Studio
 */

// Browser/Node compatibility
const fs_promises = typeof require !== 'undefined' ? require('fs').promises : null;
const path_module = typeof require !== 'undefined' ? require('path') : null;

class ProjectImporter {
  constructor() {
    this.supportedIDEs = {
      'vscode': { name: 'VS Code', configDir: '.vscode', priority: 1 },
      'cursor': { name: 'Cursor', configDir: '.cursor', priority: 2 },
      'idea': { name: 'IntelliJ IDEA', configDir: '.idea', priority: 3 },
      'pycharm': { name: 'PyCharm', configDir: '.idea', priority: 3 },
      'webstorm': { name: 'WebStorm', configDir: '.idea', priority: 3 },
      'rider': { name: 'Rider', configDir: '.idea', priority: 3 },
      'visualstudio': { name: 'Visual Studio', configFile: '*.sln', priority: 4 }
    };
  }
  
  async detectProjectType(projectPath) {
    const detected = [];
    
    // Check for VS Code / Cursor
    if (await this.exists(path.join(projectPath, '.vscode'))) {
      detected.push('vscode');
    }
    if (await this.exists(path.join(projectPath, '.cursor'))) {
      detected.push('cursor');
    }
    
    // Check for JetBrains IDEs
    if (await this.exists(path.join(projectPath, '.idea'))) {
      const ideaConfig = await this.readJetBrainsConfig(projectPath);
      detected.push(ideaConfig.type || 'idea');
    }
    
    // Check for Visual Studio
    const slnFiles = await this.findFiles(projectPath, '*.sln');
    if (slnFiles.length > 0) {
      detected.push('visualstudio');
    }
    
    return detected;
  }
  
  async importProject(projectPath, sourceIDE = null) {
    console.log(`[Importer] Importing project from: ${projectPath}`);
    
    // Auto-detect if not specified
    if (!sourceIDE) {
      const detected = await this.detectProjectType(projectPath);
      if (detected.length === 0) {
        throw new Error('No recognized IDE configuration found');
      }
      sourceIDE = detected[0]; // Use first detected
    }
    
    // Import based on IDE type
    switch (sourceIDE) {
      case 'vscode':
      case 'cursor':
        return await this.importVSCodeProject(projectPath);
      
      case 'idea':
      case 'pycharm':
      case 'webstorm':
      case 'rider':
        return await this.importJetBrainsProject(projectPath);
      
      case 'visualstudio':
        return await this.importVisualStudioProject(projectPath);
      
      default:
        throw new Error(`Unsupported IDE: ${sourceIDE}`);
    }
  }
  
  async importVSCodeProject(projectPath) {
    const config = {
      type: 'vscode',
      path: projectPath,
      settings: {},
      extensions: [],
      tasks: [],
      launch: {},
      keybindings: []
    };
    
    // Read settings.json
    const settingsPath = path.join(projectPath, '.vscode', 'settings.json');
    if (await this.exists(settingsPath)) {
      config.settings = await this.readJSON(settingsPath);
    }
    
    // Read extensions.json
    const extensionsPath = path.join(projectPath, '.vscode', 'extensions.json');
    if (await this.exists(extensionsPath)) {
      const ext = await this.readJSON(extensionsPath);
      config.extensions = ext.recommendations || [];
    }
    
    // Read tasks.json
    const tasksPath = path.join(projectPath, '.vscode', 'tasks.json');
    if (await this.exists(tasksPath)) {
      config.tasks = await this.readJSON(tasksPath);
    }
    
    // Read launch.json
    const launchPath = path.join(projectPath, '.vscode', 'launch.json');
    if (await this.exists(launchPath)) {
      config.launch = await this.readJSON(launchPath);
    }
    
    // Read keybindings
    const keybindingsPath = path.join(projectPath, '.vscode', 'keybindings.json');
    if (await this.exists(keybindingsPath)) {
      config.keybindings = await this.readJSON(keybindingsPath);
    }
    
    console.log(`[Importer] VS Code project imported: ${config.extensions.length} extensions, ${config.tasks.tasks?.length || 0} tasks`);
    
    return config;
  }
  
  async importJetBrainsProject(projectPath) {
    const config = {
      type: 'jetbrains',
      path: projectPath,
      modules: [],
      libraries: [],
      runConfigurations: [],
      codeStyles: {},
      inspections: {}
    };
    
    const ideaDir = path.join(projectPath, '.idea');
    
    // Read modules.xml
    const modulesPath = path.join(ideaDir, 'modules.xml');
    if (await this.exists(modulesPath)) {
      const modulesXml = await fs.readFile(modulesPath, 'utf-8');
      config.modules = this.parseXMLModules(modulesXml);
    }
    
    // Read workspace.xml (run configurations)
    const workspacePath = path.join(ideaDir, 'workspace.xml');
    if (await this.exists(workspacePath)) {
      const workspaceXml = await fs.readFile(workspacePath, 'utf-8');
      config.runConfigurations = this.parseXMLRunConfigs(workspaceXml);
    }
    
    // Read code style
    const codeStylePath = path.join(ideaDir, 'codeStyles', 'Project.xml');
    if (await this.exists(codeStylePath)) {
      const codeStyleXml = await fs.readFile(codeStylePath, 'utf-8');
      config.codeStyles = this.parseXMLCodeStyle(codeStyleXml);
    }
    
    console.log(`[Importer] JetBrains project imported: ${config.modules.length} modules, ${config.runConfigurations.length} run configs`);
    
    return config;
  }
  
  async importVisualStudioProject(projectPath) {
    const config = {
      type: 'visualstudio',
      path: projectPath,
      solutions: [],
      projects: [],
      configurations: []
    };
    
    // Find .sln files
    const slnFiles = await this.findFiles(projectPath, '*.sln');
    
    for (const slnFile of slnFiles) {
      const slnContent = await fs.readFile(slnFile, 'utf-8');
      const solution = this.parseSolution(slnContent, slnFile);
      config.solutions.push(solution);
      
      // Parse each project in the solution
      for (const proj of solution.projects) {
        const projPath = path.join(path.dirname(slnFile), proj.path);
        if (await this.exists(projPath)) {
          const projContent = await fs.readFile(projPath, 'utf-8');
          const projectConfig = this.parseCSProj(projContent, projPath);
          config.projects.push(projectConfig);
        }
      }
    }
    
    console.log(`[Importer] Visual Studio project imported: ${config.solutions.length} solutions, ${config.projects.length} projects`);
    
    return config;
  }
  
  async exportProject(projectConfig, targetIDE, outputPath) {
    console.log(`[Exporter] Exporting project to ${targetIDE} at: ${outputPath}`);
    
    switch (targetIDE) {
      case 'vscode':
      case 'cursor':
        return await this.exportToVSCode(projectConfig, outputPath);
      
      case 'idea':
      case 'pycharm':
      case 'webstorm':
        return await this.exportToJetBrains(projectConfig, outputPath);
      
      case 'visualstudio':
        return await this.exportToVisualStudio(projectConfig, outputPath);
      
      default:
        throw new Error(`Unsupported target IDE: ${targetIDE}`);
    }
  }
  
  async exportToVSCode(config, outputPath) {
    const vscodeDir = path.join(outputPath, '.vscode');
    await fs.mkdir(vscodeDir, { recursive: true });
    
    // Write settings.json
    if (config.settings && Object.keys(config.settings).length > 0) {
      await this.writeJSON(path.join(vscodeDir, 'settings.json'), config.settings);
    }
    
    // Write extensions.json
    if (config.extensions && config.extensions.length > 0) {
      await this.writeJSON(path.join(vscodeDir, 'extensions.json'), {
        recommendations: config.extensions
      });
    }
    
    // Write tasks.json
    if (config.tasks) {
      await this.writeJSON(path.join(vscodeDir, 'tasks.json'), config.tasks);
    }
    
    // Write launch.json
    if (config.launch && Object.keys(config.launch).length > 0) {
      await this.writeJSON(path.join(vscodeDir, 'launch.json'), config.launch);
    }
    
    console.log(`[Exporter] VS Code configuration exported to: ${vscodeDir}`);
    return vscodeDir;
  }
  
  async exportToJetBrains(config, outputPath) {
    const ideaDir = path.join(outputPath, '.idea');
    await fs.mkdir(ideaDir, { recursive: true });
    
    // Create basic JetBrains structure
    await this.writeXML(path.join(ideaDir, 'modules.xml'), this.generateModulesXML(config));
    await this.writeXML(path.join(ideaDir, 'misc.xml'), this.generateMiscXML(config));
    
    console.log(`[Exporter] JetBrains configuration exported to: ${ideaDir}`);
    return ideaDir;
  }
  
  async exportToVisualStudio(config, outputPath) {
    // Generate .sln file
    const slnContent = this.generateSolution(config);
    const slnPath = path.join(outputPath, `${config.name || 'Project'}.sln`);
    await fs.writeFile(slnPath, slnContent, 'utf-8');
    
    console.log(`[Exporter] Visual Studio solution exported to: ${slnPath}`);
    return slnPath;
  }
  
  // Helper methods
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async readJSON(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    // Remove comments (VS Code allows them in JSON)
    const cleaned = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
  }
  
  async writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
  async writeXML(filePath, content) {
    await fs.writeFile(filePath, content, 'utf-8');
  }
  
  async findFiles(dir, pattern) {
    const files = [];
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    async function scan(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (regex.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }
  
  parseXMLModules(xml) {
    const matches = xml.matchAll(/filepath=["']([^"']+)["']/g);
    return Array.from(matches, m => m[1]);
  }
  
  parseXMLRunConfigs(xml) {
    const configs = [];
    const regex = /<configuration[^>]*name=["']([^"']+)["'][^>]*>/g;
    const matches = xml.matchAll(regex);
    for (const match of matches) {
      configs.push({ name: match[1] });
    }
    return configs;
  }
  
  parseXMLCodeStyle(xml) {
    return { xml }; // Simplified
  }
  
  parseSolution(content, filePath) {
    const projects = [];
    const regex = /Project\("{[^}]+}"\) = "([^"]+)", "([^"]+)"/g;
    const matches = content.matchAll(regex);
    
    for (const match of matches) {
      projects.push({ name: match[1], path: match[2] });
    }
    
    return { name: path.basename(filePath, '.sln'), projects };
  }
  
  parseCSProj(content, filePath) {
    return { name: path.basename(filePath), content };
  }
  
  generateModulesXML(config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectModuleManager">
    <modules>
      <module fileurl="file://$PROJECT_DIR$/.idea/${config.name || 'project'}.iml" filepath="$PROJECT_DIR$/.idea/${config.name || 'project'}.iml" />
    </modules>
  </component>
</project>`;
  }
  
  generateMiscXML(config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectRootManager" version="2" project-jdk-name="BigDaddyG" project-jdk-type="SDK">
    <output url="file://$PROJECT_DIR$/out" />
  </component>
</project>`;
  }
  
  generateSolution(config) {
    return `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "${config.name || 'Project'}", "${config.name || 'Project'}.csproj", "{${this.generateGUID()}}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
EndGlobal`;
  }
  
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }
  
  async readJetBrainsConfig(projectPath) {
    // Determine specific JetBrains IDE type
    const miscPath = path.join(projectPath, '.idea', 'misc.xml');
    if (await this.exists(miscPath)) {
      const content = await fs.readFile(miscPath, 'utf-8');
      if (content.includes('Python')) return { type: 'pycharm' };
      if (content.includes('JavaScript')) return { type: 'webstorm' };
      if (content.includes('.NET')) return { type: 'rider' };
    }
    return { type: 'idea' };
  }
}

// Browser/Node compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectImporter;
} else {
  window.ProjectImporter = ProjectImporter;
}

