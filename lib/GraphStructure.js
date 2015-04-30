var sax = require('sax'),
    fs = require('fs'),
    IndexBuilder = require('./IndexBuilder.js');

var GraphStructure = function(config) {
    this._graph = {nodes: {'english':[], 'chinese':[],
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

    var indexes = ["english","chinese","korean"];
    for(var k=0; k<indexes.length; k++){
        this._graph.index[indexes[k]] = this._indexBuilders[indexes[k]].build();
    }
    delete this._graph.id_to_index;
    delete this._indexBuilders;
};
GraphStructure.prototype.loadDictionary = function(filename) {
    var dic_list = require(filename);
    this._dictionary = {};
    for(var i=0; i<dic_list.length; i++) {
        this._dictionary[dic_list[i]['chinese']] = dic_list[i];
    }
};
GraphStructure.prototype.getRoot = function(label) {
    return this._dictionary[label];
};
GraphStructure.prototype.getNode = function(node_index,full_node) {
    var elems = ['english','chinese','korean'];
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
    var indexBuilders = this._indexBuilders;
    var data = fs.readFileSync(filename, "utf-8");

    var parser = sax.parser(true);
    var NODE = 0,
        EDGE = 1,
        N_ATTRIBUTE = 2;
    var state = 0,
        cur_node,
        cur_attr,
        cur_edge;
    parser.onopentag = function(node) {
        if(node.name == 'node') {
            state = NODE;
            cur_node = node.attributes.id;
            graph.id_to_index[node.attributes.id] = graph.nodes.english.length;
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
        }
    };
    parser.onattribute = function(attr) {
        if(state == NODE &&
           ['v_chinese','v_korean','v_english'].indexOf(attr.value) >= 0) {
            cur_attr = attr.value.replace("v_","");
        } else {
            cur_attr = undefined;
        }
    };
    parser.ontext = function(value){
        if(state == NODE && cur_node && cur_attr){
            graph.nodes[cur_attr][graph.id_to_index[cur_node]] = value;
            indexBuilders[cur_attr].addElem(value, graph.id_to_index[cur_node]);
            cur_attr = undefined;
        }
    };        
    parser.write(data).close();
};

module.exports = GraphStructure;
