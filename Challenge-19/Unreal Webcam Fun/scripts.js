const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// function to get the video input
function getVideo() {
    // navigator.mediaDevices will look for media devices present on the system (e.g camera , microphone etc)
    // getUserMedia will take media input in form of video or audio
    // here it will only take video input
    // navigator.mediaDevices.getUserMedia will return a promise 
    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        // if user allow or give permission then it will return a mediaStream(in this case a video)
        // video.srcObject is the source for the video <div>player</div>
        // video.srcObject=localmediaStream with this we set the source of the video player to the localmediaStream(video) return by the device
        // video.play() will start the video player
        .then(localmediaStream => {
            video.srcObject = localmediaStream;
            video.play();
        })
        // the error will happen if no media device is present in the system
        // OR if the user refuse to give permission to the browser
        // if the source (in this case) the website is not secured(https OR localhost are the only secured host recongnised by the browser)
        .catch(err => console.error('Ohh no!!!', err));

}

// this will cast/paste our video feed onto the bigger size canvas type
function paintToCanvas() {
    // you will find that the canvas height is bigger than the current window size even though its size is set to 640*480
    // because the width of the canvas is set to 100% which means it will take 100% of the space availabe of its parent container (photobooth)
    // Since the width of the photobooth is appx 1330px 
    // the canvas will also take width of 1330px
    // since the width is 1330px the height will be 999px in order to maintain the aspect ratio (640*480)
    // the canvas is taking aspect ratio from our defined size (i.e 640 * 480)
    // therefore you can change the aspect ratio by changing the width and height of the canvas
    // if you remove the width 100% from its css , it will regain the size of 640*480

    // width and height = 640 * 480 
    // because the resolution we get from the video feed is by default 640*480 and is pre-defined by the system webcam
    // setting canvas width and height = 640*480
    const width = video.videoWidth;
    const height = video.videoHeight;
    [canvas.width, canvas.height] = [width, height];

    // the video playing in the canvas is not a actual video
    // but rather a image showing every few millisecond (giving us a video like visual)
    // So every 16ms the image captured from  the video feed will be pasted/drawed on the canvas.
    // So we can say our video on canvas is showing 1 frame every 16 milliseconds
    return setInterval(() => {
        // ctx.drawImage will draw the image captured from the video feed
        // 0,0 are the x and y coordinate of the top left corner of the canvas
        // it will indicate that from which point the image drawing will start
        // width and height is of the destination contex(canvas)
        ctx.drawImage(video, 0, 0, width, height);

        // FROM HERE AFTERWARDS pixels MEANS VARIABLE

        // ctx.getImageData will give the data of the image(from the video playing on the canvas) 
        // pixels will store the image data in form of array of rgb values for individual pixels
        let pixels = ctx.getImageData(0, 0, width, height);

        // Rendering different effects for the pixels
        // Every image captured from the video feed every 16ms will go through these function everytime
        // The pixels returned by these function will have different rgb values as compared to the original pixels

        // This is for red filter
        // pixels = redEffect(pixels);

        // This is for rgbSplit(tiktok) filter
        // pixels = rgbSplit(pixels);

        // This is for green screen
        pixels = greenScreen(pixels);

        // globalAlpha will determine how transparent will be the filters (0 - fully transparent, 1-opaque)
        // ctx.globalAlpha = 0.8

        // this will put the modified pixels back into the canvas
        // thus showing the filter on the video
        ctx.putImageData(pixels, 0, 0)
    }, 16);
}

// the rgb values are stored inside a data array which again is stored inside pixels
// pixels.data[i] represents the red color intensity
// pixels.data[i+1] represents the green color intensity
// pixels.data[i+2] represents the blue color intensity
// to provide red color effect(filter) we will decrease the green and blue color intensity
function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i] = pixels.data[i] + 100;
        pixels.data[i + 1] = pixels.data[i + 1] - 100;
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5;
    }
    return pixels;
}

// for rgb split we are splitting the rgb across  the canvas
// pixels.data[i-150]=pixels.data[i] will replace whatever color(red,blue or green) value at pixels.data[i-150] with red value at pixels.data[i]
// pixels.data[i=100]=pixels.data[i] will replace whatever color(red,blue or green) value at pixels.data[i+100] with green value at pixels.data[i+1]
// pixels.data[i-120]=pixels.data[i] will replace whatever color(red,blue or green) value at pixels.data[i-120] with blue value at pixels.data[i+2]
function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i];
        pixels.data[i + 100] = pixels.data[i + 1];
        pixels.data[i - 120] = pixels.data[i + 2];
    }
    return pixels;
}

// it will give greenScreen functionality to the video
function greenScreen(pixels) {
    // levels will store the rmin,rmax,gmin,gmax,bmin,bmax value from the rgb class container
    // for e.g levels{
    //      rmin:128, gmin:128, bmin:128, bmax:128
    // }
    let levels = {};
    document.querySelectorAll(`.rgb input`).forEach(input => {
        levels[input.name] = input.value;
    })

    for (let i = 0; i < pixels.data.length; i++) {
        let red = pixels.data[i];
        let green = pixels.data[i + 1];
        let blue = pixels.data[i + 2];

            // if the rgb of the pixels from video lies between the min(rmin,gmin,bmin) and max(rmax,gmax,bmax) values
            // the alpha value for that pixel will be set to 0 
            if (red >= levels.rmin &&
                green >= levels.gmin &&
                blue >= levels.bmin &&
                red <= levels.rmax &&
                green <= levels.gmax &&
                blue <= levels.bmax) {
                pixels.data[i + 3] = 0;
            }
        }
    setInterval((levels)=>{
        console.log(levels);
    },1000)   
    return pixels;
}

// this func is used to take a snap of the video
function takePhoto() {
    // every time takePhoto button is pressed play the camera shutter(here snap) sound
    snap.currentTime = 0;
    snap.play();

    // canvas.toDataURL will return a long DOM string containing the data of the image from the video in jpeg format
    // image are displayed in a downloadable link of anchor tag
    // a counter is also implemented to identify which image is taken first
    // .setAttribute('download','cool-img') will make the link downloadable and set the downloaded file name to cool-img
    // strip.insertBefore(link,strip.firstChild) will
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'cool-img');
    link.innerHTML =
        `<img src ="${data}" alt = "Handsome Man ">
        <p>Image ${++imgCount}</p>`
    link.id=`img-${imgCount}`;

        
    // The image will be sorted by latest --> oldest
    strip.insertBefore(link,strip.firstChild);
    
    // To reverse the order de-comment the code below and comment the insertBefore() function

    // function insertAfter(newNode,referenceNode){
    //     referenceNode.parentNode.insertBefore(newNode,referenceNode.nextSibling);
    // }

    // if(imgCount == 1){
    //     strip.insertBefore(link, strip.firstChild);
    // }
    // else{
    //     const referenceNode=document.getElementById(`img-${imgCount-1}`)
    //     insertAfter(link,referenceNode);
    // }

}

// it will count how many image has been snaped/captured
let imgCount;

// start the video as soon as the page loads
window.onload = function () {
    imgCount = 0;
    getVideo();
}

// if the video feed is active(i.e it can play) then display it on the canvas
video.addEventListener('canplay', paintToCanvas);

