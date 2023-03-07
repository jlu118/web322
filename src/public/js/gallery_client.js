function fSubmitLogout()
{
    document.getElementById("formGallery").action = "/logout";
    document.getElementById("formGallery").submit();
}