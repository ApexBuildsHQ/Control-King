import { registerPlugin } from '@capacitor/core';

interface ConsumerIrPlugin {
  hasIrEmitter(): Promise<{ hasEmitter: boolean }>;
    transmit(options: { frequency: number; pattern: string }): Promise<void>;
    }

    const ConsumerIr = registerPlugin<ConsumerIrPlugin>('ConsumerIr');

    export interface CommandPayload {
      code: string;
        protocol: string;
          frequency: number;
            ipEndpoint?: string | null;
            }

            export class RemoteDispatcher {
              static async sendSignal(payload: CommandPayload): Promise<{ success: boolean; mode: string }> {
                  try {
                        const irStatus = await ConsumerIr.hasIrEmitter().catch(() => ({ hasEmitter: false }));
                              
                                    if (irStatus.hasEmitter) {
                                            await ConsumerIr.transmit({
                                                      frequency: payload.frequency || 38000,
                                                                pattern: payload.code
                                                                        });
                                                                                return { success: true, mode: 'IR' };
                                                                                      }

                                                                                            if (payload.ipEndpoint) {
                                                                                                    const response = await fetch(`http://${payload.ipEndpoint}/api/control`, {
                                                                                                              method: 'POST',
                                                                                                                        headers: { 'Content-Type': 'application/json' },
                                                                                                                                  body: JSON.stringify({ code: payload.code, protocol: payload.protocol }),
                                                                                                                                            signal: AbortSignal.timeout(2000)
                                                                                                                                                    });
                                                                                                                                                            
                                                                                                                                                                    if (response.ok) {
                                                                                                                                                                              return { success: true, mode: 'WIFI' };
                                                                                                                                                                                      }
                                                                                                                                                                                            }

                                                                                                                                                                                                  console.log(`[Web Simulation] Signal sent: ${payload.code}`);
                                                                                                                                                                                                        return { success: true, mode: 'SIMULATED' };

                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                  console.error('Error dispatching signal:', error);
                                                                                                                                                                                                                        return { success: false, mode: 'FAILED' };
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                              