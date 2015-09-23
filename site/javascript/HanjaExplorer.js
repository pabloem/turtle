function addToSigma() {
    sigma.classes.graph.addMethod('neighbors', function(nodeId) {
        var k,
            neighbors = {},
            index = this.allNeighborsIndex[nodeId] || {};
        
        for (k in index)
            neighbors[k] = this.nodesIndex[k];
        
        return neighbors;
    });
}

var normalNodeColor = "#374258",
    normalEdgeColor = "#91ADD3",
    dimNodeColor = "#eee",
    labelThreshold = 8,
    midLabelThreshold = 4,
    lowLabelThreshold = 0;
var HanjaExplorer = function(hanjaRequester, config) {
    this._hr = hanjaRequester;
    addToSigma();
    this._r = new sigma('container');
    this._r.settings({/*
                      defaultNodeHoverColor: "#fff",
                      nodeHoverColor: "default",
                      defaultEdgeColor: "#91aecf",
                      edgeColor: "default",
                      borderSize: 2,
                      defaultNodeBorderColor: "#91aecf",*/
                      doubleTapTimeout: 1000});
    this._neighbor_scale = [7,10,13,16,19,25,33,45,60,80,110,160,200,5000];
    this.refresh();

    var he = this;
    this._r.bind('clickNode', function(e) {
        var node = e.data.node,
            nodeId = e.data.node.id,
            neighbors = he._r.graph.neighbors(nodeId);
        neighbors[nodeId] = node;
        he._highlightThese(neighbors);
        he._apTrack.clickNodeAction(he._details);
        he._showNodeDetails(node);
    });
    this._r.bind('doubleClickNode',function(e) {
        var node_id = e.data.node.id;
        he._highlightThese(); // On double click to a node, we reset to normal
        he._setFocus(node_id);
    });
    this._r.bind('clickStage',function(e) {
        he._highlightThese();
    });
    this._r.refresh();
    this._details = undefined;
    this._apTrack = new AppearanceTracker();
};

// If passed 'undefined' as argument, highlights all nodes.
HanjaExplorer.prototype._highlightThese = function(nodes) {
    var _this = this,
        hNodeCount = 0;
    this._r.graph.nodes().forEach(function(n) {
        if(!nodes || nodes[n.id]) {
            n.color = normalNodeColor;
            _this.setNodeLabel(n);
            hNodeCount += 1;
        } else {
            n.color = dimNodeColor;
            n.label = "";
        }
    });
    this._r.graph.edges().forEach(function(e) {
        if (!nodes || (nodes[e.source] && nodes[e.target])) {
            e.color = normalEdgeColor;
        } else {
            e.color = dimNodeColor;
        }
    });
    /* After adding the nodes, we set the threshold for the labels,
       which depends on the number of nodes highlighted - or wether all were */
    if(!nodes) this._r.settings({'labelThreshold':labelThreshold}); // On all nodes, label threshold is normal
    else {
        if(hNodeCount > 15) this._r.settings({'labelThreshold':midLabelThreshold});
        else this._r.settings({'labelThreshold':lowLabelThreshold});
    }
    this._r.refresh();
};
HanjaExplorer.prototype.clickBackButton = function() {
    var action = this._apTrack.popAction();
    if(!action) return ;
    if(action.prev_details) {
        this._fillInDetails(action.prev_details);
    }
    if(action.nodes && action.nodes.length > 0) {
        for(var i = 0; i < action.nodes.length; i++) {
            this._r.graph.dropNode(action.nodes[i]);
        }
        this._r.refresh();
    }
    if(action.search_box) {
        this._hr.searchRequest(action.search_box,searchQueryResult);
        searchBoxValue(action.search_box);
    }
};
HanjaExplorer.prototype._fillInDetails = function(details) {
    this._details = details;
    fillInDetails(details);
};
HanjaExplorer.prototype._displayRootInfo = function() {
    if(!(this._hr.req.readyState == 4 && this._hr.req.status == 200)) return;
    var res = eval(this._hr.req.responseText);
    if(res.length == 0) return;
    res = res[0];
    var det = {};
    det.main = res.chinese;
    if(res.radicals) {
        det.secondary = "Radicals: "+res.radicals;
    } else if (res.english) {
        det.secondary = res.english;
    }
    det.tertiary = res.meaning;
    this._fillInDetails(det);
    this._hr.searchRequest(res.chinese,searchQueryResult);
};
HanjaExplorer.prototype.displayRoot = function(root) {
    this._apTrack.clickRootAction(this._details,searchBoxValue());
    searchBoxValue(root);
    this._hr.rootRequest(root,this._displayRootInfo.bind(this));
};
HanjaExplorer.prototype._showNodeDetails = function(node) {
    var det = {};
    det.main = node.chinese.split("");
    det.secondary = node.korean;
    det.tertiary = node.english;
    this._fillInDetails(det);
};
HanjaExplorer.prototype.showNode = function(node,neighbors) {
    if("undefined" == typeof neighbors) neighbors = true;
    this._addNode(node);
    this._showNodeDetails(node);
    this._setFocus(node.id, neighbors);
};

HanjaExplorer.prototype._addExtraEdges = function(node){
    console.log("Adding edges for nodes already in the graph.");
    var ngs = this._r.graph.nodes(node.neighbors);
    for(var i=0; i<ngs.length; i++) {
        if("undefined" == typeof ngs[i]) continue;
        var from = node.id < ngs[i].id ? node.id : ngs[i].id;
        var to = node.id >= ngs[i].id ? node.id : ngs[i].id;
        this.addEdge(from, to);
    }
};

