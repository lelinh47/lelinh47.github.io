const socket = io('https://rtc-start-kit-full.herokuapp.com/');

$('#div-chat').hide();

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

if(!$xirsys) var $xirsys = new Object();
var _ice = $xirsys.ice = function (apiUrl, info) {
    this.apiUrl = !!apiUrl ? apiUrl : '/webrtc';
    //info can have TURN only filter.
    //console.log('*ice*  constructor: ',this.apiUrl);
    this.evtListeners = {};
    this.iceServers;
    if(!!this.apiUrl){
        this.doICE();//first get our token.
    }
}

_ice.prototype.onICEList = 'onICEList';

_ice.prototype.doICE = function () {
    console.log('*ice*  doICE: ',this.apiUrl);
    var own = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function($evt){
        if(xhr.readyState == 4 && xhr.status == 200){
            var res = JSON.parse(xhr.responseText);
            console.log('*ice*  response: ',res);
            own.iceServers = own.urlToUrls(res.v.iceServers);
            
            own.emit(own.onICEList);
        }
    }
    xhr.open("PUT", this.apiUrl+"/_turn", true);
    xhr.send();
}

//check for depricated RTCIceServer url property, needs to be urls now.
_ice.prototype.urlToUrls = function(arr){
    var l = arr.length, i;
    for(i=0; i<l; i++){
        var item = arr[i];
        var v = item.url;
        if(!!v){
            item.urls = v;
            delete item.url;
        }
    }
    return arr;
}

_ice.prototype.on = function(sEvent,cbFunc){
    //console.log('*ice*  on ',sEvent);
    if(!sEvent || !cbFunc) {
        console.log('error:  missing arguments for on event.');
        return false;
    }
    if(!this.evtListeners[sEvent]) this.evtListeners[sEvent] = [];
    this.evtListeners[sEvent].push(cbFunc);
}
_ice.prototype.off = function(sEvent,cbFunc){
    //console.log('off');
    this.evtListeners.push(cbFunc);
}

_ice.prototype.emit = function(sEvent, data){
    var handlers = this.evtListeners[sEvent];
    if(!!handlers) {
        var l = handlers.length;
        for(var i=0; i<l; i++){
            var item = handlers[i];
            item.apply(this,[{type:this.onICEList}]);
        }
    }
}

console.log('$xirsys.ice Loaded Successfuly!!!');
_ice = null;

let ice;
let iceServers;

$(function(){
    // Get Xirsys ICE (STUN/TURN)
    if(!ice){
        ice = new $xirsys.ice('/webrtc');
        ice.on(ice.onICEList, function (evt){
            console.log('onICE ',evt);
            if(evt.type == ice.onICEList){
                create(ice.iceServers);
            }
        });
    }
});

const peer = new Peer({
    key: 'peerjs', 
    host: 'lelinh.herokuapp.com', 
    secure: true, 
    port: 443,
    config: ice.iceServers
});

peer.on('open', id  => {
    $('#my-peer').append(id)
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
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

