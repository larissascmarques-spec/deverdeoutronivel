import { IntegrationError } from '../errors'

export function missingBackend(): never {
  throw new IntegrationError(
    'O serviço ainda não está configurado. O back-end do Supabase será conectado em outra etapa.',
    'not_configured',
  )
}

export function notImplemented(action: string): never {
  throw new IntegrationError(
    `${action} ainda não está disponível no servidor.`,
    'not_implemented',
  )
}
