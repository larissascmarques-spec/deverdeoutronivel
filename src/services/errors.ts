export type IntegrationErrorCode =
  | 'not_configured'
  | 'not_implemented'
  | 'request_failed'

export class IntegrationError extends Error {
  readonly code: IntegrationErrorCode

  constructor(message: string, code: IntegrationErrorCode) {
    super(message)
    this.name = 'IntegrationError'
    this.code = code
  }
}

export function isIntegrationError(error: unknown): error is IntegrationError {
  return error instanceof IntegrationError
}
