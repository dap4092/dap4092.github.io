"use strict";

var index = 0;
var captions = ["A screenshot of the program Pencil","A screenshot of the program Paint"];
var images = ["../images/pencil sample.png","../images/paint sample.png"];  
var clicked = false;

var pencil = '<img src="../images/pencil sample.png" width="700" height="379" alt="A screenshot of the program Pencil" />';


$(document).ready(function(){
$("#flipbox1").flippy({
verso: pencil,
depth:1
});


$("#next").on("click",function(e){
index++;
if(index >= images.length){
index = 0;
}
showImage();
});

$("#previous").on("click",function(e){
index--;
if(index < 0){
index = images.length-1;
}
showImage();
});
});

function showImage(){
var img = document.createElement("img");
var caption = captions[index];

img.src= images[index];
img.setAttribute("alt",caption);

img.onload = function(){
$("#description").text(caption);

$("#flipbox1").flippy({
verso: img,
depth:1
});
};
}