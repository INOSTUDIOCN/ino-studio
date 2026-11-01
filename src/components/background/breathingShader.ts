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
  uniform float uIntro;
  uniform float uDiluted;
  uniform vec3 uBlobA;
  uniform vec3 uBlobB;
  uniform vec3 uBlobC;

  varying vec2 vUv;

  float sdCircle(vec2 p, vec2 center, float r) {
    return length(p - center) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float scene(vec2 p, float aspect, float grow) {
    vec2 a = uBlobA.xy; a.x *= aspect;
    vec2 b = uBlobB.xy; b.x *= aspect;
    vec2 c = uBlobC.xy; c.x *= aspect;

    float d1 = sdCircle(p, a, uBlobA.z * grow);
    float d2 = sdCircle(p, b, uBlobB.z * grow);
    float d3 = sdCircle(p, c, uBlobC.z * grow);

    float k = 0.05;
    return smin(smin(d1, d2, k), d3, k);
  }

  vec3 bgGradient(vec2 uv) {
    vec3 bottom = vec3(0.945, 0.949, 0.957);
    vec3 top = vec3(1.0, 1.0, 1.0);
    vec3 base = mix(bottom, top, uv.y);

    vec2 cell = fract(uv * 46.0) - 0.5;
    float dot = smoothstep(0.07, 0.0, length(cell));
    base -= dot * 0.035;

    return base;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv;
    p.x *= aspect;

    float d = scene(p, aspect, uIntro);

    float e = 0.0025;
    float dx = scene(p + vec2(e, 0.0), aspect, uIntro) - d;
    float dy = scene(p + vec2(0.0, e), aspect, uIntro) - d;
    vec2 normal = normalize(vec2(dx, dy) + 1e-5);

    vec3 bg = bgGradient(uv);

    float inside = smoothstep(0.004, -0.004, d);

    float refractStrength = 0.06;
    float refractFalloff = smoothstep(0.0, -0.06, d);
    vec2 refractedUv = uv - normal * refractStrength * refractFalloff;
    vec3 refractedBg = bgGradient(refractedUv);

    vec3 glass = mix(refractedBg, vec3(1.0), 0.22);

    float rim = smoothstep(0.018, 0.0, abs(d));
    vec2 lightDir = normalize(vec2(-0.6, 0.8));
    float facing = clamp(dot(normal, lightDir), 0.0, 1.0);
    float sparkle = 0.5 + 0.5 * sin(uTime * 0.6);
    glass += rim * facing * (0.55 + 0.18 * sparkle);

    float shade = clamp(-dot(normal, lightDir), 0.0, 1.0);
    glass -= rim * shade * 0.12;

    vec2 blobACenter = uBlobA.xy * vec2(aspect, 1.0);
    vec2 specCenter = blobACenter + lightDir * uBlobA.z * 0.4;
    float spec = smoothstep(uBlobA.z * 0.85, uBlobA.z * -0.1, length(p - specCenter));
    glass += spec * 0.22 * inside;

    float shadowD = scene(p - vec2(0.0, 0.018), aspect, uIntro);
    float shadow = smoothstep(0.0, -0.03, shadowD) * (1.0 - inside) * 0.08;
    bg = mix(bg, bg * 0.9, shadow);

    vec3 color = mix(bg, glass, inside);

    float alphaOpaque = max(inside, shadow);
    float alphaDiluted = clamp(inside * 0.16 + rim * facing * 0.4 + spec * 0.3 * inside + shadow, 0.0, 1.0);
    float alpha = mix(alphaOpaque, alphaDiluted, uDiluted);

    gl_FragColor = vec4(color, alpha);
  }
`;
