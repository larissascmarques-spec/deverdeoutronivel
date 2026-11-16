import type { SessionService } from '../interfaces'

export const sessionDemo: SessionService = {
  async getSession() {
    return {
      authenticated: false,
      userId: null,
    }
  },
}
