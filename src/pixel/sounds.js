/** Lamp pull-chain sound. Always plays: it is a direct action on the lamp. */
export function lampSound(actx, on) {
  try {
    if (actx.state === 'suspended') actx.resume();
    const now = actx.currentTime, out = actx.createGain();
    out.gain.value = 0.9;
    out.connect(actx.destination);
    const len = Math.floor(actx.sampleRate * 0.025), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    [[0, 3200, 0.5], [0.075, 2400, 0.35]].forEach(([at, fq, vol]) => {
      const src = actx.createBufferSource(), bp = actx.createBiquadFilter(), g = actx.createGain();
      src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = 2.5; g.gain.value = vol;
      src.connect(bp).connect(g).connect(out);
      src.start(now + at);
    });
    const o = actx.createOscillator(), og = actx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(on ? 660 : 500, now + 0.075);
    o.frequency.exponentialRampToValueAtTime(on ? 990 : 330, now + 0.13);
    og.gain.setValueAtTime(0, now + 0.075); og.gain.linearRampToValueAtTime(0.035, now + 0.08); og.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    o.connect(og).connect(out); o.start(now + 0.075); o.stop(now + 0.18);
    const h = actx.createOscillator(), hg = actx.createGain();
    h.type = 'triangle';
    h.frequency.setValueAtTime(on ? 180 : 300, now + 0.1); h.frequency.exponentialRampToValueAtTime(on ? 300 : 150, now + 0.45);
    hg.gain.setValueAtTime(0, now + 0.1); hg.gain.linearRampToValueAtTime(0.05, now + 0.18); hg.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    h.connect(hg).connect(out); h.start(now + 0.1); h.stop(now + 0.6);
  } catch {}
}
