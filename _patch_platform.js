var fs = require('fs');
var path = 'C:\\Users\\Administrator\\.qclaw\\workspace-agent-225d3a4b\\boss-simulator-v2.html';
var c = fs.readFileSync(path, 'utf8');
console.log('Read:', c.length);

// 1. Fix: the earlier replacement only partially worked - showAd still has old code
// Find boundaries
var showAdStart = c.indexOf('function showAd(type');
var iapStart = c.indexOf('// In-App Purchase System');
console.log('showAd at', showAdStart, 'IAP at', iapStart);

if (showAdStart > 0 && iapStart > showAdStart) {
  var newShowAd = `function showAd(type, callback){
  if (state.adEnabled === false) { if(callback) callback(); return; }

  if (type === 'rewarded' || type === 'reward') {
    if (window.GAME_PLATFORM.isCrazyGames && CrazyGames && CrazyGames.SDK) {
      CrazyGames.SDK.ad.requestAd('rewarded', {
        adFinished: function() { 
          state.coins += 5; state.watchCount++;
          updateCoinDisplay(); 
          if(callback) callback(true); 
        },
        adError: function() { 
          if(callback) callback(false); 
        }
      });
    } else if (window.GAME_PLATFORM.isGameMonetize && typeof GAMEMONETIZE !== 'undefined') {
      GAMEMONETIZE.showRewardedAd(function(success){
        if(success) {
          state.coins += 5; state.watchCount++;
          updateCoinDisplay();
          if(callback) callback(true);
        } else {
          if(callback) callback(false);
        }
      });
    } else {
      // Standalone fallback: simulated ad
      showSimulatedAd(function(){
        state.coins += 5; state.watchCount++;
        updateCoinDisplay();
        if(callback) callback(true);
      });
    }
    window.REVENUE.adImpressions++;
    return;
  }

  // Midgame / interstitial
  if (window.GAME_PLATFORM.isCrazyGames && CrazyGames && CrazyGames.SDK) {
    CrazyGames.SDK.ad.requestAd('midgame', {});
  } else if (window.GAME_PLATFORM.isGameMonetize && typeof GAMEMONETIZE !== 'undefined') {
    GAMEMONETIZE.showInterstitial();
  }
  if (callback) callback();
  window.REVENUE.adImpressions++;
}

function showSimulatedAd(cb) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.9);z-index:10000;display:flex;align-items:center;justify-content:center;';
  var count = 5;
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:16px;padding:30px;text-align:center;max-width:320px;"><div style="font-size:48px;margin-bottom:16px;">📺</div><div style="font-size:18px;font-weight:700;color:#ffd700;margin-bottom:8px;">' + (lang==='cn'?'激励广告':'Rewarded Ad') + '</div><div style="font-size:14px;color:#aaa;margin-bottom:16px;">' + (lang==='cn'?'支持开发者获得5金币！':'Support the devs — get 5 coins!') + '</div><div id="_ad-timer" style="font-size:40px;font-weight:800;color:#e94560;">5</div></div>';
  document.body.appendChild(overlay);
  var t = setInterval(function(){
    count--;
    var el = document.getElementById('_ad-timer');
    if (!el) { clearInterval(t); return; }
    el.textContent = count;
    if (count <= 0) { clearInterval(t); overlay.remove(); if(cb) cb(); }
  }, 1000);
}

// (showAdSenseAd removed - replaced by real platform SDKs)
`;

  c = c.substring(0, showAdStart) + newShowAd + c.substring(iapStart);
  console.log('Replaced showAd, new length:', c.length);
}

// 2. Also update the rest of showAd reference in showShop  
// 3. Remove any remaining adsbygoogle references
c = c.replace(/adsbygoogle/g, 'window._noop');
c = c.replace(/pagead2\.googlesyndication/g, '');

// Write
fs.writeFileSync(path, c);
console.log('Saved! Final:', c.length);

// Verify
var finalCheck = require('fs').readFileSync(path, 'utf8');
console.log('Has CrazyGames SDK:', finalCheck.includes('crazygames-sdk-v3'));
console.log('Has GameMonetize:', finalCheck.includes('GAMEMONETIZE.showRewardedAd'));
console.log('Has showSimulatedAd:', finalCheck.includes('function showSimulatedAd'));
console.log('Has new showAd:', finalCheck.includes('GAME_PLATFORM.isCrazyGames'));
console.log('No adsbygoogle:', !finalCheck.includes('adsbygoogle'));
