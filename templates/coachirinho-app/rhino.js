// <rhino-mascot state="idle|wave|talk|celebrate|loading|think|sleep"> — маскот Coachirinho.
// Палитра берётся из --rhino-* на странице, иначе дефолт.
(() => {
if (customElements.get('rhino-mascot')) return;
const CSS = `
:host{display:block;width:100%;aspect-ratio:1/1;--skin:var(--rhino-skin,#68778D);--skin-dark:var(--rhino-skin-dark,#818EA2);--belly:var(--rhino-belly,#BAC0C9);--horn:var(--rhino-horn,#F2E3C4);--horn-shade:var(--rhino-horn-shade,#D9C49B);--ear-in:var(--rhino-ear-in,#D98C9D);--cheek:var(--rhino-cheek,#E0899A);--eye:var(--rhino-eye,#242A36);--line:var(--rhino-line,#2B3242);--sclera:var(--rhino-sclera,#F6F8FB);--brow-c:var(--rhino-brow,#CDD0D5);--nostril:var(--rhino-nostril,#95A1B1);--zzz:var(--rhino-accent,#6C7BD1)}
svg{display:block;width:100%;height:100%;overflow:visible}
.shadow{fill:#2B3152;opacity:.12}
.body{fill:var(--skin)}
.belly{fill:var(--belly)}
.head-shape{fill:var(--skin)}
.muzzle{fill:var(--belly)}
.limb{stroke:var(--skin-dark);stroke-width:25;stroke-linecap:round;fill:none}
.foot{fill:var(--skin-dark)}
.tail{stroke:var(--skin-dark);stroke-width:9;stroke-linecap:round;fill:none}
.ear-out{fill:var(--skin-dark)}
.ear-in{fill:var(--ear-in)}
.horn{fill:var(--horn)}
.horn-hl{fill:var(--horn-shade);opacity:.7}
.eye{fill:var(--eye)}
.glint{fill:#fff}
.arm-think,.arm-cheer,.eyes-happy,.eyes-closed,.dots{display:none}
.arc{stroke:var(--eye);stroke-width:7.5;stroke-linecap:round;fill:none}
.pupils{transform-box:view-box;transform-origin:200px 160px}
.brow{stroke:var(--brow-c);stroke-width:5.5;stroke-linecap:round;fill:none}
.sclera{fill:var(--sclera)}
.lid{stroke:var(--brow-c);stroke-width:6;stroke-linecap:round;fill:none}
.cheek{fill:var(--cheek);opacity:.5}
.nostril{fill:var(--nostril);opacity:.9}
.mouth{stroke:var(--line);stroke-width:6;stroke-linecap:round;fill:none}
.mouth-open{fill:#7A4657;display:none}
.zzz{fill:var(--zzz);font:700 30px ui-rounded,system-ui,sans-serif;opacity:0;display:none}
.dots circle{fill:var(--zzz);opacity:.35}
.breathe{transform-box:view-box;transform-origin:200px 330px;animation:breathe 3s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.035,.975)}}
.head{transform-box:view-box;transform-origin:200px 240px;animation:headbob 3s ease-in-out infinite}
@keyframes headbob{0%,100%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-5px) rotate(-1.6deg)}70%{transform:translateY(-3px) rotate(1.6deg)}}
.eyes{transform-box:view-box;transform-origin:200px 160px;animation:blink 5.2s infinite}
@keyframes blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
.ear-l{transform-box:view-box;transform-origin:140px 122px;animation:twitchL 5.8s ease-in-out infinite}
.ear-r{transform-box:view-box;transform-origin:260px 122px;animation:twitchR 5.8s ease-in-out infinite}
@keyframes twitchL{0%,74%,100%{transform:rotate(0)}80%{transform:rotate(-11deg)}86%{transform:rotate(2deg)}}
@keyframes twitchR{0%,74%,100%{transform:rotate(0)}80%{transform:rotate(11deg)}86%{transform:rotate(-2deg)}}
.tail{transform-box:view-box;transform-origin:272px 292px;animation:tailwag 2.4s ease-in-out infinite}
@keyframes tailwag{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
.arm-l{transform-box:view-box;transform-origin:150px 250px}
.arm-r{transform-box:view-box;transform-origin:250px 250px}
.bob{transform-box:view-box;transform-origin:200px 370px}
.state-wave .arm-r{animation:wave .62s ease-in-out infinite}
@keyframes wave{0%,100%{transform:rotate(-118deg)}50%{transform:rotate(-152deg)}}
.state-wave .head{animation:headbob 1.4s ease-in-out infinite}
.state-talk .mouth{display:none}
.state-talk .mouth-open{display:block;transform-box:view-box;transform-origin:200px 222px;animation:talk .34s ease-in-out infinite}
@keyframes talk{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1.15)}}
.state-talk .head{animation:headbob 1.1s ease-in-out infinite}
.state-celebrate .bob{animation:hop .78s cubic-bezier(.3,.7,.4,1) infinite}
@keyframes hop{0%,100%{transform:translateY(0) scale(1,1)}18%{transform:translateY(4px) scale(1.06,.94)}50%{transform:translateY(-40px) scale(.96,1.05)}82%{transform:translateY(3px) scale(1.05,.95)}}
.state-celebrate .arm-l,.state-celebrate .arm-r{display:none}
.state-celebrate .arm-cheer{display:block;transform-box:view-box}
.state-celebrate .arm-cheer-l{transform-origin:150px 252px;animation:flapL .78s ease-in-out infinite}
.state-celebrate .arm-cheer-r{transform-origin:250px 252px;animation:flapR .78s ease-in-out infinite}
@keyframes flapL{0%,100%{transform:rotate(9deg)}50%{transform:rotate(-13deg)}}
@keyframes flapR{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(13deg)}}
.state-celebrate .eyes{display:none}
.state-celebrate .eyes-happy{display:block}
.state-celebrate .brow-l,.state-celebrate .brow-r{transform-box:view-box;transform:translateY(-4px)}
.state-celebrate .mouth{transform-box:view-box;transform-origin:200px 222px;transform:scale(1.25)}
.state-celebrate .mouth-open{display:none}
.state-celebrate .cheek{opacity:.62}
.state-loading .dots{display:block}
.state-loading .dots circle{animation:dot .9s ease-in-out infinite;transform-box:view-box;transform-origin:center}
.state-loading .dots circle:nth-child(2){animation-delay:.15s}
.state-loading .dots circle:nth-child(3){animation-delay:.3s}
@keyframes dot{0%,100%{opacity:.28;transform:translateY(0)}45%{opacity:1;transform:translateY(-7px)}}
.state-loading .bob{animation:trot .46s ease-in-out infinite}
@keyframes trot{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.state-loading .leg-l,.state-loading .foot-l{transform-box:view-box;transform-origin:176px 314px;animation:step .46s ease-in-out infinite}
.state-loading .leg-r,.state-loading .foot-r{transform-box:view-box;transform-origin:224px 314px;animation:step .46s ease-in-out infinite reverse}
@keyframes step{0%,100%{transform:rotate(-15deg)}50%{transform:rotate(15deg)}}
.state-loading .head{animation:headbob 1.4s ease-in-out infinite}
.state-loading .breathe{animation-duration:1.2s}
.state-loading .shadow{opacity:.05}
.state-think .arm-r{display:none}
.state-think .arm-think{display:block;transform-box:view-box;transform-origin:270px 300px;animation:prop 3.4s ease-in-out infinite}
@keyframes prop{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-2.2deg)}}
.state-think .head{animation:think 3.4s ease-in-out infinite}
@keyframes think{0%,100%{transform:rotate(-7deg) translateY(-1px)}50%{transform:rotate(-10.5deg) translateY(-4px)}}
.state-think .arm-l{transform:rotate(-9deg)}
.state-think .pupils{animation:ponder 3.4s ease-in-out infinite}
@keyframes ponder{0%,100%{transform:translate(-4px,-6.5px)}40%{transform:translate(-6px,-7.5px)}72%{transform:translate(-1px,-5px)}}
.state-think .brow-l{transform-box:view-box;transform-origin:156px 133px;transform:translateY(-5px) rotate(-5deg)}
.state-think .brow-r{transform-box:view-box;transform-origin:244px 133px;transform:translateY(2px) rotate(-6deg)}
.state-think .mouth{transform-box:view-box;transform-origin:200px 224px;transform:translateX(5px) scaleX(.68)}
.state-think .eyes{animation:blink 6.4s infinite}
.state-sleep .eyes{display:none}
.state-sleep .eyes-closed{display:block}
.state-sleep .breathe{animation-duration:4.4s}
.state-sleep .head{animation:sleepnod 4.4s ease-in-out infinite}
@keyframes sleepnod{0%,100%{transform:rotate(7deg) translateY(2px)}50%{transform:rotate(9deg) translateY(7px)}}
.state-sleep .tail{animation-duration:4.4s}
.state-sleep .zzz{display:block;animation:zzz 2.6s ease-out infinite}
.state-sleep .zzz:nth-of-type(2){animation-delay:.85s}
.state-sleep .zzz:nth-of-type(3){animation-delay:1.7s}
@keyframes zzz{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:.95}100%{opacity:0;transform:translate(22px,-56px) scale(1.15)}}
.hat{display:none;transform-box:view-box;transform-origin:200px 96px;animation:hatsway 6.4s ease-in-out infinite}
.hat-on-uk .hat-uk,.hat-on-es .hat-es{display:block}
@keyframes hatsway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;
const SVG = `<svg class="rhino state-idle" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Носорог Coachirinho">
<ellipse class="shadow" cx="200" cy="378" rx="76" ry="12"></ellipse>
<g class="bob">
<path class="tail" d="M270 296 q28 4 24 28"></path>
<path class="limb leg-l" d="M176 314 L172 352"></path>
<path class="limb leg-r" d="M224 314 L228 352"></path>
<ellipse class="foot foot-l" cx="170" cy="357" rx="22" ry="13"></ellipse>
<ellipse class="foot foot-r" cx="230" cy="357" rx="22" ry="13"></ellipse>
<g class="breathe"><ellipse class="body" cx="200" cy="274" rx="76" ry="64"></ellipse><ellipse class="belly" cx="200" cy="286" rx="51" ry="46"></ellipse></g>
<g class="head">
<g class="ear ear-l" transform="rotate(-20 140 122)"><ellipse class="ear-out" cx="140" cy="112" rx="21" ry="28"></ellipse><ellipse class="ear-in" cx="140" cy="114" rx="11" ry="17"></ellipse></g>
<g class="ear ear-r" transform="rotate(20 260 122)"><ellipse class="ear-out" cx="260" cy="112" rx="21" ry="28"></ellipse><ellipse class="ear-in" cx="260" cy="114" rx="11" ry="17"></ellipse></g>
<ellipse class="head-shape" cx="200" cy="170" rx="87" ry="74"></ellipse>
<ellipse class="muzzle" cx="200" cy="204" rx="57" ry="39"></ellipse>
<path class="horn" d="M177 200 C181 156 189 128 200 108 C211 128 219 156 223 200 Z"></path>
<path class="horn-hl" d="M200 108 C211 128 219 156 223 200 L209 200 C207 160 204 132 200 108 Z"></path>
<g class="eyes">
<ellipse class="sclera" cx="157" cy="159" rx="19" ry="19.5"></ellipse><ellipse class="sclera" cx="243" cy="159" rx="19" ry="19.5"></ellipse>
<g class="pupils"><circle class="eye" cx="159" cy="162" r="12.5"></circle><circle class="eye" cx="241" cy="162" r="12.5"></circle><circle class="glint" cx="154" cy="157" r="4.8"></circle><circle class="glint" cx="236" cy="157" r="4.8"></circle><circle class="glint" cx="164" cy="168" r="2.4"></circle><circle class="glint" cx="246" cy="168" r="2.4"></circle></g>
</g>
<g class="eyes-happy"><path class="arc" d="M141 168 Q157 145 173 168"></path><path class="arc" d="M227 168 Q243 145 259 168"></path></g>
<g class="eyes-closed"><path class="lid" d="M143 158 q14 14 28 0"></path><path class="lid" d="M229 158 q14 14 28 0"></path></g>
<path class="brow brow-l" d="M143 134 q14 -9 27 -3"></path>
<path class="brow brow-r" d="M257 134 q-14 -9 -27 -3"></path>
<ellipse class="cheek" cx="136" cy="196" rx="14" ry="10"></ellipse>
<ellipse class="cheek" cx="264" cy="196" rx="14" ry="10"></ellipse>
<ellipse class="nostril" cx="184" cy="210" rx="4.6" ry="3.4"></ellipse>
<ellipse class="nostril" cx="216" cy="210" rx="4.6" ry="3.4"></ellipse>
<path class="mouth" d="M184 220 q16 16 32 0"></path>
<ellipse class="mouth-open" cx="200" cy="222" rx="15" ry="11"></ellipse>
<text class="zzz" x="286" y="120">z</text><text class="zzz" x="286" y="120">z</text><text class="zzz" x="286" y="120">z</text>
<defs><clipPath id="uk-crown"><path d="M156 86 C156 28 244 28 244 86 Z"></path></clipPath><clipPath id="es-crown"><path d="M154 86 L159 44 Q200 33 241 44 L246 86 Z"></path></clipPath></defs>
<g class="hat hat-uk"><g transform="rotate(-6 200 90) translate(0 6)"><ellipse cx="200" cy="98" rx="62" ry="11" fill="#1B2028" opacity=".16"></ellipse><path d="M156 86 C156 28 244 28 244 86 Z" fill="#2E3542"></path><g clip-path="url(#uk-crown)"><rect x="150" y="66" width="104" height="15" fill="#C8102E"></rect><ellipse cx="180" cy="50" rx="15" ry="19" fill="#fff" opacity=".13" transform="rotate(-18 180 50)"></ellipse></g><ellipse cx="200" cy="86" rx="74" ry="13" fill="#2E3542"></ellipse><ellipse cx="200" cy="90" rx="74" ry="10" fill="#232936"></ellipse><ellipse cx="200" cy="84" rx="74" ry="12" fill="#2E3542"></ellipse></g></g>
<g class="hat hat-es"><g transform="rotate(5 200 90) translate(0 6)"><ellipse cx="200" cy="98" rx="66" ry="11" fill="#1B2028" opacity=".16"></ellipse><path d="M154 86 L159 44 Q200 33 241 44 L246 86 Z" fill="#26221F"></path><g clip-path="url(#es-crown)"><rect x="148" y="51" width="108" height="17" fill="#C60B1E"></rect><rect x="148" y="56" width="108" height="8" fill="#FFC400"></rect><ellipse cx="178" cy="48" rx="12" ry="14" fill="#fff" opacity=".13" transform="rotate(-14 178 48)"></ellipse></g><ellipse cx="200" cy="86" rx="98" ry="15" fill="#26221F"></ellipse><ellipse cx="200" cy="91" rx="98" ry="10" fill="#1A1714"></ellipse><ellipse cx="200" cy="84" rx="98" ry="14" fill="#26221F"></ellipse></g></g>
</g>
<path class="limb arm arm-l" d="M150 250 C132 268 124 288 128 306"></path>
<path class="limb arm arm-r" d="M250 250 C268 268 276 288 272 306"></path>
<path class="limb arm arm-think" d="M270 300 C298 274 282 240 240 230"></path>
<path class="limb arm arm-cheer arm-cheer-l" d="M150 252 C122 250 100 244 80 234"></path>
<path class="limb arm arm-cheer arm-cheer-r" d="M250 252 C278 250 300 244 320 234"></path>
<g class="dots"><circle cx="166" cy="394" r="7.5"></circle><circle cx="200" cy="394" r="7.5"></circle><circle cx="234" cy="394" r="7.5"></circle></g>
</g>
</svg>`;
const STATES = ['idle','wave','talk','celebrate','loading','think','sleep'];
class RhinoMascot extends HTMLElement {
  static get observedAttributes(){ return ['state','hat']; }
  connectedCallback(){
    if (!this.shadowRoot) {
      const r = this.attachShadow({mode:'open'});
      const s = document.createElement('style'); s.textContent = CSS;
      r.append(s);
      const t = document.createElement('template'); t.innerHTML = SVG;
      r.append(t.content.cloneNode(true));
      this._svg = r.querySelector('svg');
    }
    this._apply();
  }
  attributeChangedCallback(){ if (this._svg) this._apply(); }
  _apply(){
    const s = this.getAttribute('state');
    const h = this.getAttribute('hat');
    this._svg.setAttribute('class', 'rhino state-' + (STATES.includes(s) ? s : 'idle') + (h === 'uk' || h === 'es' ? ' hat-on-' + h : ''));
  }
}
customElements.define('rhino-mascot', RhinoMascot);
})();
