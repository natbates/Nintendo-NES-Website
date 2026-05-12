import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResources } from '../context/ResourceContext';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../styles/ModelDetailCanvas.css';
import LightingControl from './LightingControl';
import {
  getModelMaterials,
  cacheMaterialDefaults,
  playAnimationByName,
  applyTextureDefinition,
  restoreMaterialDefaults,
} from '../utils/canvasUtils.ts';
import {
  createSceneLights,
  applyLightStrength,
  frameCameraToModel,
} from '../utils/sceneSetupUtils.ts';
import CanvasControlBar from './CanvasControlBar';
import LoadingSpinner from './LoadingSpinner';
import { FaPlus, FaMinus } from 'react-icons/fa6';

function ModelDetailCanvas({ productKey }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const controlsRef = useRef(null);
  const clipsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const materialDefaultsRef = useRef(new Map());
  const textureCacheRef = useRef(new Map());
  const audioCacheRef = useRef(new Map());
  const currentAudioRef = useRef(null);
  const lightRefs = useRef({});

  const [wireframeMode, setWireframeMode] = useState(false);
  const [selectedStateKey, setSelectedStateKey] = useState(null);
  const [selectedTextureKey, setSelectedTextureKey] = useState(null);
  const [lightStrength, setLightStrength] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);

  const { modelConfigs, makeModelPath, resolveResourceValue } = useResources();
  const config = modelConfigs?.[productKey];

  useEffect(() => {
    if (!config) {
      setModelLoading(false); // No config means nothing to load for this route.
    }
  }, [config]);

  const animationActions = useMemo(
    () => (Array.isArray(config?.animations) ? config.animations : []),
    [config]
  );

  const textureOptions = useMemo(
    () => (Array.isArray(config?.textures) ? config.textures : []),
    [config]
  );

  const stateOptions = useMemo(
    () => (Array.isArray(config?.states) ? config.states : []),
    [config]
  );

  const hasSoundControls = useMemo(
    () => Boolean(
      (config?.animations || []).some((animationDef) => animationDef?.soundFile) ||
      (config?.states || []).some((stateDef) => stateDef?.soundFile) ||
      (config?.sounds || []).length > 0
    ),
    [config]
  );

  const toggleWireframe = () => {
    const nextWireframeState = !wireframeMode;
    getModelMaterials(modelRef.current).forEach((material) => {
      material.wireframe = nextWireframeState;
      material.needsUpdate = true;
    });
    setWireframeMode(nextWireframeState);
  };

  const handleZoom = useCallback((direction) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (direction === 'in') {
      controls.dollyOut(1.15);
    } else {
      controls.dollyIn(1.15);
    }

    controls.update();
  }, []);

  useEffect(() => {
    if (!config) return;

    const candidates = [];
    (config.animations || []).forEach(a => a.soundFile && candidates.push(a.soundFile));
    (config.states || []).forEach(s => s.soundFile && candidates.push(s.soundFile));
    (config.sounds || []).forEach(s => s.file && candidates.push(s.file));

    candidates.forEach((sf) => {
      try {
        const src = resolveResourceValue(sf);
        if (src && !audioCacheRef.current.has(src)) {
          const a = new Audio(src);
          a.preload = 'auto';
          audioCacheRef.current.set(src, a);
        }
      } catch (e) {
        // ignore preload errors
      }
    });
  }, [config, resolveResourceValue]);

  const playSound = useCallback((soundFile, { loop = false, volume = 1 } = {}) => {
    if (!soundEnabled) return;
    if (!soundFile) return;
    const src = resolveResourceValue(soundFile);
    if (!src) return;

    let audio = audioCacheRef.current.get(src);
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audioCacheRef.current.set(src, audio);
    }

    if (currentAudioRef.current && currentAudioRef.current !== audio) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
    }

    currentAudioRef.current = audio;
    audio.loop = loop;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((err) => {
      console.warn('[ModelDetailCanvas] Audio play failed', err);
    });
  }, [resolveResourceValue, soundEnabled]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); } catch (e) {}
        currentAudioRef.current = null;
      }
      audioCacheRef.current.forEach((a) => {
        try { a.pause(); } catch (e) {}
      });
      audioCacheRef.current.clear();
    };
  }, []);

  const playAnimationHandler = useCallback(
    (animationDef) => {
      if (!animationDef) return;
      playAnimationByName(mixerRef.current, clipsRef.current, animationDef.animation);
      playSound(animationDef.soundFile);
    },
    [playSound]
  );

  const handleTexture = useCallback(
    async (textureDef) => {
      if (!textureDef) return;
      setSelectedTextureKey(textureDef.key || null);
      await applyTextureDefinition(modelRef.current, textureDef, textureCacheRef.current, resolveResourceValue);
      playSound(textureDef.soundFile, { volume: 0.2 });
    },
    [playSound, resolveResourceValue]
  );

  const applyState = useCallback(
    async (stateDef, options = {}) => {
      if (!stateDef) return;

      const { playEffects = true } = options;

      setSelectedStateKey(stateDef.key || null);

      if (stateDef.resetToDefault) {
        restoreMaterialDefaults(modelRef.current, materialDefaultsRef.current, stateDef.materialName);
      }

      if (stateDef.textureKey && textureOptions.length > 0) {
        const matchedTexture = textureOptions.find((texture) => texture.key === stateDef.textureKey);
        if (matchedTexture) {
          setSelectedTextureKey(matchedTexture.key || null);
          await applyTextureDefinition(modelRef.current, matchedTexture, textureCacheRef.current, resolveResourceValue);
          if (playEffects) {
            playSound(matchedTexture.soundFile, { volume: 0.2 });
          }
        }
      }

      if (stateDef.textureFile || stateDef.texture || stateDef.emissiveTextureFile || stateDef.emissiveTexture) {
        await applyTextureDefinition(modelRef.current, stateDef, textureCacheRef.current, resolveResourceValue);
        if (playEffects) {
          playSound(stateDef.soundFile, { volume: 0.2 });
        }
      }

      if (typeof stateDef.emissiveIntensity === 'number') {
        getModelMaterials(modelRef.current).forEach((material) => {
          const targetMaterial = stateDef.materialName
            ? (material.name || '').toLowerCase().includes(stateDef.materialName.toLowerCase())
            : true;
          if (!targetMaterial || !(material && 'emissiveIntensity' in material)) return;
          material.emissiveIntensity = stateDef.emissiveIntensity;
          material.needsUpdate = true;
        });
      }

      if (playEffects) {
        playAnimationByName(mixerRef.current, clipsRef.current, stateDef.animation, {
          reverse: Boolean(stateDef.reverseAnimation),
        });
        playSound(stateDef.soundFile);
      }
    },
    [playSound, textureOptions, resolveResourceValue]
  );

  const cycleState = useCallback(() => {
    if (!stateOptions || stateOptions.length === 0) return;

    const currentKey = selectedStateKey;
    let idx = stateOptions.findIndex((s) => s.key === currentKey);
    if (idx === -1) {
      idx = stateOptions.findIndex((s) => s.default);
      if (idx === -1) idx = 0;
    }

    const nextIdx = (idx + 1) % stateOptions.length;
    const nextState = stateOptions[nextIdx];
    if (nextState) {
      applyState(nextState);
    }
  }, [applyState, selectedStateKey, stateOptions]);

  useEffect(() => {
    applyLightStrength(lightRefs.current, lightStrength); // Keep lighting ratios identical while scaling brightness.
  }, [lightStrength]);

  useEffect(() => {
    if (!canvasRef.current || !config) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 140);
    camera.position.set(0, 3, 9);
    cameraRef.current = camera;

    lightRefs.current = createSceneLights(scene, lightStrength);

    const loader = new GLTFLoader();
    let isMounted = true;

    const path = makeModelPath(config.file);

    loader.load(
      path,
      (gltf) => {
        if (!isMounted) return;

        const model = gltf.scene;
        modelRef.current = model;
        mixerRef.current = gltf.animations?.length ? new THREE.AnimationMixer(model) : null;
        clipsRef.current = gltf.animations || [];

        model.rotation.z = Math.PI / 4;
        model.scale.setScalar(1);

        frameCameraToModel(camera, model);

        model.scale.setScalar(config.scale ?? 1);

        scene.add(model);

        const materialDefaults = cacheMaterialDefaults(model);
        materialDefaultsRef.current = materialDefaults;

        const defaultTexture = textureOptions.find((texture) => texture.key === config.defaultTexture);
        if (defaultTexture) {
          setSelectedTextureKey(defaultTexture.key || null);
          applyTextureDefinition(model, defaultTexture, textureCacheRef.current, resolveResourceValue);
        }

        const defaultState = stateOptions.find((state) => state.default);
        if (defaultState) {
          applyState(defaultState, { playEffects: false });
        }

        setTimeout(() => {
          if (isMounted) setModelLoading(false); // Prevent a flash of empty canvas before first paint.
        }, 400);
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err);
        setTimeout(() => {
          if (isMounted) setModelLoading(false); // Release loading UI even when model fetch fails.
        }, 400);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    let lastFrameTimeRef = 0;
    const animate = (timeMs = 0) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const model = modelRef.current;
      const mixer = mixerRef.current;
      const deltaSeconds =
        lastFrameTimeRef > 0 ? Math.min((timeMs - lastFrameTimeRef) / 1000, 0.1) : 0;
      lastFrameTimeRef = timeMs;

      if (mixer && deltaSeconds > 0) {
        mixer.update(deltaSeconds);
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (model) {
        model.rotation.z = Math.PI / 4;
        model.scale.setScalar(config.scale ?? 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;

      const newWidth = canvasRef.current.clientWidth || 800;
      const newHeight = canvasRef.current.clientHeight || 600;

      rendererRef.current.setSize(newWidth, newHeight, false);
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [config, makeModelPath, applyState, stateOptions, textureOptions, resolveResourceValue]);

  // Render page and show an inline spinner over the canvas while loading

  return (
    <div className="model-detail-canvas-container">
      <div className="model-detail-canvas-shell">


        <canvas ref={canvasRef} className="model-detail-canvas" />

        {modelLoading && (
          <div className="model-inline-spinner">
            <LoadingSpinner fullScreen={false} message="Loading model..." />
          </div>
        )}

        <CanvasControlBar
          className="model-canvas-control-bar"
          showSpinToggle={false}
          showSoundToggle={hasSoundControls}
          soundEnabled={soundEnabled}
          onSoundToggle={setSoundEnabled}
        />

        <div className="model-detail-canvas-overlay">
          <div className="model-zoom-control-group" aria-label="Zoom controls">
            <button
              type="button"
              className="model-zoom-control"
              onClick={() => handleZoom('in')}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <FaPlus size={14} />
            </button>
            <button
              type="button"
              className="model-zoom-control"
              onClick={() => handleZoom('out')}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <FaMinus size={14} />
            </button>
          </div>

          <LightingControl
            className="overlay-lighting-control"
            value={lightStrength}
            onChange={setLightStrength}
          />

          <div className="model-canvas-button-stack">
            {textureOptions.length > 0 && (
              <div className="canvas-texture-row" role="group" aria-label="Texture options">
                {textureOptions.map((texture) => (
                  <button
                    key={texture.key || texture.label}
                    className={`texture-option-chip ${selectedTextureKey === texture.key ? 'active' : ''}`}
                    onClick={() => handleTexture(texture)}
                    title={texture.label || texture.key}
                  >
                    {texture.previewImage ? (
                      <img
                        src={resolveResourceValue(texture.previewImage)}
                        alt={texture.label || texture.key}
                        className="texture-preview-image"
                      />
                    ) : (
                      <span className="texture-preview-placeholder">{texture.label || texture.key}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {stateOptions.length > 0 && (
              <div className="canvas-state-row" role="group" aria-label="Model states">
                <button
                  className="canvas-stack-button state-btn cycle-btn"
                  onClick={cycleState}
                  title={stateOptions.find((s) => s.key === selectedStateKey)?.description || 'Cycle state'}
                >
                  {stateOptions.find((s) => s.key === selectedStateKey)?.label || 'Toggle State'}
                </button>
              </div>
            )}

            {animationActions.length > 0 && (
              <div className="canvas-animation-row" role="group" aria-label="Model animations">
                {animationActions.map((animationDef) => (
                  <button
                    key={animationDef.key || animationDef.label}
                    className="canvas-stack-button animation-btn"
                    onClick={() => playAnimationHandler(animationDef)}
                    title={animationDef.animation || animationDef.label}
                  >
                    {animationDef.label || animationDef.key}
                  </button>
                ))}
              </div>
            )}

            <button
              className={`canvas-stack-button wireframe-btn ${wireframeMode ? 'active' : ''}`}
              onClick={toggleWireframe}
              title="Toggle wireframe"
            >
              {wireframeMode ? 'Hide' : 'Show'} Wireframe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelDetailCanvas;
