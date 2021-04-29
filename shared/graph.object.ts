import { jLouvain } from 'jlouvain';
import { GraphConfigModel, LinkOptions, NodeOptions, ShareSettings, VisualSettings } from './graph.config'
import { DisplayMode, ElementVisibility, LinkColorScheme, NodeColorScheme } from './graph.enum';
import { Graph, GraphNode } from './graph';

export class GraphConfig extends GraphConfigModel{

  showTags:boolean = false;
  addRootTag:boolean = false;
  nodes:NodeOptions = {
    defaultVisibility: ElementVisibility.ON,
    displayNodesWithNoLinks: true,
    colorScheme: NodeColorScheme.GROUP,
    displayDrafts: true,
    displayWip: true,
    displayPrivate: true,
    typeVisibility: {}
  };
  links:LinkOptions = {
    defaultVisibility: ElementVisibility.ON,
    colorScheme: LinkColorScheme.GROUP,
    typeVisibility: {}
  };
  visuals:VisualSettings = {
    nodeRelSize: 0.75,
    linkOpacity: 0.6,
    nodeOpacity: 0.7,
    displayMode: DisplayMode.NORMAL,
    textHeight: 10,
  }
  share:ShareSettings = {};


  constructor(data:GraphConfig){    
    super();
    this.mergeDeep(this, data);
  }

  public apply(data:Graph, addLink=true, deleteNotVisible=false):Graph{
    console.log(this);
    let nodeDict = {};
    data.nodes.forEach(x => nodeDict[x.id] = x);
    if(addLink) data.links.forEach(link => {
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
    let rootTagAdded = this.addRootTag && this.showTags && data.nodes.filter(x => x.id === "root-tag").length === 0;
    data.nodes.forEach(x => {
      if(x.type === "tag"){
        if(this.showTags)x.visibility = ElementVisibility.ON;
        else x.visibility = ElementVisibility.OFF;
        if(rootTagAdded)data.links.push({label:"Tagged",source:"root-tag",target:x.id,type:"tagged"});
      }
      else if(!this.nodes.displayDrafts && x.draft)x.visibility = ElementVisibility.OFF
      else if(!this.nodes.displayWip && x.wip)x.visibility = ElementVisibility.OFF
      else if(!this.nodes.displayPrivate && !x.public)x.visibility = ElementVisibility.OFF
      else if(!this.nodes.displayNodesWithNoLinks && (x.neighbors?.filter(x => x.visibility != ElementVisibility.OFF)?.length ?? 0) === 0)x.visibility = ElementVisibility.OFF;
      else if(x.type in (this.nodes?.typeVisibility ?? {})){
        x.visibility = this.nodes.typeVisibility[x.type];
      }else{
        x.visibility = this.nodes.defaultVisibility;        
        this.nodes.typeVisibility[x.type] = this.nodes.defaultVisibility;
      }
      if(x.visibility !== ElementVisibility.OFF)nodes.add(x.id);
    });
    if(rootTagAdded){
      let rootTag = {type:"tag",id:"root-tag",name:"Root Tag", visibility: this.showTags?ElementVisibility.ON:ElementVisibility.OFF};
      data.nodes.push(rootTag);
      nodes.add(rootTag.id);
    }
    if(deleteNotVisible){
      data.nodes = data.nodes.filter(x => x.visibility !== ElementVisibility.OFF);
    }
    data.links.forEach(x => {
      if((!nodes.has((<GraphNode> x.source)?.id || x.source)) || (!nodes.has((<GraphNode> x.target)?.id || x.target)))x.visibility = ElementVisibility.OFF;
      else if(x.type in (this.links?.typeVisibility ?? {})) x.visibility = this.links.typeVisibility[x.type];
      else{ 
        x.visibility = this.links.defaultVisibility;
        this.links.typeVisibility[x.type] = this.links.defaultVisibility;
      }
    });
    if(deleteNotVisible){
      data.links = data.links.filter(x => x.visibility !== ElementVisibility.OFF);
    }
    let community = jLouvain()
      .nodes(data.nodes.filter(x => x.visibility != ElementVisibility.OFF && x.type != "tag").map(x => x.id))
      .edges(<any>data.links.filter(x => x.visibility != ElementVisibility.OFF && x.type != "tagged")
        .map(x => {return{"source": (<any>x.source).id || x.source, "target":(<any>x.target).id || x.target}}));
    let communityResult = community() as {[key:string]: number};
    if(communityResult){
      let counts = Object.entries(communityResult).reduce((sums, entry) => {sums[entry[1]] = (sums[entry[1]] || 0) + 1; return sums;}, {});
      for(let key in communityResult){
        if(counts[communityResult[key]] <= 1){
          nodeDict[key].cluster = "Orphans"
        }else{
          nodeDict[key].cluster = "Cluster " + communityResult[key];
        }      
      }
    }    
    return data;
  }

  private isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  private mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return this.mergeDeep(target, ...sources);
  }
}

