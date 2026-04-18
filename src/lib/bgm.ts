import type { Scene } from '../types'

export interface BgmTrack { label: string; src: string }

export let BGM_TRACKS: BgmTrack[] = []

export async function loadBgmTracks(): Promise<BgmTrack[]> {
  try {
    const res = await fetch('/bgm/')
    if (!res.ok) return []
    const files: { name: string; type: string }[] = await res.json()
    BGM_TRACKS = files
      .filter((f) => f.type === 'file' && f.name.match(/\.(mp3|ogg|wav|m4a)$/i))
      .map((f) => ({ label: f.name, src: '/bgm/' + encodeURIComponent(f.name) }))
    return BGM_TRACKS
  } catch {
    return []
  }
}

const DEFAULT_INDEX: Partial<Record<Scene, number>> = {
  room: 0, furniture: 0, park: 1, dungeon: 2, lottery: 3, ranking: 4,
}

const STORAGE_KEY = 'bgm_scene_src'

function loadOverrides(): Partial<Record<Scene, string>> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

class BgmManager {
  private audio: HTMLAudioElement | null = null
  private currentSrc = ''
  private pendingSrc = ''
  private overrides: Partial<Record<Scene, string>> = loadOverrides()
  muted = false
  volume = 0.35

  getSrc(scene: Scene): string {
    if (this.overrides[scene]) return this.overrides[scene]!
    const idx = DEFAULT_INDEX[scene] ?? 0
    return BGM_TRACKS[idx]?.src ?? BGM_TRACKS[0]?.src ?? ''
  }

  setSceneBgm(scene: Scene, src: string) {
    this.overrides[scene] = src
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.overrides))
  }

  play(scene: Scene) {
    const src = this.getSrc(scene)
    if (!src || src === this.currentSrc) return
    this.playUrl(src)
  }

  private playUrl(src: string) {
    this.stop()
    this.currentSrc = src
    this.pendingSrc = src
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = this.volume
    audio.muted = this.muted
    audio.addEventListener('ended', () => {
      if (this.audio) { this.audio.currentTime = 0; this.audio.play().catch(() => {}) }
    })
    this.audio = audio
    audio.play().catch(() => {
      const resume = () => {
        if (this.pendingSrc === src) audio.play().catch(() => {})
        document.removeEventListener('click', resume)
        document.removeEventListener('keydown', resume)
      }
      document.addEventListener('click', resume, { once: true })
      document.addEventListener('keydown', resume, { once: true })
    })
  }

  stop() {
    if (this.audio) { this.audio.pause(); this.audio = null }
    this.currentSrc = ''
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.audio) this.audio.muted = this.muted
    return this.muted
  }

  setVolume(val: number) {
    this.volume = val
    if (this.audio) this.audio.volume = val
  }
}

export const bgm = new BgmManager()
