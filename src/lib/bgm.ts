import type { Scene } from '../types'
import { fetchSettings, saveSettings } from './api'

export interface BgmTrack { label: string; src: string }

export let BGM_TRACKS: BgmTrack[] = []
export let RADIO_TRACKS: BgmTrack[] = []

async function loadTracks(path: string): Promise<BgmTrack[]> {
  try {
    const res = await fetch(path)
    if (!res.ok) return []
    const files: { name: string; type: string }[] = await res.json()
    return files
      .filter((f) => f.type === 'file' && f.name.match(/\.(mp3|ogg|wav|m4a)$/i))
      .map((f) => ({ label: f.name, src: path + encodeURIComponent(f.name) }))
  } catch {
    return []
  }
}

export async function loadBgmTracks(): Promise<BgmTrack[]> {
  BGM_TRACKS = await loadTracks('/bgm/')
  return BGM_TRACKS
}

export async function loadRadioTracks(): Promise<BgmTrack[]> {
  RADIO_TRACKS = await loadTracks('/radio/')
  return RADIO_TRACKS
}

const DEFAULT_INDEX: Partial<Record<Scene, number>> = {
  room: 0, furniture: 0, park: 1, dungeon: 2, ranking: 3,
}

class BgmManager {
  private audio: HTMLAudioElement | null = null
  private currentSrc = ''
  private pendingSrc = ''
  private overrides: Partial<Record<Scene, string>> = {}
  private saveTimer: ReturnType<typeof setTimeout> | null = null
  private playerId: string | null = null
  muted = false
  volume = 0.03
  radioStation = 0

  // ログイン後にDBから設定を読み込む
  async loadFromDb(playerId: string) {
    this.playerId = playerId
    const s = await fetchSettings(playerId)
    this.volume = s.bgm_volume
    this.muted = s.bgm_muted
    this.overrides = s.bgm_scene as Partial<Record<Scene, string>>
    this.radioStation = s.radio_station ?? 0
    if (this.audio) {
      this.audio.volume = this.volume
      this.audio.muted = this.muted
    }
  }

  private scheduleSave() {
    if (!this.playerId) return
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => {
      if (!this.playerId) return
      saveSettings(this.playerId, {
        bgm_volume: this.volume,
        bgm_muted: this.muted,
        bgm_scene: this.overrides as Record<string, string>,
        radio_station: this.radioStation,
      })
    }, 800)
  }

  getSrc(scene: Scene): string {
    if (this.overrides[scene]) return this.overrides[scene]!
    const idx = DEFAULT_INDEX[scene] ?? 0
    return BGM_TRACKS[idx]?.src ?? BGM_TRACKS[0]?.src ?? ''
  }

  setSceneBgm(scene: Scene, src: string) {
    this.overrides[scene] = src
    this.scheduleSave()
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
    this.scheduleSave()
    return this.muted
  }

  setVolume(val: number) {
    this.volume = val
    if (this.audio) this.audio.volume = val
    this.scheduleSave()
  }

  setRadioStation(idx: number) {
    this.radioStation = idx
    this.scheduleSave()
  }
}

export const bgm = new BgmManager()
