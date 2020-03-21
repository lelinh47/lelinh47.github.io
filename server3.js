window.onload = function() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function($evt){
       if(xhr.readyState == 4 && xhr.status == 200){
           let res = JSON.parse(xhr.responseText);
           console.log("response: ",res);
       }
    }
    xhr.open("PUT", "https://global.xirsys.net/_turn/lelinh47.github.io", true);
    xhr.setRequestHeader ("Authorization", "Basic " + btoa("lelinh47:03451670-5711-11ea-ae83-0242ac110004") );
    xhr.setRequestHeader ("Content-Type", "application/json");
    xhr.send( JSON.stringify({"format": "urls"}) );
 }