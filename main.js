const socket = io('https://rtc-start-kit-full.herokuapp.com/');

$('#div-chat').hide();

let customConfig = [];

// xirsys
$(function() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function($evt){
       if(xhr.readyState == 4 && xhr.status == 200){
           let res = JSON.parse(xhr.responseText);
           customConfig = res.v.iceServers.urls;
       }
    }
    xhr.open("PUT", "https://global.xirsys.net/_turn/lelinh47.github.io", true);
    xhr.setRequestHeader ("Authorization", "Basic " + btoa("lelinh47:03451670-5711-11ea-ae83-0242ac110004") );
    xhr.setRequestHeader ("Content-Type", "application/json");
    xhr.send( JSON.stringify({"format": "urls"}) );
 });

 // socket io
socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide(); 

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user =>{
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAI',() => alert('Vui long chon username khac!'));
 
function openStream() {
    const config = { audio: true, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}

function playLocalStream(idVideoTag, stream) {
    var video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

function playRemoteStream(idVideoTag, stream) {
    var video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

const peer = new Peer({
    key: 'peerjs', 
    host: 'lelinh.herokuapp.com', 
    secure: true, 
    port: 443,
    debug: 3,
    config: {
        iceServers: customConfig
    }
});

peer.on('open', id  => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', {ten: username, peerId: id});
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    // openStream()
    // .then(stream => {
    //     //playLocalStream('localStream', stream);
    //     const call = peer.call(id, stream);
    //     call.on('stream', otherStream => playRemoteStream('remoteStream', otherStream));
    // });

    //var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;
    const config = { audio: true, video: true};
    var stream = navigator.mediaDevices.getUserMedia(config);
    var call = peer.call(id, stream);
    call.on('stream', function(remote) {
            // Show stream in some video/canvas element.

            playRemoteStream('remoteStream', remote);
        });    
});


peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        //playLocalStream('localStream', stream);
        call.on('stream', otherStream => playRemoteStream('remoteStream', otherStream));
    });
});


$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
     openStream()
     .then(stream => {
         //playLocalStream('localStream', stream);
         const call = peer.call(id, stream);
        
         call.on('stream', otherStream => playRemoteStream('remoteStream', otherStream));
     }); 
});

