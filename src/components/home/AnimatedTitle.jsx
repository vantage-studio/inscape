import { useEffect, useRef, useState, useCallback } from "react";
import CaseStudy from "../case-study/CaseStudy";
import { useNavigate } from "react-router-dom";

// Update the glob pattern to look in metadata project directories
const dynamicImages = import.meta.glob(
  "../../assets/metadata/*/photographs/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const AnimatedTitle = () => {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const loadedImgsRef = useRef([]);
  const eventListenersRef = useRef({});
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  // Add state persistence with initialization tracking
  const persistentState = useRef({
    progress: 0,
    initialized: false,
    floatStartTime: null,
    animationFrameId: null,
    canvas: null,
    ctx: null,
    drawFunction: null,
  });

  // Add at the top of useEffect, with other state variables
  let hoveredImageIndex = -1;
  let imagePositions = [];

  // Add these near the top of useEffect with other state variables
  let targetScales = new Array(200).fill(1); // Array to store target scales
  let currentScales = new Array(200).fill(1); // Array to store current scales
  let currentZooms = new Array(200).fill(1); // Array to store current zoom values
  let targetZooms = new Array(200).fill(1); // Array to store target zoom values

  // Add these constants near other drag-related constants
  const MIN_DRAG_DISTANCE = 5; // Minimum pixels moved to consider it a drag
  let dragStartX = 0;
  let dragStartY = 0;
  let totalDragDistance = 0;

  // After all the constant definitions and before the useEffect
  useEffect(() => {
    if (persistentState.current.initialized) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    persistentState.current.canvas = canvas;
    persistentState.current.ctx = ctx;

    // Initialize canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let progress = persistentState.current.progress;
    let animationFrameId;

    const easeInOutQuart = (x) => {
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    };

    const easeInExpo = (x) => {
      return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    };

    const easeOutExpo = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    // Image grid setup
    const IMAGE_WIDTH = 350;
    const SQUARE_HEIGHT = IMAGE_WIDTH;
    const RECT_HEIGHT = IMAGE_WIDTH * 1.5;
    const SPACING = IMAGE_WIDTH * 0.2;

    // Adjust drag intensity parameters for balanced movement and strong momentum
    const DRAG_RESISTANCE = 0.0004; // Increased resistance for more control
    const ELASTIC_STRENGTH = 0.003; // Gentler elastic effect
    const BOUNDS_SOFTNESS = 0.99; // Keep soft boundaries
    const SMOOTH_FACTOR = 0.92; // More smoothing
    const MOMENTUM_RETENTION = 0.975; // Increased for longer momentum
    const MINIMUM_VELOCITY = 0.05; // Higher threshold to maintain momentum longer
    const TEXT_MOVEMENT_SCALE = 0.3;
    const VELOCITY_SMOOTHING = 0.92; // More smoothing
    const SPEED_MULTIPLIER = 1.8; // Balanced speed multiplier
    const MIN_SPEED_THRESHOLD = 0.15; // Adjusted threshold

    // Update text movement constraints
    const TEXT_HORIZONTAL_LIMIT = 1.3; // Allows movement 30% outside view on each side

    // Update these constants
    const FLOAT_SPEED = 0.00025; // Adjusted for smoother movement
    const FLOAT_AMOUNT = 10; // Reduced for stability
    const FLOAT_START_DELAY = 2; // Longer delay for smoother start
    const FLOAT_TRANSITION_DURATION = 5; // Much longer for no shaking

    // Add these for more complex motion
    const FLOAT_WAVE_1 = { speed: 0.00015, amount: 12 };
    const FLOAT_WAVE_2 = { speed: 0.00008, amount: 6 };
    const FLOAT_WAVE_3 = { speed: 0.00025, amount: 4 };
    const COLUMN_OFFSET = 0.15; // Offset between columns

    // Add these constants at the top
    const PARALLAX_STRENGTH = 0.03; // How much the canvas moves (smaller = more subtle)
    const PARALLAX_SMOOTHING = 0.1; // How smoothly it follows (smaller = smoother)

    // Add these variables with other state variables
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let parallaxOffsetX = 0;
    let parallaxOffsetY = 0;

    // Add these constants near the top with other constants
    const MIN_ZOOM = 0.6;
    const MAX_ZOOM = 1.6;
    const ZOOM_SPEED = 0.03;

    // Add these variables with other state variables
    let currentZoom = 1;
    let targetZoom = 1;

    // Add easing function for zoom
    const easeOutExpoZoom = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const calculateMaxOffset = () => {
      // Get all available unique images
      const availableImages = [...new Set(Object.keys(dynamicImages))];
      const TOTAL_IMAGES = availableImages.length;

      // Calculate dynamic number of columns
      const TOTAL_COLUMNS = Math.min(
        Math.ceil(Math.sqrt(TOTAL_IMAGES) * 1.5),
        Math.ceil(TOTAL_IMAGES / 3)
      );

      // Calculate maximum images per column based on distribution
      const CENTER_COLUMN = Math.floor(TOTAL_COLUMNS / 2);
      const maxImagesPerColumn = Math.ceil(
        (TOTAL_IMAGES / TOTAL_COLUMNS) * 1.5
      );

      // Calculate total width and height with extra spacing
      const totalWidth = TOTAL_COLUMNS * (IMAGE_WIDTH + SPACING);
      const totalHeight = maxImagesPerColumn * (RECT_HEIGHT + SPACING);

      // Add equal padding on all sides (percentage of viewport)
      const HORIZONTAL_PADDING = window.innerWidth * 0.25; // 25% padding on each side
      const VERTICAL_PADDING = Math.max(
        window.innerHeight * 0.35, // 35% minimum padding
        (window.innerHeight - totalHeight) / 2 + window.innerHeight * 0.2 // Ensure at least 20% extra space
      );

      // Calculate the maximum allowed offset to maintain equal spacing
      const maxOffsetX = Math.max(
        totalWidth / 2 - window.innerWidth / 2 + HORIZONTAL_PADDING,
        0
      );
      const maxOffsetY = Math.max(
        totalHeight / 2 - window.innerHeight / 2 + VERTICAL_PADDING,
        0
      );

      return {
        x: maxOffsetX,
        y: maxOffsetY,
      };
    };

    const generateImages = () => {
      // Get all available unique images
      const availableImages = [...new Set(Object.keys(dynamicImages))];
      const TOTAL_IMAGES = availableImages.length;

      // Calculate number of columns based on total images
      // We want enough columns to create a nice curve, but not too many
      const TOTAL_COLUMNS = Math.min(
        Math.ceil(Math.sqrt(TOTAL_IMAGES) * 1.5),
        Math.ceil(TOTAL_IMAGES / 3)
      );

      // Initialize array to hold images
      const images = [];
      const TEXT_ANIMATION_DELAY = 0.3;
      const initialScaleFactor = 0.2;

      // Create a distribution curve for images per column
      const columnDistribution = [];
      const CENTER_COLUMN = Math.floor(TOTAL_COLUMNS / 2);
      let remainingImages = TOTAL_IMAGES;

      // Calculate images per column using a bell curve distribution
      for (let col = 0; col < TOTAL_COLUMNS; col++) {
        // Calculate distance from center (0 to 1)
        const distanceFromCenter =
          Math.abs(col - CENTER_COLUMN) / CENTER_COLUMN;
        // Use a bell curve function to determine column height
        const columnRatio = Math.exp(
          -distanceFromCenter * distanceFromCenter * 2
        );
        // Calculate images for this column
        const imagesInColumn = Math.max(
          2,
          Math.floor((TOTAL_IMAGES / TOTAL_COLUMNS) * columnRatio * 1.5)
        );
        columnDistribution[col] = Math.min(imagesInColumn, remainingImages);
        remainingImages -= columnDistribution[col];
      }

      // Distribute any remaining images to center columns
      while (remainingImages > 0) {
        for (let col = 0; col < TOTAL_COLUMNS && remainingImages > 0; col++) {
          const distanceFromCenter = Math.abs(col - CENTER_COLUMN);
          if (distanceFromCenter < TOTAL_COLUMNS / 4) {
            columnDistribution[col]++;
            remainingImages--;
          }
        }
      }

      // Calculate total height for each column
      const columnHeights = columnDistribution.map((count) => {
        let height = 0;
        for (let i = 0; i < count; i++) {
          const isRectangle = Math.random() < 0.5;
          height += (isRectangle ? RECT_HEIGHT : SQUARE_HEIGHT) + SPACING;
        }
        return height;
      });

      // Find maximum column height for centering
      const maxColumnHeight = Math.max(...columnHeights);

      // Track which images have been used
      let imageIndex = 0;

      // Generate images for each column
      for (let col = 0; col < TOTAL_COLUMNS; col++) {
        const xPosition =
          (col - (TOTAL_COLUMNS - 1) / 2) * (IMAGE_WIDTH + SPACING);
        let yPosition = -(columnHeights[col] / 2);

        // Add images to this column
        for (let i = 0; i < columnDistribution[col]; i++) {
          if (imageIndex >= availableImages.length) break;

          const isRectangle = Math.random() < 0.5;
          const height = isRectangle ? RECT_HEIGHT : SQUARE_HEIGHT;
          const imageUrl = availableImages[imageIndex++];

          images.push({
            url: imageUrl,
            name: imageUrl.split("/").pop().split(".")[0],
            x: xPosition * initialScaleFactor,
            y: yPosition * initialScaleFactor,
            width: IMAGE_WIDTH,
            height: height,
            delay: TEXT_ANIMATION_DELAY + (Math.random() * 0.2 + 0.1),
            initialScale: initialScaleFactor,
            targetScale: 1,
            finalX: xPosition,
            finalY: yPosition,
            cursor: "pointer",
            objectFit: "cover",
            clipPath: true,
          });

          yPosition += height + SPACING;
        }
      }

      return images;
    };

    const allImages = generateImages();

    // Define drawText function
    const drawText = (loadedImgs = []) => {
      if (!canvas || !ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Update zoom smoothly with easing
      const zoomDelta = targetZoom - currentZoom;
      const easedZoomStep =
        easeOutExpoZoom(Math.abs(zoomDelta)) *
        Math.sign(zoomDelta) *
        ZOOM_SPEED;
      currentZoom += easedZoomStep;

      let fontSize;
      if (window.innerWidth > 1200) {
        fontSize = window.innerWidth * 0.15;
      } else if (window.innerWidth > 768) {
        fontSize = window.innerWidth * 0.12;
      } else {
        fontSize = window.innerWidth * 0.09;
      }

      fontSize = Math.min(Math.max(fontSize, 48), 180);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply zoom to entire canvas
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(currentZoom, currentZoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Calculate text position with constraints
      const maxHorizontalMove = canvas.width * 0.3; // 30% of screen width

      // Allow text to move 30% outside the view
      const textOffsetX = Math.max(
        -maxHorizontalMove,
        Math.min(maxHorizontalMove, offsetX * TEXT_MOVEMENT_SCALE)
      );

      // Keep vertical movement minimal and within view
      const textOffsetY = offsetY * TEXT_MOVEMENT_SCALE * 0.3;

      // Keep text vertically within bounds
      const textY = Math.max(
        canvas.height * 0.1,
        Math.min(canvas.height * 0.9, canvas.height / 2 + textOffsetY)
      );

      // Draw INSCAPE text with scaling
      ctx.save();
      const textScale = progress < 1.1 ? 0.2 + progress * 0.8 : 1; // Match image scale animation
      ctx.translate(canvas.width / 2 + textOffsetX, textY);
      ctx.scale(textScale, textScale);
      ctx.font = `${fontSize}px Graphik`;
      ctx.textAlign = "center";
      ctx.letterSpacing = "0.1em";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.fillText("INSCAPE", 0, 0);
      ctx.restore();

      // Create gradient mask for text fade effect
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(Math.min(1, progress), "rgba(255, 255, 255, 1)");
      gradient.addColorStop(
        Math.min(1, progress + 0.1),
        "rgba(255, 255, 255, 0)"
      );
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      // Apply mask to text
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      // After text animation, draw images
      ctx.save();
      let finalOffsetX = offsetX;
      let finalOffsetY = offsetY;

      // Apply elastic limits
      if (Math.abs(offsetX) > BOUNDS.x) {
        const excess = Math.abs(offsetX) - BOUNDS.x;
        const elasticOffset = excess * 0.2;
        finalOffsetX = (BOUNDS.x + elasticOffset) * Math.sign(offsetX);
      }

      if (Math.abs(offsetY) > BOUNDS.y) {
        const excess = Math.abs(offsetY) - BOUNDS.y;
        const elasticOffset = excess * 0.2;
        finalOffsetY = (BOUNDS.y + elasticOffset) * Math.sign(offsetY);
      }

      // Add this right after ctx.clearRect(0, 0, canvas.width, canvas.height);
      const targetParallaxX =
        (window.innerWidth / 2 - mouseX) * PARALLAX_STRENGTH;
      const targetParallaxY =
        (window.innerHeight / 2 - mouseY) * PARALLAX_STRENGTH;

      // Smooth the parallax movement
      parallaxOffsetX +=
        (targetParallaxX - parallaxOffsetX) * PARALLAX_SMOOTHING;
      parallaxOffsetY +=
        (targetParallaxY - parallaxOffsetY) * PARALLAX_SMOOTHING;

      // Modify the ctx.translate call to include parallax offset
      ctx.translate(
        canvas.width / 2 + finalOffsetX + parallaxOffsetX,
        canvas.height / 2 + finalOffsetY + parallaxOffsetY
      );

      // Check if all images are done animating before allowing pointer cursor
      const allImagesAnimated = loadedImgs.every((img) => {
        const imageProgress = Math.min(
          1,
          Math.max(0, (progress - img.delay) * 2)
        );
        return imageProgress >= 1;
      });

      loadedImgs.forEach((img, index) => {
        if (img.element) {
          const imageProgress = Math.min(
            1,
            Math.max(0, (progress - img.delay) * 2)
          );
          const easedProgress = easeInOutQuart(imageProgress);
          ctx.globalAlpha = Math.min(1, imageProgress * 1.5);

          const currentX = img.x + (img.finalX - img.x) * easedProgress;

          // Update the floatOffset calculation
          const currentTime = Date.now();

          // Initialize floatStartTime when animation is complete
          if (
            allImagesAnimated &&
            progress >= 1.1 &&
            persistentState.current.floatStartTime === null
          ) {
            persistentState.current.floatStartTime =
              currentTime + FLOAT_START_DELAY * 1000;
          }

          // Calculate column number and phase
          const columnNumber = Math.floor(
            (img.finalX + BOUNDS.x * 1.1) / (IMAGE_WIDTH + SPACING)
          );
          const columnPhase = columnNumber * Math.PI; // Full PI offset between columns

          // Simple transition calculation
          const transitionProgress = persistentState.current.floatStartTime
            ? Math.max(
                0,
                Math.min(
                  1,
                  (currentTime - persistentState.current.floatStartTime) /
                    (FLOAT_TRANSITION_DURATION * 1000)
                )
              )
            : 0;

          // Super smooth transition with double easing
          const smoothTransition = easeInOutQuart(
            easeInOutQuart(transitionProgress)
          );

          // Simplified floating calculation
          const floatOffset =
            allImagesAnimated && progress >= 1.1
              ? Math.sin(currentTime * FLOAT_SPEED + columnPhase) *
                FLOAT_AMOUNT *
                smoothTransition
              : 0;

          const currentY =
            img.y + (img.finalY - img.y) * easedProgress + floatOffset;
          const currentScale =
            img.initialScale +
            (img.targetScale - img.initialScale) * easedProgress;

          // Store the actual position INCLUDING the height/2 offset
          imagePositions[index] = {
            x: currentX,
            y: currentY + img.height / 2,
            width: img.width,
            height: img.height,
          };

          // Keep scale same, zoom at 4%
          targetScales[index] = index === hoveredImageIndex ? 1.025 : 1; // Container scale stays at 2.5%
          targetZooms[index] = index === hoveredImageIndex ? 1.04 : 1; // Internal zoom at 4%

          // Adjust speeds - make zoom smoother than scale
          const scaleSpeed = 0.035; // Scale transition speed
          const zoomSpeed = 0.065; // Faster zoom speed

          // Simple easing for reliable zoom
          const zoomDelta =
            (targetZooms[index] - currentZooms[index]) * zoomSpeed;
          currentZooms[index] += zoomDelta;
          currentScales[index] +=
            (targetScales[index] - currentScales[index]) * scaleSpeed;

          ctx.save();
          ctx.translate(currentX, currentY + img.height / 2);

          // Container scale
          ctx.scale(
            currentScale * currentScales[index],
            currentScale * currentScales[index]
          );

          // Clip path for container
          ctx.beginPath();
          ctx.rect(-img.width / 2, -img.height / 2, img.width, img.height);
          ctx.clip();

          // Calculate image dimensions while maintaining aspect ratio
          const imgAspect = img.element.width / img.element.height;
          const containerAspect = img.width / img.height;

          let drawWidth = img.width;
          let drawHeight = img.height;

          if (imgAspect > containerAspect) {
            // Image is wider than container
            drawHeight = img.height;
            drawWidth = drawHeight * imgAspect;
          } else {
            // Image is taller than container
            drawWidth = img.width;
            drawHeight = drawWidth / imgAspect;
          }

          // Apply zoom to the calculated dimensions
          drawWidth *= currentZooms[index];
          drawHeight *= currentZooms[index];

          // Center the image
          const offsetX = (drawWidth - img.width) / 2;
          const offsetY = (drawHeight - img.height) / 2;

          // Draw image with proper centering, aspect ratio, and zoom
          ctx.drawImage(
            img.element,
            -img.width / 2 - offsetX,
            -img.height / 2 - offsetY,
            drawWidth,
            drawHeight
          );

          ctx.restore();
        }
      });

      ctx.restore();

      // Update progress during animation phase
      if (progress < 1.1) {
        progress += 0.003;
      }

      // Smoother momentum and elastic return
      updateMomentum();

      // At the end of drawText, before requestAnimationFrame
      ctx.restore();

      // Store the animation frame ID
      persistentState.current.animationFrameId = requestAnimationFrame(() =>
        drawText(loadedImgs)
      );
    };

    // Store the drawText function in persistent state
    persistentState.current.drawFunction = drawText;

    // Load images
    const loadedImages = allImages.map((img) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = dynamicImages[img.url] || "";
        image.onload = () => resolve({ ...img, element: image });
        image.onerror = () => {
          console.error(`Failed to load image: ${img.url}`);
          resolve({ ...img, element: null });
        };
      });
    });

    // Initialize only if not already done
    if (!persistentState.current.initialized) {
      Promise.all(loadedImages).then((loadedImgs) => {
        loadedImgsRef.current = loadedImgs;
        persistentState.current.initialized = true;
        // Start the animation
        persistentState.current.drawFunction(loadedImgs);
      });
    }

    // Keep track of drag state and momentum
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastTime = 0;

    // Use dynamic boundaries
    const BOUNDS = calculateMaxOffset();

    // Add these variables for tracking movement
    let lastDX = 0;
    let lastDY = 0;
    let smoothVelocityX = 0;
    let smoothVelocityY = 0;

    // Update momentum handling for smoother deceleration
    const updateMomentum = () => {
      if (!isDragging) {
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        if (speed > MINIMUM_VELOCITY) {
          // Enhanced momentum decay
          velocityX *= MOMENTUM_RETENTION;
          velocityY *= MOMENTUM_RETENTION;

          // Apply elastic bounds with enhanced smoothing
          const elasticX = applyElasticBounds(offsetX, velocityX, BOUNDS.x);
          const elasticY = applyElasticBounds(offsetY, velocityY, BOUNDS.y);

          // Smooth position updates
          offsetX += (elasticX.offset - offsetX) * 0.1;
          offsetY += (elasticY.offset - offsetY) * 0.1;

          // Maintain momentum longer
          velocityX = elasticX.velocity * 0.98 + velocityX * 0.02;
          velocityY = elasticY.velocity * 0.98 + velocityY * 0.02;

          // Gradual boundary return force
          if (Math.abs(offsetX) > BOUNDS.x * 0.8) {
            velocityX -= Math.sign(offsetX) * ELASTIC_STRENGTH * 1.5;
          }
          if (Math.abs(offsetY) > BOUNDS.y * 0.8) {
            velocityY -= Math.sign(offsetY) * ELASTIC_STRENGTH * 1.5;
          }
        } else {
          // Gradual velocity reduction
          velocityX *= 0.95;
          velocityY *= 0.95;
          if (Math.abs(velocityX) < 0.01) velocityX = 0;
          if (Math.abs(velocityY) < 0.01) velocityY = 0;
        }
      }
    };

    // Update handleMouseDown
    const handleMouseDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      totalDragDistance = 0;
      lastTime = Date.now();
      velocityX = 0;
      velocityY = 0;
      canvas.style.cursor = "grabbing";
    };

    // Update handleMouseMove to remove the duplicate updateMomentum function
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const currentMouseX = e.clientX - rect.left;
      const currentMouseY = e.clientY - rect.top;

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (isDragging) {
        // Calculate total distance moved during this drag
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        totalDragDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate frame delta movement with time-based smoothing
        const currentTime = Date.now();
        const deltaTime = Math.min(currentTime - lastTime, 30); // Cap delta time
        const timeScale = deltaTime / 16.667; // Normalize to 60fps

        // Direct movement calculation with smoothing
        const frameDX = (e.clientX - lastX) * timeScale;
        const frameDY = (e.clientY - lastY) * timeScale;

        // Enhanced speed calculation
        const currentSpeed = Math.sqrt(frameDX * frameDX + frameDY * frameDY);

        // Smoother speed multiplier with better acceleration
        const speedMultiplier =
          currentSpeed > MIN_SPEED_THRESHOLD
            ? 1 + Math.pow(currentSpeed * 0.015, 1.2) * SPEED_MULTIPLIER
            : SPEED_MULTIPLIER;

        // Smooth velocity calculation
        const targetVelocityX = frameDX * speedMultiplier;
        const targetVelocityY = frameDY * speedMultiplier;

        // Apply smoothing to velocity
        velocityX += (targetVelocityX - velocityX) * VELOCITY_SMOOTHING;
        velocityY += (targetVelocityY - velocityY) * VELOCITY_SMOOTHING;

        // Apply movement with smoothing
        const newOffsetX = offsetX + velocityX * 0.6; // Reduced direct movement impact
        const newOffsetY = offsetY + velocityY * 0.6;

        // Simple boundary handling with smoothing
        if (Math.abs(newOffsetX) > BOUNDS.x) {
          const excess = Math.abs(newOffsetX) - BOUNDS.x;
          const resistance = 1 / (1 + excess * DRAG_RESISTANCE);
          offsetX += velocityX * resistance * 0.6;
        } else {
          offsetX = newOffsetX;
        }

        if (Math.abs(newOffsetY) > BOUNDS.y) {
          const excess = Math.abs(newOffsetY) - BOUNDS.y;
          const resistance = 1 / (1 + excess * DRAG_RESISTANCE);
          offsetY += velocityY * resistance * 0.6;
        } else {
          offsetY = newOffsetY;
        }

        // Store values for next frame
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = currentTime;
      }

      // Convert mouse position to canvas space
      const canvasX =
        (currentMouseX - canvas.width / 2 - offsetX - parallaxOffsetX) /
        currentZoom;
      const canvasY =
        (currentMouseY - canvas.height / 2 - offsetY - parallaxOffsetY) /
        currentZoom;

      // Check if mouse is over any image
      let isOverImage = false;
      for (let i = imagePositions.length - 1; i >= 0; i--) {
        const pos = imagePositions[i];
        if (pos) {
          if (
            canvasX >= pos.x - pos.width / 2 &&
            canvasX <= pos.x + pos.width / 2 &&
            canvasY >= pos.y - pos.height / 2 &&
            canvasY <= pos.y + pos.height / 2
          ) {
            hoveredImageIndex = i;
            isOverImage = true;
            canvas.style.cursor = isDragging ? "grabbing" : "pointer";
            break;
          }
        }
      }

      if (!isOverImage) {
        hoveredImageIndex = -1;
        canvas.style.cursor = isDragging ? "grabbing" : "grab";
      }
    };

    // Update handleClick
    const handleClick = (e) => {
      // Only trigger click if we haven't dragged past the threshold
      if (totalDragDistance < MIN_DRAG_DISTANCE && hoveredImageIndex !== -1) {
        const clickedImage = loadedImgsRef.current[hoveredImageIndex];
        if (clickedImage) {
          const imageName = clickedImage.name;
          setSelectedImage(imageName);
          setShowCaseStudy(true);
          navigate(`/case-study/${imageName}`, {
            state: { fromCanvas: true },
            replace: false,
          });
        }
      }
    };

    // Update handleMouseUp
    const handleMouseUp = () => {
      isDragging = false;
      if (hoveredImageIndex !== -1 && totalDragDistance < MIN_DRAG_DISTANCE) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "grab";
      }
    };

    const handleMouseLeave = () => {
      isDragging = false;
      hoveredImageIndex = -1;
      canvas.style.cursor = "grab";
    };

    const handleWheel = (e) => {
      e.preventDefault();
      targetZoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          targetZoom + (e.deltaY < 0 ? -ZOOM_SPEED : ZOOM_SPEED)
        )
      );
    };

    // Store listeners in ref
    eventListenersRef.current = {
      mousedown: handleMouseDown,
      mousemove: handleMouseMove,
      click: handleClick,
      mouseup: handleMouseUp,
      mouseleave: handleMouseLeave,
      wheel: handleWheel,
    };

    // Attach listeners only once
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel);

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      drawText(loadedImages); // Pass loaded images
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Update the elastic boundary handling
    const applyElasticBounds = (offset, velocity, bound) => {
      if (Math.abs(offset) > bound) {
        const excess = Math.abs(offset) - bound;
        // More gradual resistance increase
        const elasticForce = Math.pow(
          excess * ELASTIC_STRENGTH,
          BOUNDS_SOFTNESS
        );
        const resistance = 1 / (1 + elasticForce);

        // Smoother bounce effect
        const bounceForce = Math.min(excess * 0.1, bound * 0.2);

        return {
          offset: (bound + bounceForce * resistance) * Math.sign(offset),
          velocity: velocity * resistance * 0.8, // Additional dampening
        };
      }
      return { offset, velocity };
    };

    const updatePositions = () => {
      // Calculate the maximum allowed title movement (25% of viewport)
      const maxTitleOffsetX = viewportWidth * 0.25;
      const maxTitleOffsetY = viewportHeight * 0.25;

      // Calculate title movement based on image bounds and current offset
      if (titleRef.current) {
        // Scale the title movement relative to image movement
        const titleMovementScale = 0.3; // Adjust this value to change how much the title moves

        // Calculate normalized offset based on BOUNDS
        const normalizedOffsetX = Math.max(-1, Math.min(1, offsetX / BOUNDS.x));
        const normalizedOffsetY = Math.max(-1, Math.min(1, offsetY / BOUNDS.y));

        // Apply movement with limits
        const titleX = normalizedOffsetX * maxTitleOffsetX * titleMovementScale;
        const titleY = normalizedOffsetY * maxTitleOffsetY * titleMovementScale;

        // Apply smooth transform
        titleRef.current.style.transform = `translate(${titleX}px, ${titleY}px)`;
      }

      requestAnimationFrame(updatePositions);
    };

    // Modify the cleanup to preserve state
    return () => {
      if (persistentState.current.animationFrameId) {
        cancelAnimationFrame(persistentState.current.animationFrameId);
      }
      // Only clean up event listeners
      Object.entries(eventListenersRef.current).forEach(([event, handler]) => {
        canvas.removeEventListener(event, handler);
      });
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this runs once

  // Modify the animation resumption effect
  useEffect(() => {
    if (!persistentState.current.initialized || showCaseStudy) {
      return;
    }

    // Resume animation if it was paused
    if (
      persistentState.current.drawFunction &&
      loadedImgsRef.current.length > 0
    ) {
      persistentState.current.drawFunction(loadedImgsRef.current);
    }

    return () => {
      if (persistentState.current.animationFrameId) {
        cancelAnimationFrame(persistentState.current.animationFrameId);
      }
    };
  }, [showCaseStudy]);

  const handleCaseStudyClose = useCallback(() => {
    setShowCaseStudy(false);
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      if (!event.state?.fromCanvas) {
        setShowCaseStudy(false);
        setSelectedImage(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" />
      {showCaseStudy && (
        <CaseStudy
          imageName={selectedImage}
          onClose={handleCaseStudyClose}
          onBeforeClose={() => {
            if (
              persistentState.current.drawFunction &&
              loadedImgsRef.current.length > 0
            ) {
              persistentState.current.animationFrameId = requestAnimationFrame(
                () =>
                  persistentState.current.drawFunction(loadedImgsRef.current)
              );
            }
          }}
        />
      )}
    </>
  );
};

export default AnimatedTitle;
