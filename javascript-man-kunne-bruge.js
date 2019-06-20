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
