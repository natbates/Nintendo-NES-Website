import * as THREE from "three";

export const BASE_LIGHTS = {
  hemisphere: 1.15,
  ambient: 1.2,
  key: 2.25,
  fill: 1.2,
};

export const createSceneLights = (scene, lightStrength = 1) => {
  const hemisphere = new THREE.HemisphereLight(
    0xffffff,
    0xffffff,
    BASE_LIGHTS.hemisphere * lightStrength,
  );
  scene.add(hemisphere);

  const ambient = new THREE.AmbientLight(
    0xffffff,
    BASE_LIGHTS.ambient * lightStrength,
  );
  scene.add(ambient);

  const key = new THREE.DirectionalLight(
    0xffffff,
    BASE_LIGHTS.key * lightStrength,
  );
  key.position.set(6, 8, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(
    0xffffff,
    BASE_LIGHTS.fill * lightStrength,
  );
  fill.position.set(-5, 3, -4);
  scene.add(fill);

  return { hemisphere, ambient, key, fill };
};

export const applyLightStrength = (lightRefs, lightStrength) => {
  const { hemisphere, ambient, key, fill } = lightRefs || {};
  if (!hemisphere || !ambient || !key || !fill) return;

  hemisphere.intensity = BASE_LIGHTS.hemisphere * lightStrength;
  ambient.intensity = BASE_LIGHTS.ambient * lightStrength;
  key.intensity = BASE_LIGHTS.key * lightStrength;
  fill.intensity = BASE_LIGHTS.fill * lightStrength;
};

export const frameCameraToModel = (
  camera,
  model,
  { heightFactor = 0.35, distanceFactor = 1.4 } = {},
) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center); // Center model at world origin before framing.

  const maxSize = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  const distance = maxSize / (2 * Math.tan(fov / 2));

  camera.position.set(0, maxSize * heightFactor, distance * distanceFactor); // Keep same composition across models.
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
};
