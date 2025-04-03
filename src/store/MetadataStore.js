import projectsData from "../assets/metadata/projects.json";

// Basic metadata store using singleton pattern
class MetadataStore {
  static instance = null;
  metadata = null;

  static getInstance() {
    if (!MetadataStore.instance) {
      MetadataStore.instance = new MetadataStore();
      MetadataStore.instance.setMetadata(projectsData);
    }
    return MetadataStore.instance;
  }

  setMetadata(data) {
    this.metadata = data;
    console.log("Metadata initialized:", this.metadata);
  }

  getMetadata() {
    return this.metadata;
  }

  getProject(projectKey) {
    return this.metadata?.[projectKey];
  }

  getAllProjects() {
    return Object.keys(this.metadata || {});
  }

  getProjectMedia(projectKey, mediaType) {
    return this.metadata?.[projectKey]?.[mediaType] || [];
  }
}

// Create and export the singleton instance
export const metadataStore = MetadataStore.getInstance();

// Custom hook for using metadata in components
export const useMetadata = () => {
  const getProjectImages = (projectKey) => {
    const project = metadataStore.getProject(projectKey);
    if (!project) return [];

    return [
      ...(project.photographs || []),
      ...(project.photographs_portraits || []),
    ];
  };

  return {
    metadata: metadataStore.getMetadata(),
    getProject: metadataStore.getProject.bind(metadataStore),
    getAllProjects: metadataStore.getAllProjects.bind(metadataStore),
    getProjectMedia: metadataStore.getProjectMedia.bind(metadataStore),
    getProjectImages,
  };
};
