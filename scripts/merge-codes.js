import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), 'raw_data');
const OUTPUT_DIR = path.join(process.cwd(), 'public/data/remotes');

const GLOBAL_BUTTON_MAP = {
  // TV & Receivers
    'PWR': 'power', 'POWER': 'power', 'POWER_OFF': 'power', 'ON/OFF': 'power', 'STANDBY': 'power',
      'VOL+': 'vol_up', 'VOL_UP': 'vol_up', 'VOLUME_UP': 'vol_up', 'PLUS': 'vol_up',
        'VOL-': 'vol_down', 'VOL_DOWN': 'vol_down', 'VOLUME_DOWN': 'vol_down', 'MINUS': 'vol_down',
          'MUTE': 'mute', 'SILENT': 'mute', 'MUTING': 'mute',
            'CH+': 'ch_up', 'CH_UP': 'ch_up', 'CHANNEL_UP': 'ch_up', 'PAGE_UP': 'ch_up',
              'CH-': 'ch_down', 'CH_DOWN': 'ch_down', 'CHANNEL_DOWN': 'ch_down', 'PAGE_DOWN': 'ch_down',
                'MENU': 'menu', 'SETUP': 'menu', 'SETTINGS': 'menu',
                  'HOME': 'home', 'SMART': 'home', 'HUB': 'home',
                    'BACK': 'back', 'RETURN': 'back', 'EXIT': 'exit', 'CANCEL': 'exit',
                      'OK': 'ok', 'ENTER': 'ok', 'SELECT': 'ok',
                        'UP': 'nav_up', 'DPAD_UP': 'nav_up',
                          'DOWN': 'nav_down', 'DPAD_DOWN': 'nav_down',
                            'LEFT': 'nav_left', 'DPAD_LEFT': 'nav_left',
                              'RIGHT': 'nav_right', 'DPAD_RIGHT': 'nav_right',
                                'SOURCE': 'input', 'INPUT': 'input', 'AV': 'input', 'HDMI': 'input',
                                  'RED': 'btn_red', 'GREEN': 'btn_green', 'YELLOW': 'btn_yellow', 'BLUE': 'btn_blue',

                                    // Air Conditioners (AC)
                                      'TEMP+': 'temp_up', 'TEMP_UP': 'temp_up', 'WARMER': 'temp_up',
                                        'TEMP-': 'temp_down', 'TEMP_DOWN': 'temp_down', 'COOLER': 'temp_down',
                                          'MODE': 'ac_mode', 'OPERATION_MODE': 'ac_mode',
                                            'COOL': 'mode_cool', 'HEAT': 'mode_heat', 'FAN_ONLY': 'mode_fan', 'DRY': 'mode_dry', 'AUTO_MODE': 'mode_auto',
                                              'FAN_SPEED': 'fan_speed', 'FAN': 'fan_speed', 'SPEED': 'fan_speed',
                                                'SWING': 'swing_v', 'V_SWING': 'swing_v', 'SWING_H': 'swing_h', 'L_R_SWING': 'swing_h',
                                                  'TURBO': 'turbo', 'JET': 'turbo', 'POWERFUL': 'turbo', 'SUPER': 'turbo',
                                                    'ECO': 'eco', 'SLEEP': 'sleep', 'SAVER': 'eco',
                                                      'TIMER': 'timer', 'TIMER_ON': 'timer_on', 'TIMER_OFF': 'timer_off',

                                                        // Audio & DVD
                                                          'PLAY': 'media_play', 'PAUSE': 'media_pause', 'PLAY/PAUSE': 'media_play_pause',
                                                            'STOP': 'media_stop', 'REC': 'record',
                                                              'NEXT': 'next_track', 'PREV': 'prev_track', 'SKIP_FWD': 'next_track', 'SKIP_BWD': 'prev_track',
                                                                'BASS': 'audio_bass', 'TREBLE': 'audio_treble', 'EQ': 'audio_eq', 'SURROUND': 'audio_surround',

                                                                  // Fans & Purifiers
                                                                    'OSCIL': 'oscillation', 'SWING_FAN': 'oscillation', 'ROTATE': 'oscillation',
                                                                      'SPEED+': 'speed_up', 'SPEED-': 'speed_down',
                                                                        'LIGHT': 'light_toggle', 'LAMP': 'light_toggle',

                                                                          // Projectors
                                                                            'KEYSTONE+': 'keystone_up', 'KEYSTONE-': 'keystone_down',
                                                                              'ZOOM+': 'zoom_in', 'ZOOM-': 'zoom_out',
                                                                                'FREEZE': 'freeze_frame', 'BLANK': 'blank_screen'
                                                                                };

                                                                                function normalizeButton(rawBtn) {
                                                                                  const normalizedKey = String(rawBtn.key || rawBtn.id).toUpperCase().trim();
                                                                                    const standardId = GLOBAL_BUTTON_MAP[normalizedKey] || normalizedKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                                                                      
                                                                                        return {
                                                                                            id: standardId,
                                                                                                label: rawBtn.label || rawBtn.key || standardId,
                                                                                                    code: rawBtn.code,
                                                                                                        type: rawBtn.type || 'IR'
                                                                                                          };
                                                                                                          }

                                                                                                          function processFiles() {
                                                                                                            if (!fs.existsSync(OUTPUT_DIR)) {
                                                                                                                fs.mkdirSync(OUTPUT_DIR, { recursive: true });
                                                                                                                  }

                                                                                                                    if (!fs.existsSync(SOURCE_DIR)) {
                                                                                                                        console.log('⚠️ مجلد raw_data غير موجود. قم بإنشائه ووضع ملفات الشفرات بداخله.');
                                                                                                                            fs.mkdirSync(SOURCE_DIR, { recursive: true });
                                                                                                                                return;
                                                                                                                                  }

                                                                                                                                    const files = fs.readdirSync(SOURCE_DIR);

                                                                                                                                      files.forEach(file => {
                                                                                                                                          if (file.endsWith('.json')) {
                                                                                                                                                try {
                                                                                                                                                        const rawContent = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
                                                                                                                                                                const parsed = JSON.parse(rawContent);
                                                                                                                                                                        
                                                                                                                                                                                const cleanedData = {
                                                                                                                                                                                          categoryId: parsed.categoryId || 'general',
                                                                                                                                                                                                    brandId: parsed.brandId || 'generic',
                                                                                                                                                                                                              protocol: parsed.protocol || 'NEC',
                                                                                                                                                                                                                        frequency: parsed.frequency || 38000,
                                                                                                                                                                                                                                  ipEndpoint: parsed.ipEndpoint || null,
                                                                                                                                                                                                                                            buttons: (parsed.buttons || []).map(normalizeButton)
                                                                                                                                                                                                                                                    };

                                                                                                                                                                                                                                                            const outputFileName = `${cleanedData.categoryId.toLowerCase()}_${cleanedData.brandId.toLowerCase()}.json`;
                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                            fs.writeFileSync(
                                                                                                                                                                                                                                                                                      path.join(OUTPUT_DIR, outputFileName), 
                                                                                                                                                                                                                                                                                                JSON.stringify(cleanedData, null, 2)
                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                console.log(`✅ تم تجهيز وتوحيد: ${outputFileName}`);
                                                                                                                                                                                                                                                                                                                      } catch (err) {
                                                                                                                                                                                                                                                                                                                              console.error(`❌ خطأ في معالجة الملف ${file}:`, err);
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                          processFiles();
                                                                                                                                                                                                                                                                                                                                          