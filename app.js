//webkitURL is deprecated but nevertheless 
URL = window.URL || window.webkitURL;
var fd = new FormData();
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
var outputTxtarea=document.getElementById("punjabOutputText")
var timerSpan=document.getElementById("timerSpan")
outputTxtarea.value=" "

//global timer variable
var i=10;
var timer; //timer function variable 
var stopButtonTimer; // stop time variable
recordButton.addEventListener("click",startRecording);
function startRecording() { console.log("recordButton clicked"); 

var constraints = {
    audio: true,
    video: false
} 
/* Disable the record button until we get a success or fail from getUserMedia() */

recordButton.disabled = true;

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
    // timer function that will show time 
    timer=setInterval(function(){
        console.log(i)
        i--;
        timerSpan.textContent="Timer-"+i
    
    },1000) 
    stopButtonTimer=setInterval(stopRecording,10000)
    /* assign to gumStream for later use */
    gumStream = stream;
    /* use the stream */
    input = audioContext.createMediaStreamSource(stream);
    /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
    rec = new Recorder(input, {
        numChannels: 1
    }) 
    //start the recording process 
    rec.record()
    console.log("Recording started");
   
}).catch(function(err) {
    //enable the record button if getUserMedia() fails 
    recordButton.disabled = false;
});
}
function stopRecording() {
    clearInterval(timer)
    clearTimeout(stopButtonTimer)
    console.log("stopButton clicked");
    i=10;
    timerSpan.textContent="Timer-10"
    recordButton.disabled = false;
    //tell the recorder to stop the recording 
    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(createDownloadLink);
}
function createDownloadLink(blob) {
    console.log("i m called")
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    var filename = new Date().toISOString()+'.wav';
    var upload = document.createElement('a');
    upload.href = "#";
    upload.innerHTML = "Upload";
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token 971bbeef3f381f3bc4da5bbdeabb4abe44bc6f1b");
        var formdata = new FormData();
        formdata.append("language", "PB");
        formdata.append("audio_file",blob,filename);
        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
        };

    fetch("https://dev.liv.ai/liv_transcription_api/recordings/", requestOptions)
    .then(response => response.json())
    .then(result =>setPbiTxt(result))//sending received text function
    .catch(error => console.log('error', error));
    const setPbiTxt=function(pbiTxtObj){
        var punjabiOutputText=pbiTxtObj.transcriptions[0].utf_text;
        outputTxtarea.value=outputTxtarea.value+" "+punjabiOutputText;//set text to text area 
        
    }
}
