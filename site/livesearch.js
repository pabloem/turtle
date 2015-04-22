var items = people.nodes;
for(i = 0; i < people.nodes.length; i ++) {
    people.nodes[i] = people.nodes[i].name;
}

var he = new HanjaExplorer(items);

$(function(){ 
    var t = null; 
    $("#q").keyup(function(){ 
        if (t) { 
            clearTimeout(t); 
        } 
        t = setTimeout("searchQuery()", 400); 
    }); 
});

function searchQueryResult() {
    console.log(req.status);
    if(req.readyState == 4 && req.status == 200) {
        var res = eval(req.responseText);
        console.log(res);
        $("#results").html("");
        $.each(res, 
               function() {
                   var entry = "<li>"+this.english+"</li>";
                   $("#results").append(entry);
                   });
        
    }
}


var req = new XMLHttpRequest();
function searchQuery(){ 
    var q = $("#q").val().toLowerCase(); 
    if (q.length < 1) {
        return ;
    }
    scores = []; 
      
    if (q.length == 0) { 
        $("#results").html("");
    } else { 
        var q_str = 'query=search '+ q;
        req.open("GET","http://localhost:8090/runquery?"+q_str,true);
        req.onreadystatechange = searchQueryResult;
        req.send( null );

        $.each(items, function(){ 
            var score = this.toLowerCase().score(q); 
            if (score > 0) { 
                scores.push([score, this+""]); 
            } 
        });
        if (scores.length) {
            $("#results").html("");
            $.each(scores.sort(function(a, b){return b[0] - a[0];}), function(){ 
                var entry = "<li>" + this[1] +"</li>";
                $("#results").append(entry);
            });
            $('#results li').on('click',function(){
                var node_id = $(this).text();
                he.showNode({id: node_id, label: node_id, size: 20,
                            x: Math.random(), y: Math.random(), 
                            color: '#AAAAAA',
                           index: $(this).index()});
        });
        } else {
            $("#results").html("");
        } 
    }
}
