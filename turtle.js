var GraphStructure = require('./GraphStructure.js'),
    QueryProcessor = require('./QueryProcessor.js');

var gs = new GraphStructure('kor_graph.graphml');

//console.log(gs._graph.index['english']._nodes);
var n0 = gs.getNode(3,true);
/*console.log(n0);
for(var i=0; i<n0.neighbors.length; i++)
    console.log(gs.getNode(n0.neighbors[i]));*/
var qp = new QueryProcessor({GraphStructure: gs});

var query = {};
//query.terms = ['very','일','回'];
//query.terms = ['일주'];
query.terms = ['撤'];
qp._processSearchQuery(query);
console.log(query.res);
