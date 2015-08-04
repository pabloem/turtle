var mobile = false;
function updateSize() {
    var pageWidth = $(window).width();  
    if ( !mobile && window.matchMedia('(max-width: 64em)').matches) {
        var info = $("#info"),
            new_info = $("#info").clone();
        info.remove();
        new_info.insertAfter("#list");
        mobile = true;
        return ;
    }
    if( mobile && window.matchMedia('(min-width: 64em)').matches) {
        var info = $("#info"),
            new_info = $("#info").clone();
        info.remove();
        new_info.insertAfter("#main");
        mobile = false;
        return ;
    }
}
jQuery(function($) {
    $(window).resize(updateSize).resize();
});
