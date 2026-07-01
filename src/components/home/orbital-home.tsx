"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/theme-provider";

type RouteId = "info" | "notion" | "github";

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
  },
];

function createOrbit(radius: number, color: string, opacity: number) {
  const points: THREE.Vector3[] = [];
  const segments = 192;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    opacity,
    transparent: true,
  });

  return new THREE.LineLoop(geometry, material);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function OrbitalHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRefs = useRef<Record<RouteId, HTMLButtonElement | null>>({
    info: null,
    notion: null,
    github: null,
  });
  const activeTargetRef = useRef<RouteId | null>(null);
  const hoveredTargetRef = useRef<RouteId | null>(null);
  const activeStartedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTarget, setActiveTarget] = useState<RouteId | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<RouteId | null>(null);

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

    const isDark = theme === "dark";
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

    const foreground = isDark ? "#e0f2fe" : "#0f172a";
    const orbitMuted = isDark ? "#93c5fd" : "#94a3b8";
    const orbitStrong = isDark ? "#e0f2fe" : "#64748b";
    const coreColor = isDark ? "#99f6e4" : "#7dd3fc";
    const sphereLineColor = isDark ? "#dbeafe" : "#8aa0b6";
    const planetLineColor = sphereLineColor;

    const ambient = new THREE.AmbientLight(
      isDark ? 0xdbeafe : 0xffffff,
      isDark ? 0.92 : 1.08
    );
    scene.add(ambient);

    const keyLight = new THREE.PointLight(
      isDark ? 0x67e8f9 : 0x38bdf8,
      isDark ? 8.8 : 9.2,
      18
    );
    keyLight.position.set(3.5, 3, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(
      isDark ? 0xfde68a : 0x99f6e4,
      isDark ? 4.4 : 4.8,
      15
    );
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
      color: new THREE.Color(coreColor),
      emissive: new THREE.Color(isDark ? "#155e75" : "#ecfeff"),
      emissiveIntensity: isDark ? 0.24 : 0.36,
      transparent: true,
      opacity: isDark ? 0.94 : 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereGroup.add(sphere);

    const wireSphere = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshBasicMaterial({
        color: sphereLineColor,
        opacity: isDark ? 0.32 : 0.24,
        transparent: true,
        wireframe: true,
      })
    );
    wireSphere.scale.setScalar(1.015);
    sphereGroup.add(wireSphere);

    const glowSphere = new THREE.Mesh(
      glowGeometry,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(coreColor),
        opacity: isDark ? 0.2 : 0.14,
        transparent: true,
        side: THREE.BackSide,
      })
    );
    sphereGroup.add(glowSphere);

    const orbitConfigs = [
      {
        radius: 2.15,
        rotation: new THREE.Euler(1.15, 0.12, 0.18),
        color: orbitMuted,
        opacity: isDark ? 0.44 : 0.4,
      },
      {
        radius: 2.85,
        rotation: new THREE.Euler(1.42, -0.25, -0.2),
        color: orbitStrong,
        opacity: isDark ? 0.34 : 0.24,
      },
      {
        radius: 3.35,
        rotation: new THREE.Euler(1.18, 0.42, 0.52),
        color: orbitMuted,
        opacity: isDark ? 0.3 : 0.28,
      },
    ];

    const rings = orbitConfigs.map((orbit) => {
      const ring = createOrbit(orbit.radius, orbit.color, orbit.opacity);
      ring.rotation.copy(orbit.rotation);
      return ring;
    });
    rings.forEach((ring) => orbitalGroup.add(ring));

    const routeFillSphereGeometry = new THREE.SphereGeometry(0.26, 48, 32);
    const routeWireSphereGeometry = new THREE.SphereGeometry(0.26, 24, 16);
    const routeNodes = ROUTES.map((route, index) => {
      const orbit = orbitConfigs[index];
      const group = new THREE.Group();
      const fillMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(isDark ? route.fillColor.dark : route.fillColor.light),
        opacity: isDark ? 0.46 : 0.94,
        transparent: true,
      });
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(planetLineColor),
        opacity: isDark ? 0.34 : 0.4,
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
      orbitalGroup.add(group);

      return {
        id: route.id,
        group,
        fillMaterial,
        wireMaterial,
        planet,
        wirePlanet,
        radius: orbit.radius,
        rotation: orbit.rotation.clone(),
        offset: route.offset,
        speed: route.speed * 1.45,
      };
    });

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions: number[] = [];
    for (let i = 0; i < 260; i++) {
      const radius = randomBetween(3.4, 5.8);
      const theta = randomBetween(0, Math.PI * 2);
      const phi = Math.acos(randomBetween(-1, 1));
      particlePositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.48,
        radius * Math.cos(phi)
      );
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(particlePositions), 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(foreground),
      size: 0.018,
      opacity: isDark ? 0.24 : 0.14,
      transparent: true,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let restCameraZ = 7;
    let activeCameraZ = 3.2;
    let routeRadiusScale = 1;

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const compact = width < 768;
      restCameraZ = compact ? 9.4 : 7;
      activeCameraZ = compact ? 5.2 : 3.2;
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
    const baseScale = new THREE.Vector3(1, 1, 1);
    const zoomScale = new THREE.Vector3(4.2, 4.2, 4.2);
    const orbitPosition = new THREE.Vector3();
    const projectedPosition = new THREE.Vector3();
    const targetRoutePosition = new THREE.Vector3();
    const routeScale = new THREE.Vector3();
    const activeCenter = new THREE.Vector3(0, 0, 0.54);
    const planetSpinAxis = new THREE.Vector3(0.08, 0.98, 0.18).normalize();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const active = activeTargetRef.current;
      const hovered = hoveredTargetRef.current;
      const activeProgress = active
        ? Math.min(1, Math.max(0, (performance.now() - activeStartedAtRef.current) / 760))
        : 0;

      if (!reducedMotion) {
        sphere.rotation.y += active ? 0.024 : 0.006;
        wireSphere.rotation.y -= active ? 0.018 : 0.004;
        particles.rotation.y += 0.0008;
      }

      sphereGroup.scale.lerp(active ? zoomScale : baseScale, active ? 0.065 : 0.045);
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        active ? activeCameraZ : restCameraZ,
        0.045
      );
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, active ? 0 : 0.1, 0.04);

      routeNodes.forEach((routeNode) => {
        const angle = elapsed * routeNode.speed + routeNode.offset;
        const radius = routeNode.radius * routeRadiusScale;
        const targetScale =
          active === routeNode.id
            ? 1.15 + activeProgress * 3.6
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
          targetRoutePosition.lerp(activeCenter, activeProgress);
        }

        routeNode.group.position.lerp(targetRoutePosition, active ? 0.16 : 0.1);
        routeScale.setScalar(targetScale);
        routeNode.group.scale.lerp(routeScale, 0.12);
        const spinAmount = active === routeNode.id ? 0.036 : 0.012;
        routeNode.planet.rotateOnWorldAxis(planetSpinAxis, spinAmount * 0.6);
        routeNode.wirePlanet.rotateOnWorldAxis(planetSpinAxis, spinAmount);

        const isHighlighted = hovered === routeNode.id || active === routeNode.id;
        const targetFillOpacity = isDark
          ? isHighlighted ? 0.6 : 0.46
          : isHighlighted ? 0.98 : 0.94;
        const targetWireOpacity = isDark
          ? isHighlighted ? 0.48 : 0.34
          : isHighlighted ? 0.54 : 0.4;
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

      camera.lookAt(0, 0, 0);
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
        const buttonTopLimit = canvasRect.width < 768 ? 92 : 84;
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
        button.style.opacity = String(opacity);
        button.style.zIndex = String(20 + Math.round(depth * 10) + (isActive ? 30 : 0));
        button.style.pointerEvents = isDimmed ? "none" : "auto";
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
      particleGeometry.dispose();
      particleMaterial.dispose();
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
  }, [theme]);

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
    <section className="relative min-h-screen overflow-hidden bg-background">
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
            className="absolute left-0 top-0 flex min-h-20 w-28 flex-col items-center justify-start text-center text-foreground opacity-0 transition-colors will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 md:w-36"
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
            opacity: activeTarget ? 0 : 1,
            y: activeTarget ? -12 : 0,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-medium uppercase text-muted">Portfolio & Blog</p>
          <h1 className="text-4xl font-bold leading-tight md:text-7xl">
            Junwoo Song
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted md:text-lg">
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
