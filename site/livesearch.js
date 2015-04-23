var hr = new HanjaReqs();
var he = new HanjaExplorer(hr);

$(function(){ 
    var t = null;
    $("#q").keyup(function(){ 
        if (t) { 
            clearTimeout(t); 
        } 
        t = setTimeout("livesearch()", 400); 
    }); 
});

function searchQueryResult() {
    console.log(hr.req.status);
    if(hr.req.readyState == 4 && hr.req.status == 200) {
        var res = eval(hr.req.responseText);
//        console.log(res);
        $("#results").html("");
        $.each(res, 
               function() {
                   $("#results").append(
                       $('<li>')
                           .data(this)
                           .append(this.english));
               });
        $('#results li').on('click',function(){
            var nod = $(this).data();

            // Might want to move this to the HanjaExplorer class

            he.showNode($(this).data());
        });
    }
};

function livesearch(){
    var q = $("#q").val().toLowerCase(); 
    if (q.length == 0) { 
        $("#results").html("");
    } else { 
        hr.searchRequest(q,searchQueryResult);
    }
};
