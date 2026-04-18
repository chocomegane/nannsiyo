import type { Scene } from '../types'

const BGM_MAP: Partial<Record<Scene, string>> = {
  room:     '/bgm/room.mp3',
  park:     '/bgm/park.mp3',
  dungeon:  '/bgm/dungeon.mp3',
  lottery:  '/bgm/lottery.mp3',
  ranking:  '/bgm/ranking.mp3',
  furniture:'/bgm/room.mp3',
}

class BgmManager {
  private audio: HTMLAudioElement | null = null
  private currentSrc = ''
  muted = false

  play(scene: Scene) {
    const src = BGM_MAP[scene]
    if (!src || src === this.currentSrc) return
    this.stop()
    this.currentSrc = src
    this.audio = new Audio(src)
    this.audio.loop = true
    this.audio.volume = 0.35
    this.audio.muted = this.muted
    this.audio.play().catch(() => {})
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

  setMuted(val: boolean) {
    this.muted = val
    if (this.audio) this.audio.muted = val
  }
}

export const bgm = new BgmManager()
