//Hent alle class="demo" og læg dem i et array og vælg fra dette array
var arr =  document.getElementsByClassName("demo");
arr[1].innerHTML = "Hi";

//gem alle p-tags i array og løb arrayets længde (antal  p-tags) igennem og erstat med "hi there"
var arr = document.getElementsByTagName("p");
for (let x = 0; x < arr.length; x++) {
  arr[x].innerHTML = "Hi there";
}


//find et img-tag og ændr værdien af src-attributten
var el = document.getElementById("myimg");
el.src = "apple.png";


//ændr css for id="demo"
var x = document.getElementById("demo");
  x.style.backgroundColorcolor = "6600FF"; //alle css-egenskaber med tankestreg - erstattes af camelCase
  x.style.width = "100px";


//fjern id="lillekasse" fra forælder-tagget id="storkasse" med .removeChild-egenskaben
var parent = document.getElementById("storkasse");
var child = document.getElementById("lillekasse");
parent.removeChild(child);

//En position, en box, og setInterval som udfører en funktion hvert 10 ms. funktionen stopper når pos=150
var pos = 0;
var box = document.getElementById("box");
var t = setInterval(move, 10);

function move() {
  if(pos >= 150) {
    clearInterval(t);
  }
  else {
    pos += 1;
    box.style.left = pos+"px";
    box.style.up = pos+"px";

  }
}
//på et input-tag kan man sætte en onchange="change()" event-handler som attribut. Den tager value og gør til store bogstaver
function change() {
 var x = document.getElementById("name");
 x.value= x.value.toUpperCase();
}


//Hvis man skal have flere events handlers på ét element bruges addEventListener
//knap tilføjes eventlistener. 1. parameter er typen af event handler, og 2. parameter er funktionen.
var btn = document.getElementById("demo");
btn.addEventListener("click", myFunction);

function myFunction() {
  alert(Math.random()); //viser et tilfældigt tal 0-1
  btn.removeEventListener("click", myFunction); //fjerner eventlisteneren igen
}

//Billede-slider

var fremknap = document.getElementById("fremknap");
var tilbageknap = document.getElementById("tilbageknap");
fremknap.addEventListener("click", next());
tilbageknap.addEventListener("click", prev());


 var images = [
  "http://www.sololearn.com/uploads/slider/1.jpg",
  "http://www.sololearn.com/uploads/slider/2.jpg",
  "http://www.sololearn.com/uploads/slider/3.jpg"
  ];
  var num = 0;

function next() {
  let slider = document.getElementById("slider");
  num++;
  if(num >= images.length) {
    num = 0;
  }
  slider.src = images[num];
  }

function prev() {
  var slider = document.getElementById("slider");
  num--;
  if(num < 0) {
    num = images.length-1;
  }
  slider.src = images[num];
}


//Validering af input med attributten onsubmit som skal være true før den submitter
//input id="num1" og input id="num2"
function validate() {
    var n1 = document.getElementById('num1');
    var n2 = document.getElementById('num2');
    if(n1.value != '' && n2.value != '') {
        if(n1.value == n2.value) {
            return true;
        }
    }
    alert("The values should be equal and not blank");
    return false;
}

//Husk ES6 Ecmascript 2015 udgaven af Javascript, kan lave string uden at opdele i flere strings
let name = 'David';
let msg = `Welcome ${name}!`; //bemærk at det kræver `` istedet for ´´
console.log(msg);

//ES6 gør det muligt at løbe igennem hver karater i en string
for (let bogstav of "disse bogstaver") {
    console.log(bogstav);
}

//ES6 gør det muligt at skrive function FunktionNavn(parameter){console.log ="hej"} som  parameter => {console.log = "hej"}

const arr = [2, 3, 7, 8];

arr.forEach(v => {
  console.log(v * 2);
});

//ES6 kan sætte værdier på parametrene i funktioner
const test = (a, b = 3, c = 42) => {
  return a + b + c;
}
console.log(test(5)); //returnerer 50

//ES6 laver object destructurering
let obj = {h:100, s: true}; //objekt med h = 100 og s = true
let {h, s} = obj; // skaber var h og var s ud fra obj

console.log(h); // 100
console.log(s); // true


//skift indhold i html med javascript
var el = document.getElementById("start");
el.innerHTML = "Go";
//skrift indhold i html med jQuery
$("#start").html("Go");

//jQuery brugere selectorer med CSS-lignende syntaks
$("div.menu")  // all <div> elements with class="menu"
$("p:first")  // the first <p> element
$("h1, p") // all <h1> and all <p> elements
$("div p") // all <p> elements that are descendants of a <div> element
$("*")  // all elements of the DOM
//jquery udskifter attributten href til noget andet
$(function() {
  $("a").attr("href", "http://www.jquery.com");
});


