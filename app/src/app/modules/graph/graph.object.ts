import { NodeOptions, Visibility, GraphConfigModel, GraphData, GraphNode, NodeColorScheme, LinkOptions, LinkColorScheme } from './graph.model';

import { jLouvain } from 'jLouvain';

export class GraphConfig extends GraphConfigModel{

  showTags:boolean = false;
  nodes:NodeOptions = {
    defaultVisibility: Visibility.ON,
    displayNodesWithNoLinks: true,
    colorScheme: NodeColorScheme.GROUP
  };
  links:LinkOptions = {
    defaultVisibility: Visibility.ON,
    colorScheme: LinkColorScheme.GROUP
  };


  constructor(data:GraphConfig){
    super();
    Object.assign(this, data);
  }

  public apply(data:GraphData):GraphData{
    console.log(this);
    let nodeDict = {};
    data.nodes.forEach(x => nodeDict[x.id] = x);
    data.links.forEach(link => {
      const a = nodeDict[( (<GraphNode> link.source)?.id || <string>link.source)];
      const b = nodeDict[( (<GraphNode> link.target)?.id || <string>link.target)];
      if(!a || !b)return;
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);
      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });

    let nodes = new Set();
    data.nodes.forEach(x => {
      delete x["color"];
      if(x.group === "tag"){
        if(this.showTags)x.visibility = Visibility.ON;
        else x.visibility = Visibility.OFF;
      }
      else if(!this.nodes.displayNodesWithNoLinks && (x.neighbors?.filter(x => x.visibility != Visibility.OFF)?.length ?? 0) === 0)x.visibility = Visibility.OFF;
      else if(x.group in (this.nodes?.typeVisibility ?? {})){
        x.visibility = this.nodes.typeVisibility[x.group];
      }else{
        x.visibility = this.nodes.defaultVisibility;
      }
      if(x.visibility !== Visibility.OFF)nodes.add(x.id);
    });
    data.links.forEach(x => {
      if((!nodes.has((<GraphNode> x.source)?.id || x.source)) || (!nodes.has((<GraphNode> x.target)?.id || x.target)))x.visibility = Visibility.OFF;
      else if(x.group in (this.links.typeVisibility) || {}) x.visibility = this.links.typeVisibility[x.group];
      else x.visibility = this.links.defaultVisibility;
    });
    let community = jLouvain()
      .nodes(data.nodes.filter(x => x.visibility != Visibility.OFF && x.group != "tag").map(x => x.id))
      .edges(<any>data.links.filter(x => x.visibility != Visibility.OFF && x.group != "tagged")
        .map(x => {return{"source": (<any>x.source).id || x.source, "target":(<any>x.target).id || x.target}}));
    let communityResult = community();
    console.log(communityResult);
    for(let key in communityResult){
      nodeDict[key].cluster = communityResult[key];
    }
    return data;
  }

}

