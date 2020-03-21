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

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

// let ice;

// $(function(){
//     // Get Xirsys ICE (STUN/TURN)
//     if(typeof ice == 'undefined' || ice == null){
//         ice = new $xirsys.ice('/webrtc');
//         ice.on(ice.onICEList, function (evt){
//             console.log('onICE ',evt);
//             if(evt.type == ice.onICEList){
//                 create(ice.iceServers);
//             }
//         });
//         console.log('#1 '+ice.iceServers)
//     }
//     console.log('#2 '+ice.iceServers)
// });

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
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

