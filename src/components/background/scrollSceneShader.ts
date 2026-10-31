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
  uniform vec4 uBlobA;
  uniform vec4 uBlobB;
  uniform vec4 uBlobC;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamForward;
  uniform float uTanFov;

  varying vec2 vUv;

  float sdSphere(vec3 p, vec3 c, float r) {
    return length(p - c) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float scene(vec3 p, float grow) {
    float d1 = sdSphere(p, uBlobA.xyz, uBlobA.w * grow);
    float d2 = sdSphere(p, uBlobB.xyz, uBlobB.w * grow);
    float d3 = sdSphere(p, uBlobC.xyz, uBlobC.w * grow);
    float k = 0.22;
    return smin(smin(d1, d2, k), d3, k);
  }

  vec3 calcNormal(vec3 p, float grow) {
    vec2 e = vec2(0.02, 0.0);
    return normalize(vec3(
      scene(p + e.xyy, grow) - scene(p - e.xyy, grow),
      scene(p + e.yxy, grow) - scene(p - e.yxy, grow),
      scene(p + e.yyx, grow) - scene(p - e.yyx, grow)
    ));
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

    vec2 ndc = uv * 2.0 - 1.0;
    ndc.x *= aspect;

    vec3 rd = normalize(uCamForward + ndc.x * uTanFov * uCamRight + ndc.y * uTanFov * uCamUp);
    vec3 ro = uCamPos;

    float t = 0.0;
    bool hit = false;
    vec3 p = ro;

    for (int i = 0; i < 48; i++) {
      p = ro + rd * t;
      float d = scene(p, uIntro);
      if (d < 0.0025) {
        hit = true;
        break;
      }
      t += d;
      if (t > 18.0) break;
    }

    vec3 bg = bgGradient(uv);
    vec3 color = bg;

    if (hit) {
      vec3 normal = calcNormal(p, uIntro);
      vec3 viewDir = normalize(ro - p);

      float refractStrength = 0.07;
      vec2 refractedUv = uv - normal.xy * refractStrength;
      vec3 refractedBg = bgGradient(refractedUv);

      vec3 glass = mix(refractedBg, vec3(1.0), 0.1);

      vec3 lightDir = normalize(vec3(-0.4, 0.65, 0.5));
      float facing = dot(normal, lightDir);
      float lambert = 0.5 + 0.5 * facing;
      glass *= mix(0.8, 1.06, lambert);

      float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);
      float sparkle = 0.5 + 0.5 * sin(uTime * 0.6);
      glass += fresnel * (0.28 + 0.1 * sparkle);

      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(clamp(dot(reflectDir, viewDir), 0.0, 1.0), 28.0);
      glass += spec * 0.35;

      float fog = smoothstep(4.0, 18.0, t);
      glass = mix(glass, bg, fog * 0.4);

      color = glass;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
