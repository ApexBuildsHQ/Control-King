export interface CommandPayload {
  code: string;
  protocol: string;
  frequency: number;
  ipEndpoint?: string | null;
}

export class RemoteDispatcher {
  static async sendSignal(payload: CommandPayload): Promise<{ success: boolean; mode: string }> {
    try {
      // Logic for IP-based control (Wi-Fi)
      if (payload.ipEndpoint) {
        const response = await fetch(`http://${payload.ipEndpoint}/api/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: payload.code, protocol: payload.protocol }),
          signal: AbortSignal.timeout(2000) // 2-second timeout
        });

        if (response.ok) {
          console.log(`[WIFI] Signal sent to ${payload.ipEndpoint}: ${payload.code}`);
          return { success: true, mode: 'WIFI' };
        } else {
            console.warn(`[WIFI] Failed to send signal to ${payload.ipEndpoint}. Status: ${response.status}`);
        }
      }

      // Fallback to web simulation
      console.log(`[Web Simulation] Signal sent: ${payload.code}, Protocol: ${payload.protocol}`);
      return { success: true, mode: 'SIMULATED' };

    } catch (error) {
      console.error('Error dispatching signal:', error);
      if (error instanceof Error && error.name === 'AbortError') {
          console.error(`[WIFI] Request to ${payload.ipEndpoint} timed out.`);
      }
      return { success: false, mode: 'FAILED' };
    }
  }
}
