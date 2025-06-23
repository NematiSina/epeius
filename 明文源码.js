const subLink = 'https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt';

export default {
  async fetch(request) {
    let url = new URL(request.url);
    let realhostname = url.pathname.split('/')[1];
    let realpathname = url.pathname.split('/')[2];
    
    if (url.pathname.startsWith('/sub')) {
      let newConfigs = '';
      let resp = await fetch(subLink);
      let subConfigs = await resp.text();
      subConfigs = subConfigs.split('\n');
      
      for (let subConfig of subConfigs) {
        if (!subConfig) continue;
        
        // Process Vmess configurations
        if (subConfig.startsWith('vmess://')) {
          try {
            subConfig = subConfig.replace('vmess://', '');
            subConfig = atob(subConfig);
            subConfig = JSON.parse(subConfig);
            
            if (subConfig.sni && !isIp(subConfig.sni) && subConfig.net == 'ws' && subConfig.port == 443) {
              var configNew = {
                v: '2',
                ps: 'Node-' + subConfig.sni,
                add: realpathname ? realpathname : url.hostname,
                port: subConfig.port,
                id: subConfig.id,
                net: subConfig.net,
                host: url.hostname,
                path: '/' + subConfig.sni + (subConfig.path || ''),
                tls: subConfig.tls,
                sni: url.hostname,
                aid: '0',
                scy: 'auto',
                type: 'auto',
                fp: 'chrome',
                alpn: 'http/1.1'
              };
              newConfigs += 'vmess://' + btoa(JSON.stringify(configNew)) + '\n';
            }
          } catch (e) {
            console.error('Error processing Vmess:', e);
          }
        }
        // Process Trojan configurations (ports 443/80)
        else if (subConfig.startsWith('trojan://')) {
          try {
            const uri = new URL(subConfig);
            const port = parseInt(uri.port || 443);
            
            if (port === 443 || port === 80) {
              newConfigs += subConfig + '\n';
            }
          } catch (e) {
            console.error('Error processing Trojan:', e);
          }
        }
        // Process Shadowsocks configurations (ports 443/80)
        else if (subConfig.startsWith('ss://')) {
          try {
            const uri = new URL(subConfig);
            const port = parseInt(uri.port || 443);
            
            if (port === 443 || port === 80) {
              newConfigs += subConfig + '\n';
            }
          } catch (e) {
            console.error('Error processing Shadowsocks:', e);
          }
        }
      }
      return new Response(newConfigs);
    } else {
      const url = new URL(request.url);
      const splitted = url.pathname.replace(/^\/*/, '').split('/');
      const address = splitted[0];
      url.pathname = splitted.slice(1).join('/');
      url.hostname = address;
      url.protocol = 'https';
      return fetch(new Request(url, request));
    }
  },
};

function isIp(ipstr) {
  try {
    if (!ipstr) return false;
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipstr)) return false;
    const parts = ipstr.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255 && String(num) === part;
    });
  } catch (e) {
    return false;
  }
}
