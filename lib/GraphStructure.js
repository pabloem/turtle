var sax = require('sax'),
    fs = require('fs'),
    IndexBuilder = require('./IndexBuilder.js');

var GraphStructure = function(config) {
    this._node_attributes = 
        config.node_attributes || ['v_chinese','v_korean','v_english','v_meaning'];
    this._graph = {nodes: {'english':[], 'chinese':[], 'meaning':[],
                           'korean':[], 'neighbors': []},
                   id_to_index: {},
                   index: {}
                  };
    this._indexBuilders = 
        {"english": new IndexBuilder({split_on: " "}),
         "chinese": new IndexBuilder({split_per_char: true}),
         "korean" : new IndexBuilder({split_per_char: true})};

    this.loadGraph(config.graphFile);
    this.loadDictionary(config.dictFile);
};
GraphStructure.prototype.buildIndexes = function() {
    var indexes = ["english","chinese","korean"];
    for(var k=0; k<indexes.length; k++){
        this._graph.index[indexes[k]] = this._indexBuilders[indexes[k]].build();
    }
    delete this._graph.id_to_index;
    delete this._indexBuilders;
    console.log("Done building graph and indexes. Ready to run.");
};
GraphStructure.prototype.loadDictionary = function(filename) {
    var dic_list = JSON.parse(fs.readFileSync(filename,'utf8'));
    this._dictionary = {};
    for(var i=0; i<dic_list.length; i++) {
        this._dictionary[dic_list[i]['chinese']] = dic_list[i];
    }
};
GraphStructure.prototype.getRoot = function(label) {
    return this._dictionary[label];
};
GraphStructure.prototype.getNode = function(node_index,full_node) {
    var elems = ['english','chinese','korean','meaning'];
    if(full_node) elems.push('neighbors');
    var res = {id: node_index};
    for(var elm_i=0; elm_i<elems.length; elm_i++) {
        var label = elems[elm_i];
        res[label] = this._graph.nodes[label][node_index];
    }
    return res;
};
GraphStructure.prototype.loadGraph = function(filename) {
    var graph = this._graph;
    var indexBuilders = this._indexBuilders,
        _this = this;

    var parser = sax.createStream(true);
    var NODE = 0,
        EDGE = 1,
        N_ATTRIBUTE = 2,
        state = 0,
        cur_node,
        cur_attr,
        cur_edge,
        edges = 0;
    parser.onopentag = function(node) {
        if(node.name == 'node') {
            state = NODE;
            cur_node = node.attributes.id;
            graph.id_to_index[node.attributes.id] = graph.nodes.english.length;
            if(graph.nodes.english.length % 1000 == 0) {
                console.log("Nodes: "+graph.nodes.english.length);
            }
            cur_edge = undefined;
            graph.nodes.english.push('');
            graph.nodes.chinese.push('');
            graph.nodes.korean.push('');
            graph.nodes.neighbors.push([]);
        }
        if(node.name == 'edge') {
            state = EDGE;
            cur_node = undefined;
            graph.nodes.neighbors[
                graph.id_to_index[node.attributes.source]].push(
                    graph.id_to_index[node.attributes.target]);
            graph.nodes.neighbors[
                graph.id_to_index[node.attributes.target]].push(
                    graph.id_to_index[node.attributes.source]);
            if(++edges % 3000 == 0) {
                console.log("Edges: "+edges);
            }
        }
    };
    parser.onattribute = function(attr) {
        if(state == NODE &&
           _this._node_attributes.indexOf(attr.value) >= 0) {
            cur_attr = attr.value.replace("v_","");
        } else {
            cur_attr = undefined;
        }
    };
    parser.ontext = function(value){
        if(state == NODE && cur_node && cur_attr){
            graph.nodes[cur_attr][graph.id_to_index[cur_node]] = value;
            if(indexBuilders[cur_attr]) {
                indexBuilders[cur_attr].addElem(value, graph.id_to_index[cur_node]);
            }
            cur_attr = undefined;
        }
    };
    parser.on("closetag",function(tag) {
        if(tag == "graphml") {
            console.log("Ended loading the graph.");
            setImmediate(function() {_this.buildIndexes();});
        }
    });
    fs.createReadStream(filename, "utf-8").pipe(parser);
};

module.exports = GraphStructure;
