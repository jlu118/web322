function fSubmitLogout()
{
    document.getElementById("formGallery").action = "/logout";
    document.getElementById("formGallery").submit();
}

function fSubmitphotoactive(){
    document.getElementById("formPhoto").action = "/photo";
    // document.getElementById("iphotoimg").value = 'name';
    document.getElementById("formPhoto").submit();
}



function fSubmitphotocansel(){
    alert("meybe next time!");
    
    document.getElementById("formGallery").action = "/gallery";
    document.getElementById("formGallery").submit();
}


function fSubmitphotobuy(){
    document.getElementById("formPhoto").action = "/photobuy";
    // document.getElementById("iphotoimg").value = 'name';
    document.getElementById("formPhoto").submit();
    
}