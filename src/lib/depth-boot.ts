/**
 * The front page's depth buttons (Headline / Summary / Deep) keep the reader's choice in
 * this browser. The page is written out at "Summary"; without this, a reader who chose
 * "Headline" or "Deep" saw the summary layout first and watched it fold or open once the
 * scripts started. DEPTH_BOOT runs in <head>: before every frame is painted, until the page
 * has loaded or the reader touches it, it gives the depth-controlled lists and the three
 * buttons the stored choice. Nothing changes for a reader on "Summary".
 */
export const DEPTH_KEY = "orbis-depth";

export const DEPTH_BOOT = [
  "try{",
  `var d=localStorage.getItem("${DEPTH_KEY}");`,
  'if(d==="1"||d==="3"){',
  "var stop=false,end=function(){stop=true};",
  'addEventListener("pointerdown",end,true);addEventListener("keydown",end,true);',
  'addEventListener("load",function(){setTimeout(end,500)});',
  "var fix=function(){if(stop)return;",
  'var b=document.querySelectorAll("[data-depth-step]");',
  "if(b.length){",
  'for(var i=0;i<b.length;i++)b[i].setAttribute("aria-checked",String(b[i].getAttribute("data-depth-step")===d));',
  'var r=document.querySelectorAll(".records[data-depth]");',
  'for(var j=0;j<r.length;j++)if(r[j].getAttribute("data-depth")!==d)r[j].setAttribute("data-depth",d)}',
  "requestAnimationFrame(fix)};",
  "requestAnimationFrame(fix)}",
  "}catch(e){}",
].join("");