HanjaExplorer.prototype.setNodeLabel = function(node) {
    node.label = node.korean+" - "+this.cutEnglish(node.english);
};

HanjaExplorer.prototype.cutEnglish = function(english) {
    var commaIdx = english.indexOf(','),
        colonIdx = english.indexOf(';');
    var idx = (commaIdx == -1 || colonIdx == -1) ? Math.max(commaIdx,colonIdx) : Math.min(commaIdx,colonIdx);
    idx = idx == -1 ? english.lenght : idx;
    return english.substring(0,idx);
};

// Ready
HanjaExplorer.prototype._addNode = function(node) {
    var gr = this._r.graph.nodes(node['id']);
    if (gr) {
        // The node is already in the graph
        return ;
    }
    // The nodes don't come with SigmaJS properties added, so we add:
    node.x = Math.random();
    node.y = Math.random();
    node.size = 1;
    node.color = normalNodeColor;
    this.setNodeLabel(node);
    this._r.graph.addNode(node);
    if(node.neighbors) {
        this._addExtraEdges(node);
    }
    this.refresh();
};

// Ready
HanjaExplorer.prototype._configForceAtlasTimeout = function(sig, timeout) {
    console.log("Setting layout algorithm timeout: "+timeout);
    setTimeout(function() { 
        console.log("Stopping force atlas layout algorithm");
        sig.killForceAtlas2();},timeout);
    console.log("Set up timeout for ForceAtlas layout");
};

// Ready
HanjaExplorer.prototype.fixLayout = function(timeout) {
    if(!timeout) {
        timeout = 500;
    }
    if(this._r.isForceAtlas2Running()) {
        console.log("ForceAtlas algorithm is running at the moment.");
        return;
    }
    this._r.startForceAtlas2({worker: false, barnesHutOptimize: false,
                              iterationsPerRender: 1000});
    this._configForceAtlasTimeout(this._r,timeout);
};

// Not Ready
HanjaExplorer.prototype._dropNeighbors = function (node_id) {
    console.log("Dropping neighbors of " + node_id + " - not fully implemented.");
    var nd = this._r.graph.nodes(node_id);
    var nodes_to_remove = nd.neighbors;
    for(var i = 0; i < nodes_to_remove.length; i++) {
        if (nodes_to_remove[i] == this._focus) continue;
        if(!this._r.graph.nodes(nodes_to_remove[i])) continue;
        this._r.graph.dropNode(nodes_to_remove[i]);
    }
    this.refresh();
};

HanjaExplorer.prototype._setFocus = function(node_id, neighbors) {
    if("undefined" == typeof neighbors) neighbors = true;
    var old_focus = this._focus;
    this._focus = node_id;
//    if (old_focus) this._dropNeighbors(bye_focus);
    this._focus = node_id;
    if(neighbors) {
        this._addNeighbors(node_id);
    }
};

// Ready
HanjaExplorer.prototype.addEdge = function(from,to) {
    if (this._r.graph.edges(from+" "+to) || 
        this._r.graph.edges(to+" "+from)) {
        console.log("Edge " + from + " " + to + 
                    " is already in the graph");
        return ;
    }
    console.log("Adding edge: "+from+" "+to);
    var edge = {id: from+" "+to,
                source: from, 
                target: to,
                color: normalEdgeColor};
    this._r.graph.addEdge(edge);
    this.refresh();
};

HanjaExplorer.prototype._receiveAddNeighbors = function(node_id) {
    if(!(this._hr.req.readyState == 4 && this._hr.req.status == 200))
        return;
    var res = eval(this._hr.req.responseText);
    for(var i = 0; i < res.length; i++) {
        this._addNode(res[i]);
    }
    for(var j = 0; j < res.length; j++) {
        var from = node_id < res[j].id ? node_id : res[j].id;
        var to =  node_id >= res[j].id ? node_id : res[j].id;
        this.addEdge(from,to);
    }
    this.fixLayout();
};

HanjaExplorer.prototype._addNeighbors = function(node_id) {
    var nd = this._r.graph.nodes(node_id);
    if(!nd.neighbors) {
        console.log("Node has no neighbors. Can't add them.");
        return ;
    }
    var _this = this;
    if("undefined" == typeof nd.neighbor_scale) {
        nd.neighbor_scale = 0;
    }
    var start = nd.neighbor_scale > 0 ? this._neighbor_scale[nd.neighbor_scale - 1] : 0;
    var nb_list = 
            nd.neighbors.slice(start,
                               this._neighbor_scale[
                                   nd.neighbor_scale]);
    if(this._neighbor_scale[nd.neighbor_scale] > nd.neighbors.length) {
        return;
    }
    nd.neighbor_scale += 1;
    this._hr.nodeRequest(nb_list, 
                         function() {
                         _this._receiveAddNeighbors.bind(_this)(node_id);
                         });
    return ;
};

HanjaExplorer.prototype.clear = function() {
  //this._r.graph.clear();
  var nodes = this._r.graph.nodes();
  for(var i = 0; i < nodes.length; i++) {
    this._r.graph.dropNode(nodes[i].id);
  }
  this._apTrack.clear();
  this.refresh();
};

HanjaExplorer.prototype.refresh = function() {
    this._r.refresh();
};
