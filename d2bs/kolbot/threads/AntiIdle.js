/**
*  @filename    AntiIdle.js
*  @author      theBGuy
*  @desc        Prevent Idle diconnect
*
*/
js_strict(true);
include("critical.js");
include("core/Util.js");
include("core/Packet.js");

function main () {
  console.log("ÿc3Start AntiIdle");
  let idleTick = Time.seconds(getTickCount() + rand(1200, 1500));
  
  while (true) {
    if (me.ingame && me.gameReady) {
      if (getTickCount() - idleTick > 0) {
        Packet.questRefresh();
        idleTick += Time.seconds(rand(1200, 1500));
        console.log("Sent anti-idle packet, next refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
      }
    }
  }
}
