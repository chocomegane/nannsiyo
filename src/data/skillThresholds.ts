// レベル到達時に解放されるスキルID一覧
// 序盤は密に、後半は疎にしてモチベーションを維持
export const SKILL_THRESHOLDS: Record<number, string[]> = {
  1:  ['wave_hello', 'bow_deep', 'thumbs_up', 'sleep_zzz', 'nod_agree', 'banana_slip', 'fart_cloud', 'poop_bomb', 'yawn_wave', 'snore_cannon'],
  2:  ['emoji_pop', 'heart_hands', 'clap_clap', 'cry_waterfall', 'shrug_idk', 'blush_shy', 'spinning_joy', 'sneeze_storm', 'pillow_fight', 'bubble_wrap', 'watergun_duel', 'bounce_butt', 'sock_puppet'],
  3:  ['fire_breath', 'angry_stomp', 'laugh_roll', 'point_finger', 'thinking_pose', 'rubber_duck', 'tofu_slam', 'hiccup_blast', 'penguin_slide', 'ramen_hair', 'mayo_cannon'],
  4:  ['candy_drop', 'bubble_pop', 'facepalm', 'celebrate', 'noodle_whip', 'confetti_trap', 'ninja_fail', 'donut_shield', 'pickle_punch'],
  5:  ['party_cracker', 'flex_muscles', 'salute', 'cat_laser', 'taco_rain', 'ice_cream_melt', 'tanuki_bake', 'wind_slash', 'power_strike', 'cyclone_kick'],
  6:  ['random_warp', 'table_flip', 'leaf_storm', 'music_note', 'spaghetti_web', 'disco_bomb', 'balloon_knight', 'lucky_clover'],
  7:  ['toilet_flush', 'shadow_step', 'bone_arrow'],
  8:  ['heal_aura', 'pet_glow', 'flower_burst', 'ice_lance', 'bone_shield', 'iron_fist'],
  9:  ['speed_boost', 'poison_sting', 'venom_spray'],
  10: ['prism_shift', 'star_shower', 'snow_flurry', 'thunder_clap', 'razor_wind'],
  11: ['thorn_armor', 'acid_rain'],
  12: ['coin_fountain', 'earth_quake'],
  13: ['magic_circle', 'flame_pillar'],
  14: ['crystal_trap', 'moon_beam'],
  15: ['rainbow_beam', 'gem_rain', 'chain_lightning'],
  16: ['iron_curtain', 'gravity_well', 'mana_burst'],
  17: ['soul_drain'],
  18: ['moonlight_waltz', 'dark_nova'],
  19: ['holy_burst'],
  20: ['dragon_roar', 'meteor_strike'],
  21: ['spectral_blade'],
  22: ['time_warp', 'blizzard'],
  25: ['aurora_wave', 'void_strike'],
  28: ['phantom_copy'],
  30: ['time_stop'],
  35: ['earthquake_II'],
  50: ['grand_finale'],
}

export function getSkillsForLevel(level: number): string[] {
  return SKILL_THRESHOLDS[level] ?? []
}
