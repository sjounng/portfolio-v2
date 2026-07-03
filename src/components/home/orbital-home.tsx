"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/theme-provider";
import { usePage } from "@/context/page-context";

type RouteId = "info" | "projects" | "notion" | "github";

const INTRO_DURATION_MS = 2400;
const INTRO_CAMERA_DISTANCE = 19;

const ROUTES: Array<{
  id: RouteId;
  href: string;
  label: string;
  fillColor: {
    light: string;
    dark: string;
  };
  offset: number;
  speed: number;
  /** 행성 크기 배율 (미세 변주로 리듬감) */
  size: number;
}> = [
  {
    id: "info",
    href: "/info",
    label: "Info",
    fillColor: {
      light: "#8ddfd3",
      dark: "#4fb6ad",
    },
    offset: -0.85,
    speed: 0.27,
    size: 1.05,
  },
  {
    id: "projects",
    href: "/projects",
    label: "Projects",
    fillColor: {
      light: "#cdb4f6",
      dark: "#9478d1",
    },
    offset: 4.3,
    speed: 0.27,
    size: 0.85,
  },
  {
    id: "notion",
    href: "/notion",
    label: "Notion",
    fillColor: {
      light: "#f6d77a",
      dark: "#c8944e",
    },
    offset: 0.95,
    speed: 0.27,
    size: 1.12,
  },
  {
    id: "github",
    href: "/github",
    label: "GitHub",
    fillColor: {
      light: "#aecbf7",
      dark: "#6f9edb",
    },
    offset: 2.65,
    speed: 0.27,
    size: 0.95,
  },
];

/**
 * 궤도선. 행성의 현재 각도(uPlanetAngle) 주변만 알파가 줄어들어
 * 궤도가 행성을 관통해 보이지 않게 한다.
 */
