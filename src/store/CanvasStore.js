import projectsData from "../assets/metadata/projects.json";

// Just log the photographs
console.log("BEACON photographs:", [
  ...projectsData.BEACON.photographs,
  ...projectsData.BEACON.photographs_portraits,
]);

console.log("BALRAM_RESIDENCE photographs:", [
  ...projectsData.BALRAM_RESIDENCE.photographs,
  ...projectsData.BALRAM_RESIDENCE.photographs_portraits,
]);

// Singleton canvas store for managing canvas state
class CanvasStore {
  static instance = null;

  constructor() {
    this.state = {
      isInitialized: false,
      progress: 0,
      floatStartTime: null,
      animationFrameId: null,
      canvas: null,
      ctx: null,
      loadedImages: [],
      offsetX: 0,
      offsetY: 0,
      currentZoom: 1,
      targetZoom: 1,
      hoveredImageIndex: -1,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      velocityX: 0,
      velocityY: 0,
      drawFunction: null,
    };
  }

  static getInstance() {
    if (!CanvasStore.instance) {
      CanvasStore.instance = new CanvasStore();
    }
    return CanvasStore.instance;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  getState() {
    return this.state;
  }

  setCanvas(canvas) {
    if (!canvas) return;
    this.state.canvas = canvas;
    this.state.ctx = canvas.getContext("2d");
  }

  setDrawFunction(drawFn) {
    this.state.drawFunction = drawFn;
  }

  startAnimation() {
    if (!this.state.isInitialized || !this.state.drawFunction) return;

    this.state.animationFrameId = requestAnimationFrame(() => {
      this.state.drawFunction(this.state.loadedImages);
    });
  }

  stopAnimation() {
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }
  }

  setImages(images) {
    this.state.loadedImages = images;
  }

  cleanup() {
    this.stopAnimation();
    this.setState({
      isInitialized: false,
      canvas: null,
      ctx: null,
      loadedImages: [],
    });
  }
}

export const canvasStore = CanvasStore.getInstance();

// Custom hook for using canvas store in components
export const useCanvasStore = () => {
  const initializeCanvas = (canvas) => {
    canvasStore.setCanvas(canvas);
    if (!canvasStore.getState().isInitialized) {
      canvasStore.setState({ isInitialized: true });
    }
  };

  const startAnimation = () => {
    canvasStore.startAnimation();
  };

  const stopAnimation = () => {
    canvasStore.stopAnimation();
  };

  const setImages = (images) => {
    canvasStore.setImages(images);
  };

  const setDrawFunction = (drawFn) => {
    canvasStore.setDrawFunction(drawFn);
  };

  return {
    state: canvasStore.getState(),
    initializeCanvas,
    startAnimation,
    stopAnimation,
    setImages,
    setDrawFunction,
  };
};
