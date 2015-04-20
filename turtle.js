var GraphStructure = require('./GraphStructure.js'),
    QueryProcessor = require('./QueryProcessor.js');

var gs = new GraphStructure('kor_graph.graphml');

console.log(gs._graph.index['english']._nodes);
var n0 = gs.getNode(3,true);
/*console.log(n0);
for(var i=0; i<n0.neighbors.length; i++)
    console.log(gs.getNode(n0.neighbors[i]));*/
//var qp = new QueryProcessor({GraphStructure: gs});
