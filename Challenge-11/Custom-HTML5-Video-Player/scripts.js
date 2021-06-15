// Get Our DOM Elements :

const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');

const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]')
const ranges = player.querySelectorAll('.player__slider');

const rewind = parseFloat(skipButtons[0].dataset.skip);
const forward = parseFloat(skipButtons[1].dataset.skip);

const fullScreen = document.querySelector('.fullscreen');

// Build our function :

// Video Play/Pause Function:
function togglePlay() {
    video.paused ? video.play() : video.pause();
}

//Function to update Play/Pause Button Icon :
function updatePlayButton() {
    const icon = this.paused ? "⏸️" : "▶️";
    toggle.innerHTML = icon;
}

// Video Skip Function:
function skip(skipTime) {
    // If the input is from keyboard
    if (typeof (skipTime) == "number") {
        video.currentTime += skipTime;
    }
    // If the input is from the On-Screen Button
    else {
        video.currentTime += parseFloat(this.dataset.skip);
    }
}

// Video Playback/Volume Control Function :
function handleUpdateRange(){
    video[this.name]=this.value;
}

// Video Progress Bar Update Function :
function handleUpdateProgress(){
    // percent will sync the length of the progress bar with currenTime of the video playing
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.flexBasis=`${percent}%`;
}

// Video Scrub Function :
function scrub(e){
    // scrubTime will get timestamp of the video for the given e.offsetX(i.e mouse positon on the progress div)
    const scrubTime = (e.offsetX/ progress.offsetWidth) * video.duration;

    // percent will match the progress bar length with positon of the e.offset(i.e mouse pointer ) as it move over the progress div
    const percent = (e.offsetX / progress.offsetWidth) * 100;
    progressBar.style.flexBasis=`${percent}%`;
    
    // changing the currentTime of the video to the scrubTime obtained from above
    video.currentTime = scrubTime;
    console.log(e);
}

// Function for Keyboard Controls:
function keydownFunction(e) {
    // If the key pressed is spacebar button
    if (e.keyCode === 32) {
        togglePlay();
    }
    // If the key pressed is left arrow button
    else if (e.keyCode === 37) {
        skip(rewind);
    }
    // If the key pressed is right arrow button
    else if (e.keyCode === 39) {
        skip(forward);
    }

}

// Function for requesting fullscreen mode:
function handleFullScreen(){
    video.requestFullscreen();
}

// HookUP the EVENT LISTENERS

// Listen for the on-screen Play/Pause buttons event
toggle.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

// Listen for the Play/Pause state of the video
video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);

// Listen for the Progress Bar of the Video 
video.addEventListener('timeupdate',handleUpdateProgress);

// Listen for the click on the Progress bar of the Video
let mousedown = false;
progress.addEventListener('click',scrub);
// On mousedown it will allow mousemove to also call the scrub function
// i.e By pressing and moving around progress bar we can scroll through video
progress.addEventListener('mousedown',() => mousedown = true);
progress.addEventListener('mousemove',(e) => mousedown && scrub(e));
// If mouse moves out of canvas(progress bar) or mouseup then stop the scrub and mousedown=false
progress.addEventListener('mouseup', () => mousedown = false);
progress.addEventListener('mouseleave', () => mousedown = false);

// Listen for the change in the Playback/Volume slider
ranges.forEach(range => range.addEventListener('mousemove',handleUpdateRange));

// Listen for the on-screen Skip buttons event.
skipButtons.forEach(button => button.addEventListener('click', skip));

// Listen for the keyboard control buttons event
document.addEventListener('keydown', keydownFunction);

// Listen for the click on the  FullScreen button event.
fullScreen.addEventListener('click',handleFullScreen);