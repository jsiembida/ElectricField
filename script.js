// Constants
var canvasWidth = 600;
var canvasHeight = 600; 
var allowed_res = [1,2,4,5,8,10,12,15,20,30,40]

// Options
var timescale = 1
var pixPerCell = 10
var friction = 0
var charge = 800
var trailLength = 150


// Get the canvas object
var canvas = document.querySelector('canvas');

// Get the inputs
var timescaleInput = document.getElementById("timescale")
var resolutionInput = document.getElementById("resolution")
var frictionInput = document.getElementById("friction")
var chargeInput = document.getElementById("charge")
var trailInput = document.getElementById("trail")
var resetInput = document.getElementById("reset")

// Ensure everything words at different resolutions
if (window.innerWidth < 450) {
    canvasWidth  = 300 
    canvasHeight = 300
    chargeInput.value = 200
    allowed_res = [1,2,4,5,6,10,12,15,20,30]
    document.getElementById("charge_output").innerHTML = "200"
    charge = 200
}
if (window.innerWidth > 450 & window.innerWidth < 850) {
    canvasWidth  = 400 
    canvasHeight = 400
    allowed_res = [1,2,4,5,8,10,16,20,25,40]
}
canvas.width = canvasWidth
canvas.height = canvasHeight


// Do something?
var offscreen = canvas.transferControlToOffscreen()


// Variables
var lastTime = 0;
var paused = false;
var physicsWorker = new Worker("./physics.js")
var renderWorker = new Worker('./renderer.js')


// Get the position of the top left of the canvas
const canvas_left = canvas.offsetLeft
const canvas_top = canvas.offsetTop

// Create an array to hold items
var charges = [];

// Add an event listener for click events
canvas.addEventListener('mousedown', function(e) {
    var x = e.pageX - canvas_left;
    var y = e.pageY - canvas_top;
    var charge_sign = (e.button == 0) ? 1 : -1;
    console.log(e)
    // Add a new element to the charges array
    charges.push({
        colour: '#055AFF',
        y: y,
        x: x,
        vy: 0,
        vx: 0,
        q: charge * charge_sign,
        trail : [],
        static: document.getElementById('static').checked
    });
    updateView()
}, false)


canvas.addEventListener("contextmenu", function (event) {
	console.log('context menu prevented');
	event.preventDefault();
})

physicsWorker.addEventListener('message', function (e) {
    charges = e.data.charges
    renderWorker.postMessage({
        charges: charges,
        update: ['charges']
    })
})

physicsWorker.postMessage({
    charges: charges,
    canvasProperties: {'width':canvasWidth, 'height':canvasHeight},
    timescale: timescale,
    friction: friction,
    trailLength: trailLength
})


renderWorker.postMessage({
    canvas: offscreen,
    charges: charges,
    pixPerCell: pixPerCell
}, [offscreen])


function updateView() {
    console.log(charges)

    physicsWorker.postMessage({
        charges: charges,
        canvasProperties: {'width':canvasWidth, 'height':canvasHeight} ,
        update: ['charges', 'canvasProperties']
    })
}


// === Control Listeners
timescaleInput.addEventListener('input', function (e) {
    physicsWorker.postMessage({
        timescale: Math.pow(10, e.target.value),
        update: ['timescale']
    })
})

resolutionInput.addEventListener('input', function (e) {
    pixPerCell = closest(allowed_res, parseInt(e.target.value))
    renderWorker.postMessage({
        pixPerCell: pixPerCell,
        update: ['pixPerCell']
    })
})

frictionInput.addEventListener('input', function (e) {
    friction = parseFloat(e.target.value)
    physicsWorker.postMessage({
        friction: friction,
        update: ['friction']
    })
})

chargeInput.addEventListener('input', function (e) {
    charge = parseFloat(e.target.value)
})

trailInput.addEventListener('change', function (e) {
    console.log(e)
    trailLength = (e.target.checked) ? 150 : 1
    console.log(trailLength)
    physicsWorker.postMessage({
        trailLength: trailLength,
        update: ['trailLength']
    })
})
resetInput.addEventListener('click', function (e) {
    console.log('hello')
    charges = []
    updateView()
})


function closest(array, num) {
    var i = 0
    var minDif = 1000;
    var ans;
    for (i in array) {
        var dif = Math.abs(num - array[i]);
        if (dif < minDif) {
            minDif = dif
            ans = array[i]
        }
    }
    return ans
}


