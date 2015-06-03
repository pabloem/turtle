$(document).ready(function() {
    var Width = $(window).width();
    Width = parseFloat(Width);
    var WidthSerch = Width*.60;            
    if(Width < 600 ) {
        $("#Logo").css("width", "180px");
        $("#PrincipalForm").css("border", "none");
        $("#PrincipalNav").css("border", "none");
    }
    $("#PrincipalSerch").width(WidthSerch);        
});

$( window ).resize(function() {
    var Width = $(window).width();
    var WidthSerch = Width*.60;     
    if(Width < 600 ) {
        $("#Logo").css("width", "180px");
        $("#PrincipalForm").css("border", "none");
        $("#PrincipalNav").css("border", "none");
    }
    $("#PrincipalSerch").width(WidthSerch);  
    
});

/* LITTLE ANIMATION ON NAVBAR ON-SCROLL */
$(window).scroll(function() {    
  'use strict';
      var scroll = $(window).scrollTop();

    if (scroll >= 100) {
        $("header .navbar").addClass("sticky");
    } else {
        $("header .navbar").removeClass("sticky");
    }
});
