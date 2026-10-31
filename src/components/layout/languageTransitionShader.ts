export const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const fragment = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uOrigin;

  varying vec2 vUv;

  float sdCircle(vec2 p, vec2 center, float r) {
    return length(p - center) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  vec3 bgGradient(vec2 uv) {
    vec3 bottom = vec3(0.945, 0.949, 0.957);
    vec3 top = vec3(1.0, 1.0, 1.0);
    vec3 base = mix(bottom, top, uv.y);

    vec2 cell = fract(uv * 46.0) - 0.5;
    float dot = smoothstep(0.07, 0.0, length(cell));
    base -= dot * 0.03;

    return base;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv;
    p.x *= aspect;

    vec2 origin = uOrigin;
    origin.x *= aspect;

    float grow = pow(clamp(uProgress, 0.0, 1.0), 0.72);
    float maxReach = 1.9;
    float r0 = grow * maxReach;

    vec2 o1 = origin + vec2(cos(uTime * 0.25) * 0.14, sin(uTime * 0.22) * 0.12) * grow;
    vec2 o2 = origin + vec2(cos(uTime * 0.3 + 2.1) * 0.2, sin(uTime * 0.27 + 2.1) * 0.16) * grow;

    float d1 = sdCircle(p, origin, r0);
    float d2 = sdCircle(p, o1, r0 * 0.6);
    float d3 = sdCircle(p, o2, r0 * 0.42);

    float k = 0.22;
    float d = smin(smin(d1, d2, k), d3, k);

    float e = 0.0025;
    float dx = smin(smin(sdCircle(p + vec2(e, 0.0), origin, r0), sdCircle(p + vec2(e, 0.0), o1, r0 * 0.6), k), sdCircle(p + vec2(e, 0.0), o2, r0 * 0.42), k) - d;
    float dy = smin(smin(sdCircle(p + vec2(0.0, e), origin, r0), sdCircle(p + vec2(0.0, e), o1, r0 * 0.6), k), sdCircle(p + vec2(0.0, e), o2, r0 * 0.42), k) - d;
    vec2 normal = normalize(vec2(dx, dy) + 1e-5);

    vec3 bg = bgGradient(uv);

    float inside = smoothstep(0.01, -0.01, d);

    float refractStrength = 0.05;
    float refractFalloff = smoothstep(0.0, -0.12, d);
    vec2 refractedUv = uv - normal * refractStrength * refractFalloff;
    vec3 refractedBg = bgGradient(refractedUv);

    vec3 glass = mix(refractedBg, vec3(1.0), 0.14);

    float rim = smoothstep(0.03, 0.0, abs(d));
    vec2 lightDir = normalize(vec2(-0.5, 0.85));
    float facing = clamp(dot(normal, lightDir), 0.0, 1.0);
    glass += rim * facing * 0.4;

    float sweepPos = mix(-0.4, 1.4, clamp(uProgress * 1.15, 0.0, 1.0));
    float sweep = smoothstep(0.22, 0.0, abs((uv.x + uv.y * 0.4) - sweepPos));
    glass += sweep * 0.1;

    vec3 color = mix(bg, glass, inside);

    gl_FragColor = vec4(color, 1.0);
  }
`;