function createOrbit(radius: number, color: THREE.Color, opacity: number) {
  const points: THREE.Vector3[] = [];
  const angles: number[] = [];
  const segments = 192;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    angles.push(angle);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(new Float32Array(angles), 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
      uPlanetAngle: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aAngle;
      varying float vAngle;
      void main() {
        vAngle = aAngle;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uPlanetAngle;
      varying float vAngle;
      void main() {
        float diff = vAngle - uPlanetAngle;
        float dist = abs(atan(sin(diff), cos(diff)));
        float fade = smoothstep(0.22, 0.72, dist);
        gl_FragColor = vec4(uColor, uOpacity * fade);
      }
    `,
  });

  return new THREE.LineLoop(geometry, material);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function OrbitalHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setNavbarHidden } = usePage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRefs = useRef<Record<RouteId, HTMLButtonElement | null>>({
    info: null,
    projects: null,
    notion: null,
    github: null,
  });
  const activeTargetRef = useRef<RouteId | null>(null);
  const hoveredTargetRef = useRef<RouteId | null>(null);
  const activeStartedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTarget, setActiveTarget] = useState<RouteId | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<RouteId | null>(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  // prefers-reduced-motion이면 인트로 생략
  const [introDone, setIntroDone] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const introDoneRef = useRef(introDone);
  const introStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (introDoneRef.current) return;

    introStartRef.current = performance.now();
    setNavbarHidden(true);

    const removeListeners = () => {
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("wheel", reveal);
      window.removeEventListener("keydown", reveal);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("pointermove", revealAfterIntro);
    };
    const reveal = () => {
      setNavbarHidden(false);
      removeListeners();
    };
    const revealAfterIntro = () => {
      if (introDoneRef.current) reveal();
    };

    window.addEventListener("pointerdown", reveal);
    window.addEventListener("wheel", reveal, { passive: true });
    window.addEventListener("keydown", reveal);
    window.addEventListener("touchstart", reveal, { passive: true });
    window.addEventListener("pointermove", revealAfterIntro);

    return () => {
      removeListeners();
      setNavbarHidden(false);
    };
  }, [setNavbarHidden]);

  useEffect(() => {
    activeTargetRef.current = activeTarget;
    activeStartedAtRef.current = activeTarget ? performance.now() : 0;
  }, [activeTarget]);

  useEffect(() => {
    hoveredTargetRef.current = hoveredTarget;
  }, [hoveredTarget]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.1, 7);

    // 밝기 룩 팔레트: look 0 = 다크(우주), 1 = 라이트.
    // 인트로 동안은 라이트 모드여도 다크 룩으로 렌더링하고,
    // 인트로가 끝나면 씬은 그대로 둔 채 색/조명만 서서히 밝힌다.
    const palDark = {
      star: new THREE.Color("#e0f2fe"),
      orbitMuted: new THREE.Color("#93c5fd"),
      orbitStrong: new THREE.Color("#e0f2fe"),
      // 중앙 항성: 태양빛 — 거의 흰색에 가까운 웜 옐로
      core: new THREE.Color("#fffbee"),
      emissive: new THREE.Color("#5c4d20"),
      line: new THREE.Color("#dbeafe"),
      sphereLine: new THREE.Color("#fff4d6"),
      ambient: new THREE.Color("#fff4e0"),
      key: new THREE.Color("#ffedbd"),
      rim: new THREE.Color("#fdeeb9"),
      ambientIntensity: 0.92,
      keyIntensity: 8.8,
      rimIntensity: 4.4,
      emissiveIntensity: 0.24,
      sphereOpacity: 0.94,
      wireSphereOpacity: 0.32,
      // 대기(글로우 쉘): 반투명하게
      glowOpacity: 0.12,
      ringOpacities: [0.44, 0.36, 0.32, 0.3],
    };
    const palLight = {
      star: new THREE.Color("#0f172a"),
      orbitMuted: new THREE.Color("#94a3b8"),
      orbitStrong: new THREE.Color("#64748b"),
      // 중앙 항성: 밝은 배경에서도 노랑 기가 살짝만 도는 웜 화이트
      core: new THREE.Color("#fff0c4"),
      emissive: new THREE.Color("#fffaf0"),
      line: new THREE.Color("#8aa0b6"),
      sphereLine: new THREE.Color("#c7ab68"),
      ambient: new THREE.Color(0xffffff),
      key: new THREE.Color("#fbdf8f"),
      rim: new THREE.Color("#fde68a"),
      ambientIntensity: 1.08,
      keyIntensity: 9.2,
      rimIntensity: 4.8,
      emissiveIntensity: 0.36,
      sphereOpacity: 0.95,
      wireSphereOpacity: 0.24,
      glowOpacity: 0.1,
      ringOpacities: [0.4, 0.3, 0.26, 0.28],
    };

    const ambient = new THREE.AmbientLight(palDark.ambient, palDark.ambientIntensity);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(palDark.key, palDark.keyIntensity, 18);
    keyLight.position.set(3.5, 3, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(palDark.rim, palDark.rimIntensity, 15);
    rimLight.position.set(-4, -1.5, 3);
    scene.add(rimLight);

    const root = new THREE.Group();
    const orbitalGroup = new THREE.Group();
    const sphereGroup = new THREE.Group();
    scene.add(root);
    root.add(orbitalGroup);
    root.add(sphereGroup);

    const sphereGeometry = new THREE.SphereGeometry(1.18, 64, 64);
    const glowGeometry = new THREE.SphereGeometry(1.45, 48, 48);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: palDark.core.clone(),
      emissive: palDark.emissive.clone(),
      emissiveIntensity: palDark.emissiveIntensity,
      transparent: true,
      opacity: palDark.sphereOpacity,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereGroup.add(sphere);

    const wireSphereMaterial = new THREE.MeshBasicMaterial({
      color: palDark.sphereLine.clone(),
      opacity: palDark.wireSphereOpacity,
      transparent: true,
      wireframe: true,
    });
    const wireSphere = new THREE.Mesh(sphereGeometry, wireSphereMaterial);
    wireSphere.scale.setScalar(1.015);
    sphereGroup.add(wireSphere);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: palDark.core.clone(),
      opacity: palDark.glowOpacity,
      transparent: true,
      side: THREE.BackSide,
      // 대기는 depth 를 남기지 않아야 궤도선·행성이 대기 반경에 가려지지 않는다
      // (태양 몸체에는 여전히 정상적으로 가려짐)
      depthWrite: false,
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.renderOrder = -1;
    sphereGroup.add(glowSphere);

    const orbitConfigs = [
      { radius: 2.15, rotation: new THREE.Euler(1.15, 0.12, 0.18) },
      { radius: 2.7, rotation: new THREE.Euler(1.32, -0.18, -0.42) },
      { radius: 3.2, rotation: new THREE.Euler(1.42, -0.25, -0.2) },
      { radius: 3.7, rotation: new THREE.Euler(1.18, 0.42, 0.52) },
    ];
    const ringColorsDark = [
      palDark.orbitMuted,
      palDark.orbitStrong,
      palDark.orbitMuted,
      palDark.orbitStrong,
    ];
    const ringColorsLight = [
      palLight.orbitMuted,
      palLight.orbitStrong,
      palLight.orbitMuted,
      palLight.orbitStrong,
    ];

    const rings = orbitConfigs.map((orbit, index) => {
      const ring = createOrbit(
        orbit.radius,
        ringColorsDark[index],
        palDark.ringOpacities[index]
      );
      ring.rotation.copy(orbit.rotation);
      return ring;
    });
    const ringMaterials = rings.map((ring) => ring.material as THREE.ShaderMaterial);
    rings.forEach((ring) => orbitalGroup.add(ring));

    // 행성 4개가 되며 크기를 살짝 줄임
    const routeFillSphereGeometry = new THREE.SphereGeometry(0.2, 48, 32);
    const routeWireSphereGeometry = new THREE.SphereGeometry(0.2, 24, 16);
    const routeNodes = ROUTES.map((route, index) => {
      const orbit = orbitConfigs[index];
      const group = new THREE.Group();
      const fillMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(route.fillColor.dark),
        opacity: 0.46,
        transparent: true,
      });
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: palDark.line.clone(),
        opacity: 0.34,
        transparent: true,
        wireframe: true,
        depthWrite: false,
      });
      const planet = new THREE.Mesh(routeFillSphereGeometry, fillMaterial);
      const wirePlanet = new THREE.Mesh(routeWireSphereGeometry, wireMaterial);
      planet.renderOrder = 1;
      wirePlanet.renderOrder = 2;
      wirePlanet.scale.setScalar(1.018);
      group.add(planet);
      group.add(wirePlanet);
      // 씬 재생성 시(테마 전환 등) 행성이 중앙에서 튀어나오지 않도록 궤도 위에서 시작
      group.position
        .set(Math.cos(route.offset) * orbit.radius, Math.sin(route.offset) * orbit.radius, 0)
        .applyEuler(orbit.rotation);
      orbitalGroup.add(group);

      return {
        id: route.id,
        group,
        fillMaterial,
        wireMaterial,
        fillColorDark: new THREE.Color(route.fillColor.dark),
        fillColorLight: new THREE.Color(route.fillColor.light),
        planet,
        wirePlanet,
        radius: orbit.radius,
        rotation: orbit.rotation.clone(),
        offset: route.offset,
        speed: route.speed * 1.45,
        size: route.size,
        // 호버 시 감속을 위해 각도를 행성별로 누적 (elapsed 직접 계산 대신)
        angle: route.offset,
        speedFactor: 1,
      };
    });

    // 별: 사각 픽셀 대신 부드러운 원형 빛망울 스프라이트
    const starTexture = (() => {
      const size = 64;
      const canvas2d = document.createElement("canvas");
      canvas2d.width = size;
      canvas2d.height = size;
      const ctx = canvas2d.getContext("2d")!;
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.4, "rgba(255,255,255,0.55)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas2d);
    })();

    // 저채도 파스텔 틴트 (버텍스 컬러 — material.color 와 곱해져 톤 유지)
    const starTints = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#d3e9ff"), // ice blue
      new THREE.Color("#ffedd0"), // cream
      new THREE.Color("#ffdbe9"), // soft pink
    ];

    const makeStarLayer = (
      count: number,
      size: number,
      opacityDark: number,
      opacityLight: number,
      rotSpeed: number,
      twinkleSpeed: number
    ) => {
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const colors: number[] = [];
      for (let i = 0; i < count; i++) {
        const radius = randomBetween(3.4, 5.8);
        const theta = randomBetween(0, Math.PI * 2);
        const phi = Math.acos(randomBetween(-1, 1));
        positions.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) * 0.48,
          radius * Math.cos(phi)
        );
        const tint = starTints[Math.floor(Math.random() * starTints.length)];
        colors.push(tint.r, tint.g, tint.b);
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(positions), 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(colors), 3)
      );
      const material = new THREE.PointsMaterial({
        color: palDark.star.clone(),
        map: starTexture,
        size,
        vertexColors: true,
        opacity: opacityDark,
        transparent: true,
        depthWrite: false,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      return {
        points,
        geometry,
        material,
        opacityDark,
        opacityLight,
        rotSpeed,
        twinkleSpeed,
        twinklePhase: randomBetween(0, Math.PI * 2),
      };
    };

    // 잔별 / 중간 / 밝은 별 3겹 — 크기·회전 속도 차이로 깊이감(패럴랙스)
    const starLayers = [
      makeStarLayer(190, 0.025, 0.2, 0.12, 0.0006, 0.5),
      makeStarLayer(80, 0.05, 0.3, 0.16, 0.001, 0.8),
      makeStarLayer(26, 0.09, 0.4, 0.2, 0.0014, 1.2),
    ];

    // look: 0 = 다크 룩, 1 = 라이트 룩.
    // CSS transition(0.7s)과 동기화된 시간 기반 트윈으로 전환해 페이지와 씬이 함께 밝아진다.
    let look = themeRef.current === "dark" ? 0 : introDoneRef.current ? 1 : 0;
    const lookAnim = { from: look, target: look, start: 0 };
    const LOOK_DURATION_MS = 700;

    const applyLook = (mix: number) => {
      ambient.color.lerpColors(palDark.ambient, palLight.ambient, mix);
      ambient.intensity = THREE.MathUtils.lerp(
        palDark.ambientIntensity,
        palLight.ambientIntensity,
        mix
      );
      keyLight.color.lerpColors(palDark.key, palLight.key, mix);
      keyLight.intensity = THREE.MathUtils.lerp(
        palDark.keyIntensity,
        palLight.keyIntensity,
        mix
      );
      rimLight.color.lerpColors(palDark.rim, palLight.rim, mix);
      rimLight.intensity = THREE.MathUtils.lerp(
        palDark.rimIntensity,
        palLight.rimIntensity,
        mix
      );

      sphereMaterial.color.lerpColors(palDark.core, palLight.core, mix);
      sphereMaterial.emissive.lerpColors(palDark.emissive, palLight.emissive, mix);
      sphereMaterial.emissiveIntensity = THREE.MathUtils.lerp(
        palDark.emissiveIntensity,
        palLight.emissiveIntensity,
        mix
      );
      sphereMaterial.opacity = THREE.MathUtils.lerp(
        palDark.sphereOpacity,
        palLight.sphereOpacity,
        mix
      );
      wireSphereMaterial.color.lerpColors(palDark.sphereLine, palLight.sphereLine, mix);
      wireSphereMaterial.opacity = THREE.MathUtils.lerp(
        palDark.wireSphereOpacity,
        palLight.wireSphereOpacity,
        mix
      );
      glowMaterial.color.lerpColors(palDark.core, palLight.core, mix);
      glowMaterial.opacity = THREE.MathUtils.lerp(
        palDark.glowOpacity,
        palLight.glowOpacity,
        mix
      );

      ringMaterials.forEach((material, index) => {
        (material.uniforms.uColor.value as THREE.Color).lerpColors(
          ringColorsDark[index],
          ringColorsLight[index],
          mix
        );
        material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
          palDark.ringOpacities[index],
          palLight.ringOpacities[index],
          mix
        );
      });

      starLayers.forEach((layer) => {
        layer.material.color.lerpColors(palDark.star, palLight.star, mix);
      });

      routeNodes.forEach((routeNode) => {
        routeNode.fillMaterial.color.lerpColors(
          routeNode.fillColorDark,
          routeNode.fillColorLight,
          mix
        );
        routeNode.wireMaterial.color.lerpColors(palDark.line, palLight.line, mix);
      });
    };

    let restCameraZ = 7;
    let routeRadiusScale = 1;

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const compact = width < 768;
      restCameraZ = compact ? 9.4 : 7;
      routeRadiusScale = compact ? 0.72 : 0.86;
      root.scale.setScalar(compact ? 0.68 : 1);
      root.position.set(compact ? 0 : 0.92, compact ? -0.72 : 0, 0);
      rings.forEach((ring) => ring.scale.setScalar(routeRadiusScale));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    let frameId = 0;
    const clock = new THREE.Clock();
    const orbitPosition = new THREE.Vector3();
    const projectedPosition = new THREE.Vector3();
    const targetRoutePosition = new THREE.Vector3();
    const routeScale = new THREE.Vector3();
    // 클릭 줌: 행성을 중앙으로 옮기는 대신 카메라가 행성 위치로 날아간다
    const activePlanetWorld = new THREE.Vector3();
    const cameraGoal = new THREE.Vector3();
    const cameraLookTarget = new THREE.Vector3(0, 0, 0);
    const lookAtOrigin = new THREE.Vector3(0, 0, 0);
    const planetSpinAxis = new THREE.Vector3(0.08, 0.98, 0.18).normalize();

    let lastElapsed = 0;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      // 탭 복귀 등으로 프레임 간격이 튀어도 행성이 순간이동하지 않도록 delta 상한
      const delta = Math.min(elapsed - lastElapsed, 0.05);
      lastElapsed = elapsed;
      const active = activeTargetRef.current;
      const hovered = hoveredTargetRef.current;
      const activeProgress = active
        ? Math.min(1, Math.max(0, (performance.now() - activeStartedAtRef.current) / 760))
        : 0;

      let introEase = 1;
      if (!introDoneRef.current && introStartRef.current !== null) {
        const introProgress = Math.min(
          1,
          (performance.now() - introStartRef.current) / INTRO_DURATION_MS
        );
        introEase = 1 - Math.pow(1 - introProgress, 3);
        if (introProgress >= 1) {
          introDoneRef.current = true;
          setIntroDone(true);
        }
      }
      const introFade = introDoneRef.current
        ? 1
        : Math.max(0, (introEase - 0.65) / 0.35);

      // 인트로 종료·테마 토글 시 움직임은 그대로 두고 밝기만 서서히 전환
      const lookTarget =
        themeRef.current === "dark" ? 0 : introDoneRef.current ? 1 : 0;
      if (lookTarget !== lookAnim.target) {
        lookAnim.from = look;
        lookAnim.target = lookTarget;
        lookAnim.start = performance.now();
      }
      if (lookAnim.start > 0) {
        const lookProgress = Math.min(
          1,
          (performance.now() - lookAnim.start) / LOOK_DURATION_MS
        );
        const lookEase =
          lookProgress < 0.5
            ? 2 * lookProgress * lookProgress
            : 1 - Math.pow(-2 * lookProgress + 2, 2) / 2;
        look = lookAnim.from + (lookAnim.target - lookAnim.from) * lookEase;
      }
      applyLook(look);

      if (!reducedMotion) {
        sphere.rotation.y += active ? 0.024 : 0.006;
        wireSphere.rotation.y -= active ? 0.018 : 0.004;
      }

      // 별: 레이어별 회전(패럴랙스) + 느린 트윙클
      starLayers.forEach((layer) => {
        const baseOpacity = THREE.MathUtils.lerp(
          layer.opacityDark,
          layer.opacityLight,
          look
        );
        const twinkle = reducedMotion
          ? 1
          : 0.78 + 0.22 * Math.sin(elapsed * layer.twinkleSpeed + layer.twinklePhase);
        layer.material.opacity = baseOpacity * twinkle;
        if (!reducedMotion) layer.points.rotation.y += layer.rotSpeed;
      });

      if (!introDoneRef.current) {
        camera.position.z = THREE.MathUtils.lerp(
          restCameraZ + INTRO_CAMERA_DISTANCE,
          restCameraZ,
          introEase
        );
        root.rotation.z = (1 - introEase) * 0.32;
      } else if (!active) {
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.045);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, restCameraZ, 0.045);
        root.rotation.z = 0;
      }
      if (!active) {
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1, 0.04);
      }

      // 클릭 줌 중에는 항성이 시야를 가리지 않도록 서서히 감춘다
      const sunVisibility = 1 - activeProgress * 0.9;
      sphereMaterial.opacity *= sunVisibility;
      wireSphereMaterial.opacity *= sunVisibility;
      glowMaterial.opacity *= sunVisibility;

      routeNodes.forEach((routeNode, index) => {
        // 호버한 행성은 클릭하기 쉽도록, 클릭한 행성은 카메라가 따라잡도록 감속
        const speedTarget =
          active === routeNode.id
            ? 0.05
            : hovered === routeNode.id && !active
              ? 0.12
              : 1;
        routeNode.speedFactor = THREE.MathUtils.lerp(
          routeNode.speedFactor,
          speedTarget,
          0.1
        );
        routeNode.angle += routeNode.speed * delta * routeNode.speedFactor;
        const angle = routeNode.angle;
        const radius = routeNode.radius * routeRadiusScale;
        // 행성 현재 각도 주변의 궤도선을 흐리게
        ringMaterials[index].uniforms.uPlanetAngle.value = angle;
        // 클릭한 행성은 옮기지 않고 카메라가 다가가므로 크기 변화는 살짝만
        const targetScale =
          active === routeNode.id
            ? 1.25
            : hovered === routeNode.id
              ? 1.35
              : active
                ? 0.72
                : 1;

        orbitPosition.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
        orbitPosition.applyEuler(routeNode.rotation);
        targetRoutePosition.copy(orbitPosition);
        if (active === routeNode.id) {
          activePlanetWorld.copy(routeNode.group.position);
          orbitalGroup.localToWorld(activePlanetWorld);
        }

        routeNode.group.position.lerp(targetRoutePosition, active ? 0.16 : 0.1);
        routeScale.setScalar(targetScale * routeNode.size);
        routeNode.group.scale.lerp(routeScale, 0.12);
        const spinAmount = active === routeNode.id ? 0.036 : 0.012;
        routeNode.planet.rotateOnWorldAxis(planetSpinAxis, spinAmount * 0.6);
        routeNode.wirePlanet.rotateOnWorldAxis(planetSpinAxis, spinAmount);

        const isHighlighted = hovered === routeNode.id || active === routeNode.id;
        const targetFillOpacity = THREE.MathUtils.lerp(
          isHighlighted ? 0.6 : 0.46,
          isHighlighted ? 0.98 : 0.94,
          look
        );
        const targetWireOpacity = THREE.MathUtils.lerp(
          isHighlighted ? 0.48 : 0.34,
          isHighlighted ? 0.54 : 0.4,
          look
        );
        routeNode.fillMaterial.opacity = THREE.MathUtils.lerp(
          routeNode.fillMaterial.opacity,
          targetFillOpacity,
          0.18
        );
        routeNode.wireMaterial.opacity = THREE.MathUtils.lerp(
          routeNode.wireMaterial.opacity,
          targetWireOpacity,
          0.18
        );
      });

      if (introDoneRef.current && active) {
        cameraGoal.set(
          activePlanetWorld.x,
          activePlanetWorld.y,
          activePlanetWorld.z + 1.7
        );
        camera.position.lerp(cameraGoal, 0.055);
      }
      cameraLookTarget.lerp(
        active ? activePlanetWorld : lookAtOrigin,
        active ? 0.09 : 0.06
      );
      camera.lookAt(cameraLookTarget);
      camera.updateMatrixWorld();
      root.updateMatrixWorld(true);
      const canvasRect = canvas.getBoundingClientRect();

      routeNodes.forEach((routeNode) => {
        const button = buttonRefs.current[routeNode.id];
        if (!button) return;

        projectedPosition.copy(routeNode.group.position);
        orbitalGroup.localToWorld(projectedPosition);
        projectedPosition.project(camera);

        const projectedX =
          (projectedPosition.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
        const projectedY =
          (-projectedPosition.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top;
        const buttonHalfWidth = canvasRect.width < 768 ? 58 : 74;
        // 탑바(약 64px) 아래로 라벨이 파고들지 않도록 여유를 둔다
        const buttonTopLimit = canvasRect.width < 768 ? 108 : 122;
        const buttonBottomLimit = canvasRect.height - (canvasRect.width < 768 ? 58 : 64);
        const x = THREE.MathUtils.clamp(
          projectedX,
          canvasRect.left + buttonHalfWidth,
          canvasRect.left + canvasRect.width - buttonHalfWidth
        );
        const y = THREE.MathUtils.clamp(
          projectedY,
          canvasRect.top + buttonTopLimit,
          canvasRect.top + buttonBottomLimit
        );
        const depth = THREE.MathUtils.clamp((routeNode.group.position.z + 1.4) / 2.8, 0, 1);
        const isActive = active === routeNode.id;
        const isDimmed = active !== null && !isActive;
        const labelScale = isActive
          ? 1 + activeProgress * 0.22
          : hovered === routeNode.id
            ? 1.06
            : 0.9 + depth * 0.16;
        const opacity = isDimmed ? 0.1 : isActive ? 1 : 0.58 + depth * 0.42;

        button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${labelScale})`;
        button.style.opacity = String(opacity * introFade);
        button.style.zIndex = String(20 + Math.round(depth * 10) + (isActive ? 30 : 0));
        button.style.pointerEvents = isDimmed || introFade < 0.6 ? "none" : "auto";
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      sphereGeometry.dispose();
      glowGeometry.dispose();
      routeFillSphereGeometry.dispose();
      routeWireSphereGeometry.dispose();
      starLayers.forEach((layer) => {
        layer.geometry.dispose();
        layer.material.dispose();
      });
      starTexture.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        const material = ring.material;
        if (material instanceof THREE.Material) material.dispose();
      });
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
    // 씬은 mount 시 1회만 생성 — 테마는 themeRef로 매 프레임 반영(밝기 보간)
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEnter = (route: (typeof ROUTES)[number]) => {
    if (activeTarget) return;

    setActiveTarget(route.id);
    timerRef.current = setTimeout(() => {
      router.push(route.href);
    }, 980);
  };

  const activeRoute = ROUTES.find((route) => route.id === activeTarget);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background transition-colors duration-700">
      {/* 인트로 동안 라이트 모드에서도 우주(다크) 배경 유지 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0a0a0a]"
        initial={false}
        animate={{ opacity: introDone ? 0 : 1 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          data-orbital-canvas
          aria-hidden="true"
          className="h-full w-full"
        />
      </div>

      <nav aria-label="주요 페이지" className="absolute inset-0 z-20">
        {ROUTES.map((route) => (
          <button
            key={route.id}
            ref={(element) => {
              buttonRefs.current[route.id] = element;
            }}
            type="button"
            disabled={activeTarget !== null}
            onClick={() => handleEnter(route)}
            onPointerEnter={() => setHoveredTarget(route.id)}
            onPointerLeave={() => setHoveredTarget(null)}
            className={`absolute left-0 top-0 flex min-h-20 w-28 flex-col items-center justify-start text-center opacity-0 transition-colors duration-700 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 md:w-36 ${
              introDone ? "text-foreground" : "text-slate-100"
            }`}
            aria-label={`${route.label} 페이지로 이동`}
          >
            <span
              className="pointer-events-none h-14 w-14 rounded-full md:h-16 md:w-16"
              aria-hidden
            />
            <span className="mt-1 text-base font-semibold drop-shadow-sm md:text-lg">
              {route.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="pointer-events-none relative z-30 mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-12 pt-28 md:px-8 md:pt-32">
        <motion.div
          className="pointer-events-none max-w-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{
            opacity: activeTarget ? 0 : introDone ? 1 : 0,
            y: activeTarget ? -12 : introDone ? 0 : 18,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: activeTarget ? 0 : 0.35,
          }}
        >
          <p className="mb-3 text-sm font-medium uppercase text-muted transition-colors duration-700">
            Portfolio & Blog
          </p>
          <h1 className="text-4xl font-bold leading-tight text-foreground transition-colors duration-700 md:text-7xl">
            Junwoo Song
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted transition-colors duration-700 md:text-lg">
            Spring Boot 중심의 백엔드와 풀스택 경험을 쌓으며, AI를 활용한 사용자 경험에 관심을 둡니다.
          </p>
        </motion.div>

        <AnimatePresence>
          {activeRoute && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-6 md:top-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.42, ease: "easeOut" }}
              >
                <p className="text-sm uppercase tracking-wide text-muted">Entering</p>
                <p className="mt-2 text-4xl font-bold md:text-6xl">{activeRoute.label}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
