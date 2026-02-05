// Game Components Index
// Export all game components for easy imports

export { default as TrackSelector } from './TrackSelector'
export { default as ScamBusterGame } from './ScamBusterGame'
export { default as LifeDecisionsGame } from './LifeDecisionsGame'
export { default as InsuranceModule } from './InsuranceModule'
export { default as GameProgressWidget } from './GameProgressWidget'

// Re-export game engines for use in components
export * from '@/lib/gameEngine'
export * from '@/lib/scamBusterGame'
export * from '@/lib/lifeDecisionsGame'
export * from '@/lib/insuranceModule'
