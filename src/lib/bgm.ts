import type { Scene } from '../types'

export interface BgmTrack { label: string; src: string }

function bgmPath(filename: string) {
  return '/bgm/' + filename.split('').map((c) => encodeURIComponent(c)).join('').replace(/%2F/g, '/')
}

export const BGM_TRACKS: BgmTrack[] = [
  { label: '夜のさんぽみち',            src: bgmPath('桜餅ルナ - 夜のさんぽみち.mp3') },
  { label: 'さみしいおばけと東京の月',  src: bgmPath('さみしいおばけと東京の月_しゃろう.mp3') },
  { label: 'しゅわしゅわハニーレモン', src: bgmPath('しゅわしゅわハニーレモン350ml_しゃろう.mp3') },
  { label: 'Anyone in 2025',            src: bgmPath('Anyone_in_2025(LOOP)_しゃろう.mp3') },
  { label: '宇宙飛行士が最後に見たもの', src: bgmPath('宇宙飛行士が最後に見たもの_しゃろう.mp3') },
]

export const DEFAULT_SCENE_BGM: Partial<Record<Scene, string>> = {
  room:      BGM_TRACKS[0].src,
  furniture: BGM_TRACKS[0].src,
  park:      BGM_TRACKS[1].src,
  dungeon:   BGM_TRACKS[2].src,
  lottery:   BGM_TRACKS[3].src,
  ranking:   BGM_TRACKS[4].src,
}

const STORAGE_KEY = 'bgm_scene_overrides'

function loadOverrides(): Partial<Record<Scene, string>> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

class BgmManager {
  private audio: HTMLAudioElement | null = null
  private currentSrc = ''
  private overrides: Partial<Record<Scene, string>> = loadOverrides()
  muted = false
  volume = 0.35

  getSrc(scene: Scene): string {
    return this.overrides[scene] ?? DEFAULT_SCENE_BGM[scene] ?? ''
  }

  setSceneBgm(scene: Scene, src: string) {
    this.overrides[scene] = src
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.overrides))
    if (this.currentSrc === this.getSrc(scene) || this.audio) {
      this.playUrl(src)
    }
  }

  play(scene: Scene) {
    const src = this.getSrc(scene)
    if (!src || src === this.currentSrc) return
    this.playUrl(src)
  }

  private pendingSrc = ''

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
      // 自動再生ブロック時: 次回ユーザー操作で再生
      const resume = () => {
        if (this.pendingSrc === src && !this.muted) audio.play().catch(() => {})
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
