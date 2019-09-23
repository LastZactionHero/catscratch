console.log('loaded')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: ,
  secretAccessKey: '
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: 'catscratch'}
});

s3.listObjects({Delimiter: '/'}, function(err, data) {
  console.log(err);
  console.log(data);
});



var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var videoStream = null;
var preLog = document.getElementById('preLog');

function log(text)
{
	if (preLog) preLog.textContent += ('\n' + text);
	else console.log(text);
}

function snapshot()
{
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	canvas.getContext('2d').drawImage(video, 0, 0);
}

function noStream()
{
	log('Access to camera was denied!');
}

function stop()
{
	var myButton = document.getElementById('buttonStop');
	if (myButton) myButton.disabled = true;
	myButton = document.getElementById('buttonSnap');
	if (myButton) myButton.disabled = true;
	if (videoStream)
	{
		if (videoStream.stop) videoStream.stop();
		else if (videoStream.msStop) videoStream.msStop();
		videoStream.onended = null;
		videoStream = null;
	}
	if (video)
	{
		video.onerror = null;
		video.pause();
		if (video.mozSrcObject)
			video.mozSrcObject = null;
		video.src = "";
	}
	myButton = document.getElementById('buttonStart');
	if (myButton) myButton.disabled = false;
}

function gotStream(stream)
{
	var myButton = document.getElementById('buttonStart');
	if (myButton) myButton.disabled = true;
	videoStream = stream;
	log('Got stream.');
	video.onerror = function ()
	{
		log('video.onerror');
		if (video) stop();
	};
	stream.onended = noStream;

  video.srcObject = stream;
  video.play();

  // if (window.webkitURL) video.src = window.webkitURL.createObjectURL(stream);
	// else if (video.mozSrcObject !== undefined)
	// {//FF18a
	// 	video.mozSrcObject = stream;
	// 	video.play();
	// }
	// else if (navigator.mozGetUserMedia)
	// {//FF16a, 17a
	// 	video.src = stream;
	// 	video.play();
	// }
	// else if (window.URL) video.src = window.URL.createObjectURL(stream);
  // else video.src = stream;

	myButton = document.getElementById('buttonSnap');
	if (myButton) myButton.disabled = false;
	myButton = document.getElementById('buttonStop');
	if (myButton) myButton.disabled = false;
}

function start()
{
	if ((typeof window === 'undefined') || (typeof navigator === 'undefined')) log('This page needs a Web browser with the objects window.* and navigator.*!');
	else if (!(video && canvas)) log('HTML context error!');
	else
	{
		log('Get user media…');
		if (navigator.getUserMedia) navigator.getUserMedia({video:true}, gotStream, noStream);
		else if (navigator.oGetUserMedia) navigator.oGetUserMedia({video:true}, gotStream, noStream);
		else if (navigator.mozGetUserMedia) navigator.mozGetUserMedia({video:true}, gotStream, noStream);
		else if (navigator.webkitGetUserMedia) navigator.webkitGetUserMedia({video:true}, gotStream, noStream);
		else if (navigator.msGetUserMedia) navigator.msGetUserMedia({video:true, audio:false}, gotStream, noStream);
		else log('getUserMedia() not available from your Web browser!');
	}
}

start();

function dataURItoBlob(dataURI) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

function upload() {
  setInterval(function(){
    snapshot()
    console.log('uploading')
    var canvas  = document.getElementById("canvas");
    var dataUrl = canvas.toDataURL("image/jpeg");
    var blobData = dataURItoBlob(dataUrl);
  
    s3.upload({
      Key: `${Date.now()}_1.jpg`,
      ContentType: 'image/jpeg',
      Body: blobData
    }, function(err, data) {
      if (err) {
        console.log('There was an error uploading your photo: ', err.message);
        return;
      }
      console.log('Successfully uploaded photo.');
    });
  }, 10000);
}