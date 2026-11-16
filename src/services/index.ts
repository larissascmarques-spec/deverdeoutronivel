import { getAppMode, isSupabaseConfigured } from '../config/env'
import { catalogDemo } from './demo/catalogDemo'
import { generationDemo } from './demo/generationDemo'
import { libraryDemo } from './demo/libraryDemo'
import { sessionDemo } from './demo/sessionDemo'
import type { AppServices } from './interfaces'
import { catalogAdapter } from './supabase/catalogAdapter'
import { generationAdapter } from './supabase/generationAdapter'
import { libraryAdapter } from './supabase/libraryAdapter'
import { sessionAdapter } from './supabase/sessionAdapter'

const demoServices: AppServices = {
  catalog: catalogDemo,
  generation: generationDemo,
  library: libraryDemo,
  session: sessionDemo,
}

const productionServices: AppServices = {
  catalog: catalogAdapter,
  generation: generationAdapter,
  library: libraryAdapter,
  session: sessionAdapter,
}

export function getServices(): AppServices {
  if (getAppMode() === 'demo') {
    return demoServices
  }
  return productionServices
}

export function getProductionReadiness(): {
  mode: ReturnType<typeof getAppMode>
  supabaseConfigured: boolean
} {
  return {
    mode: getAppMode(),
    supabaseConfigured: isSupabaseConfigured(),
  }
}
