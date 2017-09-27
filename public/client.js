$(document).ready(function(){
  console.log('Page Loaded');
   
  var redirect = function(url){
    window.location.replace(url);
  }
  
    $('form').submit(function(event) {
    event.preventDefault();
    var searchStr = $('input').val();
    var search = "/api/search/" + searchStr;
    redirect(search);
    });
    
})