//Confetti
class Progress {
  constructor(param = {}) {
    this.timestamp        = null;
    this.duration         = param.duration || Progress.CONST.DURATION;
    this.progress         = 0;
    this.delta            = 0;
    this.progress         = 0;
    this.isLoop           = !!param.isLoop;

    this.reset();
  }

  static get CONST() {
    return {
      DURATION : 1000
    };
  }

  reset() {
    this.timestamp = null;
  }

  start(now) {
    this.timestamp = now;
  }

  tick(now) {
    if (this.timestamp) {
      this.delta    = now - this.timestamp;
      this.progress = Math.min(this.delta / this.duration, 1);

      if (this.progress >= 1 && this.isLoop) {
        this.start(now);
      }

      return this.progress;
    } else {
      return 0;
    }
  }
}

class Confetti {
  constructor(param) {
    this.parent         = param.elm || document.body;
    this.canvas         = document.createElement("canvas");
    this.ctx            = this.canvas.getContext("2d");
    this.width          = param.width  || this.parent.offsetWidth;
    this.height         = param.height || this.parent.offsetHeight;
    this.length         = param.length || Confetti.CONST.PAPER_LENGTH;
    this.yRange         = param.yRange || this.height * 2;
    this.progress       = new Progress({
      duration : param.duration,
      isLoop   : true
    });
    this.rotationRange  = typeof param.rotationLength === "number" ? param.rotationRange
                                                                   : 10;
    this.speedRange     = typeof param.speedRange     === "number" ? param.speedRange
                                                                   : 10;
    this.sprites        = [];

    this.canvas.style.cssText = [
      "display: block",
      "position: absolute",
      "top: 0",
      "left: 0",
      "pointer-events: none"
    ].join(";");

    this.render = this.render.bind(this);

    this.build();

    this.parent.appendChild(this.canvas);
    this.progress.start(performance.now());

    requestAnimationFrame(this.render);
  }

  static get CONST() {
    return {
        SPRITE_WIDTH  : 9,
        SPRITE_HEIGHT : 16,
        PAPER_LENGTH  : 100,
        DURATION      : 8000,
        ROTATION_RATE : 50,
        COLORS        : [
          "#EF5350",
          "#EC407A",
          "#AB47BC",
          "#7E57C2",
          "#5C6BC0",
          "#42A5F5",
          "#29B6F6",
          "#26C6DA",
          "#26A69A",
          "#66BB6A",
          "#9CCC65",
          "#D4E157",
          "#FFEE58",
          "#FFCA28",
          "#FFA726",
          "#FF7043",
          "#8D6E63",
          "#BDBDBD",
          "#78909C"
        ]
    };
  }

  build() {
    for (let i = 0; i < this.length; ++i) {
      let canvas = document.createElement("canvas"),
          ctx    = canvas.getContext("2d");

      canvas.width  = Confetti.CONST.SPRITE_WIDTH;
      canvas.height = Confetti.CONST.SPRITE_HEIGHT;

      canvas.position = {
        initX : Math.random() * this.width,
        initY : -canvas.height - Math.random() * this.yRange
      };

      canvas.rotation = (this.rotationRange / 2) - Math.random() * this.rotationRange;
      canvas.speed    = (this.speedRange / 2) + Math.random() * (this.speedRange / 2);

      ctx.save();
        ctx.fillStyle = Confetti.CONST.COLORS[(Math.random() * Confetti.CONST.COLORS.length) | 0];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      this.sprites.push(canvas);
    }
  }

  render(now) {
    let progress = this.progress.tick(now);

    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    for (let i = 0; i < this.length; ++i) {
      this.ctx.save();
        this.ctx.translate(
          this.sprites[i].position.initX + this.sprites[i].rotation * Confetti.CONST.ROTATION_RATE * progress,
          this.sprites[i].position.initY + progress * (this.height + this.yRange)
        );
        this.ctx.rotate(this.sprites[i].rotation);
        this.ctx.drawImage(
          this.sprites[i],
          -Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed)) / 2,
          -Confetti.CONST.SPRITE_HEIGHT / 2,
          Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed)),
          Confetti.CONST.SPRITE_HEIGHT
        );
      this.ctx.restore();
    }

    requestAnimationFrame(this.render);
  }
}

(() => {
  const DURATION = 8000,
        LENGTH   = 120;

  new Confetti({
    width    : window.innerWidth,
    height   : window.innerHeight,
    length   : LENGTH,
    duration : DURATION
  });

  setTimeout(() => {
    new Confetti({
      width    : window.innerWidth,
      height   : window.innerHeight,
      length   : LENGTH,
      duration : DURATION
    });
  }, DURATION / 2);
})();